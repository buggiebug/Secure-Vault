import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import todoApi from "../api/todoApi";

const initialState = {
    tasks: {}, // keyed by localId -> { id, date, title, type, sections, body, audioUri, audioDuration, createdAt, updatedAt }
    syncStatus: 'idle', // 'idle' | 'syncing' | 'success' | 'error'
    lastSyncedAt: null,
    syncError: null,
    offlineQueue: [], // Failed operations to retry
};

const DEFAULT_SECTIONS = [
    { id: 'todo', title: '', tasks: [] },
];

// ============= ASYNC THUNKS =============

/**
 * Fetch all todos from backend (on login)
 */
export const fetchTodosThunk = createAsyncThunk(
    'todo/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            console.log('[fetchTodosThunk] Fetching todos from backend...');
            const response = await todoApi.getAllTodos();
            console.log('[fetchTodosThunk] Fetch response:', response);
            return response.data || response; // Handle different response structures
        } catch (error) {
            console.error('[fetchTodosThunk] Fetch error:', error);
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Sync all local todos to backend
 */
export const syncTodosThunk = createAsyncThunk(
    'todo/syncTodos',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { todo } = getState();
            
            // 1. Process deletions first
            const deletedNotes = todo.offlineQueue.filter(item => item.action === 'delete').map(item => item.noteId);
            const deletedIds = [...new Set(deletedNotes)];

            for (const delId of deletedIds) {
                try {
                    await todoApi.deleteTodo(delId);
                } catch (e) {
                    console.error('[syncTodosThunk] Failed to delete todo on server:', delId, e);
                }
            }
            
            // 2. Identify created/updated notes to sync
            const modifiedNotes = todo.offlineQueue
                .filter(item => item.action === 'create' || item.action === 'update')
                .map(item => item.noteId);
            const notesToSyncIds = [...new Set(modifiedNotes)];

            // Only map tasks that have pending changes
            const todosArray = notesToSyncIds
                .map(id => todo.tasks[id])
                .filter(Boolean) // Filter out deleted or missing tasks
                .map(task => ({
                    localId: task.id,
                    date: task.date,
                    title: task.title,
                    type: task.type,
                    sections: task.sections,
                    body: task.body,
                    audioUri: task.audioUri,
                    audioDuration: task.audioDuration,
                    updatedAt: task.updatedAt,
                }));

            console.log('[syncTodosThunk] Syncing todos:', todosArray.length, 'todos');
            
            let response;
            if (todosArray.length > 0) {
                response = await todoApi.syncTodos(todosArray);
            } else {
                // If nothing to sync but we still want to fetch changes from other devices
                const allTodos = await todoApi.getAllTodos();
                response = { syncResults: { synced: [], conflicts: [], errors: [] }, allTodos };
            }
            
            console.log('[syncTodosThunk] Sync response received.');
            return response.data || response;
        } catch (error) {
            console.error('[syncTodosThunk] Sync error:', error);
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Create todo with backend sync
 */
export const createTodoThunk = createAsyncThunk(
    'todo/createTodo',
    async (todoData, { rejectWithValue }) => {
        try {
            const response = await todoApi.createTodo(todoData);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Update todo with backend sync
 */
export const updateTodoThunk = createAsyncThunk(
    'todo/updateTodo',
    async ({ localId, todoData }, { rejectWithValue }) => {
        try {
            const response = await todoApi.updateTodo(localId, todoData);
            return { localId, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

/**
 * Delete todo with backend sync
 */
export const deleteTodoThunk = createAsyncThunk(
    'todo/deleteTodo',
    async (localId, { rejectWithValue }) => {
        try {
            const response = await todoApi.deleteTodo(localId);
            return { localId, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// ============= SLICE =============

const todoSlice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        // Migration helper: Call this on app start
        migrateLegacyData: (state) => {
            const keys = Object.keys(state.tasks);
            keys.forEach(key => {
                // Simple regex for YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
                    // It's a date key, migrate it
                    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                    const oldData = state.tasks[key];

                    // Create new structure
                    state.tasks[newId] = {
                        id: newId,
                        date: key, // Use the key as the date
                        createdAt: Date.now(), // Set migration time as creation time
                        updatedAt: Date.now(),
                        title: '', // No title for legacy
                        type: 'list',
                        sections: oldData.sections || [],
                        body: ''
                    };

                    // Clean up legacy fallback
                    if (!state.tasks[newId].sections || state.tasks[newId].sections.length === 0) {
                        state.tasks[newId].sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
                    }

                    // Delete old key
                    delete state.tasks[key];

                    // Queue for background sync
                    state.offlineQueue.push({ action: 'create', noteId: newId });
                }
            });
        },

        addNote: (state, action) => {
            const { date, title, type } = action.payload;
            const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            const now = Date.now();
            state.tasks[newId] = {
                id: newId,
                date: date,
                createdAt: now,
                updatedAt: now,
                type: type || 'list',
                title: title || "",
                sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS)),
                body: ""
            };

            // Queue for background sync
            state.offlineQueue.push({ action: 'create', noteId: newId });
        },

        // Helper to add note with specific ID (generated by UI)
        createNote: (state, action) => {
            const { id, date, title, type } = action.payload;
            const now = Date.now();
            state.tasks[id] = {
                id,
                date,
                createdAt: now,
                updatedAt: now,
                type: type || 'list',
                title: title || "",
                sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS)),
                body: ""
            };

            // Queue for background sync
            state.offlineQueue.push({ action: 'create', noteId: id });
        },

        updateNoteTitle: (state, action) => {
            const { noteId, title } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].title = title;
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        updateNoteAudio: (state, action) => {
            const { noteId, audioUri, audioDuration } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].audioUri = audioUri;
                state.tasks[noteId].audioDuration = audioDuration;
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        updateNoteBody: (state, action) => {
            const { noteId, body } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].body = body;
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        updateNoteDate: (state, action) => {
            const { noteId, date } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].date = date;
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        addSection: (state, action) => {
            const { noteId, title } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].sections.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    title,
                    tasks: []
                });
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        updateSectionTitle: (state, action) => {
            const { noteId, sectionId, title } = action.payload;
            if (state.tasks[noteId]) {
                const section = state.tasks[noteId].sections.find(s => s.id === sectionId);
                if (section) section.title = title;
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        deleteSection: (state, action) => {
            const { noteId, sectionId } = action.payload;
            if (state.tasks[noteId]) {
                state.tasks[noteId].sections = state.tasks[noteId].sections.filter(s => s.id !== sectionId);
                state.tasks[noteId].updatedAt = Date.now();

                // Queue for background sync
                state.offlineQueue.push({ action: 'update', noteId });
            }
        },

        addTask: (state, action) => {
            const { noteId, sectionId, text, time } = action.payload;
            if (state.tasks[noteId]) {
                const section = state.tasks[noteId].sections.find(s => s.id === sectionId);
                if (section) {
                    section.tasks.push({
                        id: Date.now().toString(),
                        text,
                        time,
                        completed: false,
                    });
                    state.tasks[noteId].updatedAt = Date.now();

                    // Queue for background sync
                    state.offlineQueue.push({ action: 'update', noteId });
                }
            }
        },

        toggleTask: (state, action) => {
            const { noteId, sectionId, id } = action.payload;
            if (state.tasks[noteId]) {
                const section = state.tasks[noteId].sections.find(s => s.id === sectionId);
                if (section) {
                    const task = section.tasks.find(t => t.id === id);
                    if (task) task.completed = !task.completed;
                    state.tasks[noteId].updatedAt = Date.now();

                    // Queue for background sync
                    state.offlineQueue.push({ action: 'update', noteId });
                }
            }
        },

        updateTask: (state, action) => {
            const { noteId, sectionId, id, text, time } = action.payload;
            if (state.tasks[noteId]) {
                const section = state.tasks[noteId].sections.find(s => s.id === sectionId);
                if (section) {
                    const task = section.tasks.find(t => t.id === id);
                    if (task) {
                        if (text !== undefined) task.text = text;
                        if (time !== undefined) task.time = time;
                        state.tasks[noteId].updatedAt = Date.now();

                        // Queue for background sync
                        state.offlineQueue.push({ action: 'update', noteId });
                    }
                }
            }
        },

        deleteTask: (state, action) => {
            const { noteId, sectionId, id } = action.payload;
            if (state.tasks[noteId]) {
                const section = state.tasks[noteId].sections.find(s => s.id === sectionId);
                if (section) {
                    section.tasks = section.tasks.filter(t => t.id !== id);
                    state.tasks[noteId].updatedAt = Date.now();

                    // Queue for background sync
                    state.offlineQueue.push({ action: 'update', noteId });
                }
            }
        },

        // Remove entire note if needed
        deleteNote: (state, action) => {
            const { noteId } = action.payload;
            delete state.tasks[noteId];

            // Queue for background sync
            state.offlineQueue.push({ action: 'delete', noteId });
        },

        // Clear offline queue after successful sync
        clearOfflineQueue: (state) => {
            state.offlineQueue = [];
        },

        // Reset sync error
        clearSyncError: (state) => {
            state.syncError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch todos
            .addCase(fetchTodosThunk.pending, (state) => {
                state.syncStatus = 'syncing';
                state.syncError = null;
            })
            .addCase(fetchTodosThunk.fulfilled, (state, action) => {
                state.syncStatus = 'success';
                state.lastSyncedAt = Date.now();

                // Merge backend todos with local todos
                const backendTodos = action.payload;
                if (Array.isArray(backendTodos)) {
                    backendTodos.forEach(todo => {
                        const localId = todo.localId || todo._id;
                        // Only update if backend version is newer or doesn't exist locally
                        if (!state.tasks[localId] || new Date(todo.updatedAt) > new Date(state.tasks[localId].updatedAt)) {
                            state.tasks[localId] = {
                                id: localId,
                                date: todo.date,
                                title: todo.title,
                                type: todo.type,
                                sections: todo.sections,
                                body: todo.body,
                                audioUri: todo.audioUri,
                                audioDuration: todo.audioDuration,
                                createdAt: new Date(todo.createdAt).getTime(),
                                updatedAt: new Date(todo.updatedAt).getTime(),
                            };
                        }
                    });
                }
            })
            .addCase(fetchTodosThunk.rejected, (state, action) => {
                state.syncStatus = 'error';
                state.syncError = action.payload;
            })

            // Sync todos
            .addCase(syncTodosThunk.pending, (state) => {
                state.syncStatus = 'syncing';
                state.syncError = null;
            })
            .addCase(syncTodosThunk.fulfilled, (state, action) => {
                state.syncStatus = 'success';
                state.lastSyncedAt = Date.now();
                state.offlineQueue = []; // Clear queue on successful sync

                // Handle sync results and conflicts
                const { syncResults, allTodos } = action.payload;

                // Merge backend todos (handle conflicts)
                if (Array.isArray(allTodos)) {
                    allTodos.forEach(todo => {
                        const localId = todo.localId || todo._id;
                        // Update with backend version if it's newer
                        if (!state.tasks[localId] || new Date(todo.updatedAt) > new Date(state.tasks[localId].updatedAt)) {
                            state.tasks[localId] = {
                                id: localId,
                                date: todo.date,
                                title: todo.title,
                                type: todo.type,
                                sections: todo.sections,
                                body: todo.body,
                                audioUri: todo.audioUri,
                                audioDuration: todo.audioDuration,
                                createdAt: new Date(todo.createdAt).getTime(),
                                updatedAt: new Date(todo.updatedAt).getTime(),
                            };
                        }
                    });
                }
            })
            .addCase(syncTodosThunk.rejected, (state, action) => {
                state.syncStatus = 'error';
                state.syncError = action.payload;
            })

            // PURGE (logout)
            .addCase(PURGE, (state) => {
                return initialState;
            });
    },
});

export const {
    createNote, addNote, updateNoteTitle, updateNoteDate, deleteNote, updateNoteBody, updateNoteAudio,
    addTask, toggleTask, deleteTask, updateTask, addSection, deleteSection, updateSectionTitle,
    migrateLegacyData, clearOfflineQueue, clearSyncError
} = todoSlice.actions;

export default todoSlice.reducer;
