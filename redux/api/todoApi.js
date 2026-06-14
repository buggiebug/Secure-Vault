import axiosInstance from './axiosInstance';

/**
 * Todo API service for backend communication
 */
export const todoApi = {
    /**
     * Bulk sync todos to backend
     * @param {Array} todos - Array of todo objects to sync
     * @returns {Promise} Sync results and all todos from backend
     */
    syncTodos: async (todos) => {
        const response = await axiosInstance.post('/api/todo/todos/sync', { todos });
        return response.data;
    },

    /**
     * Get all todos for logged-in user
     * @returns {Promise} Array of todos
     */
    getAllTodos: async () => {
        const response = await axiosInstance.get('/api/todo/todos');
        return response.data;
    },

    /**
     * Create a new todo
     * @param {Object} todo - Todo object to create
     * @returns {Promise} Created todo
     */
    createTodo: async (todo) => {
        const response = await axiosInstance.post('/api/todo/todos', todo);
        return response.data;
    },

    /**
     * Update existing todo
     * @param {string} localId - Local ID of the todo
     * @param {Object} todo - Updated todo data
     * @returns {Promise} Update result
     */
    updateTodo: async (localId, todo) => {
        const response = await axiosInstance.put(`/api/todo/todos/${localId}`, todo);
        return response.data;
    },

    /**
     * Delete todo
     * @param {string} localId - Local ID of the todo to delete
     * @returns {Promise} Delete result
     */
    deleteTodo: async (localId) => {
        const response = await axiosInstance.delete(`/api/todo/todos/${localId}`);
        return response.data;
    },

    /**
     * Get single todo by localId
     * @param {string} localId - Local ID of the todo
     * @returns {Promise} Todo object
     */
    getTodoById: async (localId) => {
        const response = await axiosInstance.get(`/api/todo/todos/${localId}`);
        return response.data;
    }
};

export default todoApi;
