import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteNote } from '../../redux/slice/todoSlice';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo, strictly use @expo/vector-icons or similar if available. 
// If not using Expo, use standard icons. The user previously used IconSymbol wrapper? 
// Let's stick to simple text or check what's available. 
// "IconSymbol" was used in tabs layout.
// Let's use standard unicode or simple views if unsure, but user environment implies expo/RN.
// To be safe, I'll use simple Text "+" for FAB or try to use common library if I saw it.
// I saw "IconSymbol" in `app/(tabs)/_layout.tsx`.

const NotesList = ({ onOpen, onCreate }) => {
    const tasks = useSelector(state => state.todo.tasks);
    const dispatch = useDispatch();
    
    // Sort notes descending by date (newest first), then by last modified time (recently edited first)
    const sortedNotes = useMemo(() => {
        return Object.values(tasks).sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) return dateDiff;
            
            // If dates are same, recently modified goes first
            const bTime = b.updatedAt || b.createdAt || 0;
            const aTime = a.updatedAt || a.createdAt || 0;
            return bTime - aTime;
        });
    }, [tasks]);

    const renderItem = ({ item: note }) => {
        let total = 0;
        let completed = 0;
        
        // Handle new structure (sections array)
        if (note.sections && Array.isArray(note.sections)) {
            note.sections.forEach(section => {
                if (section.tasks) {
                    total += section.tasks.length;
                    completed += section.tasks.filter(t => t.completed).length;
                }
            });
        } else {
             // Fallback unlikely needed after migration, but safe to have
            total = (note.must_do?.length || 0) + (note.can_do?.length || 0) + (note.dont_do?.length || 0);
        }
        

        
        const isCompleted = total > 0 && completed === total;
        
        // Date formatting
        const dateObj = new Date(note.updatedAt || note.createdAt || note.date);
        const dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const fullTimestamp = `${dateString} • ${timeString}`;

        const title = note.title ? note.title : "Untitled Note";

        // Icon based on type
        let typeIcon = "📄";
        if (note.type === 'list') typeIcon = "✅";
        else if (note.type === 'text') typeIcon = "📝";
        else if (note.type === 'audio') typeIcon = "🎙️";

        const handleDelete = () => {
             Alert.alert(
                "Delete Note",
                "Are you sure you want to delete this entire note?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: () => dispatch(deleteNote({ noteId: note.id })) 
                    }
                ]
            );
        };

        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => onOpen(note.id)}
                onLongPress={handleDelete}
                delayLongPress={500}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                         <Text style={styles.typeIcon}>{typeIcon}</Text>
                         <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
                    </View>
                </View>
                
                <Text style={styles.dateText}>{fullTimestamp}</Text>

                <View style={styles.footer}>
                     {(note.type === 'list' || !note.type) && (
                        <Text style={[styles.countBadge, isCompleted && styles.completedBadge]}>
                            {isCompleted ? "✓ " : ""}{total} Tasks
                        </Text>
                     )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={sortedNotes}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notes yet. Tap + to create one.</Text>
                    </View>
                }
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />
            
            <TouchableOpacity style={styles.fab} onPress={onCreate}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80, // Space for FAB
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '48%', // For 2 column grid
    },
    cardHeader: {
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    typeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    titleText: {
        fontSize: 16, // Slightly smaller for grid
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    countBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 10,
        color: '#666',
        overflow: 'hidden',
        alignSelf: 'flex-start', // Don't stretch
    },
    completedBadge: {
        backgroundColor: '#d4edda', // Light green
        color: '#155724', // Dark green text
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#aaa',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: 'white',
        marginTop: -4, // Center align vertically better
    }
});

export default NotesList;
