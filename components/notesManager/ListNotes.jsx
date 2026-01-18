import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
    KeyboardAvoidingView
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    addTask, deleteTask, toggleTask, updateTask, addSection,
    updateNoteTitle, updateNoteDate, updateSectionTitle, deleteSection
} from "../../redux/slice/todoSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

const TaskRow = ({ task, onToggle, onDelete, onUpdate, onTimePress }) => {
    return (
        <View style={styles.taskRow}>
            {/* Checkbox Column */}
            <TouchableOpacity onPress={() => onToggle(task.id)} style={styles.checkboxContainer}>
                <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
            </TouchableOpacity>

            {/* Task Text Input Column */}
            <View style={styles.taskTextContainer}>
                <TextInput
                    style={[styles.taskInput, task.completed && styles.completedText]}
                    value={task.text}
                    onChangeText={(text) => onUpdate(task.id, text, task.time)}
                    placeholder=""
                    multiline={true}
                />
            </View>

            {/* Time Column (vertical separator built-in via border) */}
            <View style={styles.timeContainer}>
                <TouchableOpacity onPress={() => onTimePress(task.id)} style={styles.timeInputBtn}>
                    <Text style={styles.timeText}>{task.time}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const SectionHeader = ({ title, onUpdate, onDelete }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.bulletPoint} />
        <TextInput
            style={styles.sectionTitleInput}
            value={title}
            onChangeText={onUpdate}
            placeholder="Section Name"
        />
        <TouchableOpacity onPress={onDelete} style={styles.deleteSectionBtn}>
            <Text style={styles.deleteSectionIcon}>🗑️</Text>
        </TouchableOpacity>
    </View>
);

const ListNotes = ({ noteId, onBack }) => {
    const dispatch = useDispatch();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
    const [activeTimeTask, setActiveTimeTask] = useState(null); // { sectionId, taskId }

    const noteData = useSelector((state) => state.todo.tasks[noteId]);

    // Guard against missing data (deleted or error)
    if (!noteData) {
        return (
            <View style={styles.centerContainer}>
                <Text>Note not found</Text>
                <TouchableOpacity onPress={onBack}><Text style={{ color: 'blue' }}>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    const { date, title, sections } = noteData;
    const dateObj = new Date(date);

    // Format for display
    const displayDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const displayDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const handleAddTask = (sectionId) => {
        dispatch(addTask({
            noteId,
            sectionId,
            text: "",
            time: ""
        }));
    };

    const handleUpdate = (sectionId, id, text, time) => {
        dispatch(updateTask({ noteId, sectionId, id, text, time }));
    };

    const handleDelete = (sectionId, id) => {
        dispatch(deleteTask({ noteId, sectionId, id }));
    };

    const handleToggle = (sectionId, id) => {
        dispatch(toggleTask({ noteId, sectionId, id }));
    }

    const [newSectionName, setNewSectionName] = useState("");
    const [isAddingSection, setIsAddingSection] = useState(false);

    const handleAddSection = () => {
        if (newSectionName.trim()) {
            dispatch(addSection({ noteId, title: newSectionName.trim() }));
            setNewSectionName("");
            setIsAddingSection(false);
        }
    };


    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            if (pickerMode === 'date') {
                dispatch(updateNoteDate({ noteId, date: selectedDate.toISOString().split('T')[0] }));
            } else if (pickerMode === 'time' && activeTimeTask) {
                const timeString = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                dispatch(updateTask({
                    noteId,
                    sectionId: activeTimeTask.sectionId,
                    id: activeTimeTask.taskId,
                    time: timeString
                }));
                // Close picker after selection if not iOS (iOS keeps it open usually, but let's mimic date behavior)
                if (Platform.OS !== 'ios') {
                    setActiveTimeTask(null);
                }
            }
        } else {
            // Cancelled
            if (pickerMode === 'time') setActiveTimeTask(null);
        }
    };

    const handleTimePress = (sectionId, taskId) => {
        setPickerMode('time');
        setActiveTimeTask({ sectionId, taskId });
        setShowDatePicker(true);
    };

    const handleDatePress = () => {
        setPickerMode('date');
        setShowDatePicker(true);
    };

    const onTitleChange = (text) => {
        dispatch(updateNoteTitle({ noteId, title: text }));
    }

    return (
        <View style={styles.paper}>
            {/* Red Margin Line */}
            <View style={styles.redMarginLine} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Context Header with Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <TextInput
                                style={styles.headerTitleInput}
                                value={title}
                                onChangeText={onTitleChange}
                                placeholder="Untitled Note"
                                placeholderTextColor="#aaa"
                            />
                            <View style={styles.doubleUnderline} />
                        </View>
                    </View>

                    {/* Date and Day Row */}
                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={handleDatePress} style={styles.dateField}>
                            <Text style={styles.label}>Date - </Text>
                            <Text style={styles.value}>{displayDate}</Text>
                        </TouchableOpacity>
                        <View style={styles.dateField}>
                            <Text style={styles.label}>Day - </Text>
                            <Text style={styles.value}>{displayDay}</Text>
                        </View>
                    </View>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dateObj}
                            mode={pickerMode}
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    {/* Table Header Row (Implicit in design but helps alignment) */}
                    <View style={styles.tableHeaderRow}>
                        <View style={{ width: 40 }} />
                        <View style={{ flex: 1 }} />
                        <Text style={styles.colHeader}>Time</Text>
                    </View>

                    {/* Sections */}
                    {sections.map((section) => (
                        <View key={section.id} style={styles.section}>
                            <SectionHeader
                                title={section.title}
                                onUpdate={(text) => dispatch(updateSectionTitle({ noteId, sectionId: section.id, title: text }))}
                                onDelete={() => {
                                    Alert.alert(
                                        "Delete Section",
                                        "Are you sure you want to delete this section and all its tasks?",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Delete", style: "destructive", onPress: () => dispatch(deleteSection({ noteId, sectionId: section.id })) }
                                        ]
                                    );
                                }}
                            />

                            {/* Tasks */}
                            {section.tasks.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onToggle={(id) => handleToggle(section.id, id)}
                                    onDelete={(id) => handleDelete(section.id, id)}
                                    onUpdate={(id, text, time) => handleUpdate(section.id, id, text, time)}
                                    onTimePress={(id) => handleTimePress(section.id, id)}
                                />
                            ))}

                            {/* Add Line Button */}
                            <TouchableOpacity onPress={() => handleAddTask(section.id)} style={styles.addRow}>
                                <Text style={styles.addText}>+ Add Line</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add New Section Controls */}
                    <View style={styles.addSectionContainer}>
                        {isAddingSection ? (
                            <View style={styles.newSectionInputContainer}>
                                <TextInput
                                    style={styles.newSectionInput}
                                    placeholder="Enter Header Name..."
                                    value={newSectionName}
                                    onChangeText={setNewSectionName}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={handleAddSection} style={styles.saveSectionBtn}>
                                    <Text style={styles.saveSectionText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsAddingSection(false)} style={styles.cancelSectionBtn}>
                                    <Text style={styles.cancelSectionText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setIsAddingSection(true)} style={styles.addSectionBtn}>
                                <Text style={styles.addSectionBtnText}>+ Add New Header</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    paper: {
        flex: 1,
        backgroundColor: '#fff', // Or a slight off-white #fdfbf7
        position: 'relative',
    },
    scrollContent: {
        paddingTop: 20,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 200, // Extra space for keyboard
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative', // For absolute back button if needed, but flex row is better if we want it inline.
        // Actually current structure nests titleContainer inside header.
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 10,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#6C63FF',
        fontWeight: 'bold',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 5,
    },
    headerTitleInput: {
        fontSize: 24,
        fontFamily: Platform.OS === 'ios' ? 'Noteworthy-Bold' : 'Roboto',
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 200,
    },
    doubleUnderline: {
        height: 3,
        width: 120,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#555',
        marginTop: 2,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingLeft: 50, // Push past margin
        marginBottom: 20,
    },
    dateField: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    value: {
        fontSize: 16,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        minWidth: 80,
        textAlign: 'center',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingLeft: 50,
        paddingRight: 10,
        marginBottom: 5,
    },
    colHeader: {
        width: 70,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 50, // Past margin
        marginBottom: 10,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#333',
        marginRight: 10,
    },
    sectionTitleInput: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
        flex: 1,
        padding: 0,
    },
    deleteSectionBtn: {
        padding: 5,
        marginLeft: 10,
    },
    deleteSectionIcon: {
        fontSize: 14,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#aec6cf', // Notebook line blue
        backgroundColor: 'transparent',
        paddingVertical: 5,
    },
    checkboxContainer: {
        width: 40, // Left of margin
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2, // Above red line
        backgroundColor: '#fff', // Hide red line behind checkbox? No, red line is at 40px left.
        // Actually the red margin is at x=40. 
        // Checkbox should be left of it (0-40) or right?
        // In the image, checkboxes are Left of the main text area.
        // Let's assume red line is the divider.
        // So Checkbox is IN the margin area? No, usually margin is for binding/notes.
        // The image: Checkboxes are clearly to the left of the main text items.
        // Let's place checkbox at x=10, width=30.
        position: 'absolute',
        left: 5,
        top: 10, // Align to top for multiline
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#555',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#e6ffe6',
    },
    checkmark: {
        fontSize: 14,
        color: 'green',
    },
    taskTextContainer: {
        flex: 1,
        marginLeft: 42, // Past red line
        justifyContent: 'center',
    },
    taskInput: {
        fontSize: 16,
        color: '#333',
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontFamily: Platform.OS === 'ios' ? 'Noteworthy' : 'Roboto',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    timeContainer: {
        width: 100,
        borderLeftWidth: 1,
        borderLeftColor: '#555', // Vertical line for Time
        height: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeInputBtn: {
        flex: 1,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
    },
    deleteBtn: {
        paddingHorizontal: 5,
    },
    deleteIcon: {
        fontSize: 18,
        color: 'red',
        fontWeight: 'bold',
    },
    addRow: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#aec6cf',
        justifyContent: 'center',
        paddingLeft: 50,
    },
    addText: {
        color: '#aec6cf',
        fontStyle: 'italic',
    },
    addSectionContainer: {
        paddingHorizontal: 50,
        marginTop: 20,
        alignItems: 'flex-start',
    },
    addSectionBtn: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    addSectionBtnText: {
        color: '#555',
        fontWeight: 'bold',
    },
    newSectionInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newSectionInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#555',
        padding: 5,
        minWidth: 150,
        marginRight: 10,
    },
    saveSectionBtn: {
        padding: 5,
        backgroundColor: '#6C63FF',
        borderRadius: 5,
        marginRight: 5,
    },
    saveSectionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cancelSectionBtn: {
        padding: 5,
    },
    cancelSectionText: {
        color: 'red',
        fontSize: 12,
    }
});

export default ListNotes;