import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateNoteTitle, updateNoteBody } from '../../redux/slice/todoSlice';
import { Ionicons } from '@expo/vector-icons';

const TextNote = ({ noteId, onBack }) => {
    const dispatch = useDispatch();
    const noteData = useSelector((state) => state.todo.tasks[noteId]);

    if (!noteData) {
        return (
            <View style={styles.centerContainer}>
                <Text>Note not found</Text>
                <TouchableOpacity onPress={onBack}><Text style={{color: 'blue'}}>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    const { title, body } = noteData;

    const onTitleChange = (text) => {
        dispatch(updateNoteTitle({ noteId, title: text }));
    };

    const onBodyChange = (text) => {
        dispatch(updateNoteBody({ noteId, body: text }));
    };

    return (
        <View style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={100}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                     {/* Title in Body */}
                     <TextInput 
                        style={styles.titleInput}
                        value={title}
                        onChangeText={onTitleChange}
                        placeholder="Title"
                        placeholderTextColor="#aaa"
                    />

                    <TextInput
                        style={styles.bodyInput}
                        value={body}
                        onChangeText={onBodyChange}
                        placeholder="Start typing..."
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffdf9', // Match warm tone if desired, or keep white. Audio is #fffdf9. Let's match Audio.
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        // No border, clean like Audio
    },
    backButton: {
        paddingHorizontal: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 200,
    },
    titleInput: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    bodyInput: {
        fontSize: 18,
        color: '#333',
        lineHeight: 24,
        minHeight: 200,
    },
});

export default TextNote;
