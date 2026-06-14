import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  View,
  BackHandler,
  Modal,
  Text,
  TouchableOpacity
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import NotesList from "./NotesList";
import TextNote from "./TextNote";
import AudioNote from "./AudioNote";
import { migrateLegacyData, createNote } from "../../redux/slice/todoSlice";
import ListNotes from "./ListNotes";
import useTodoSync from "../../hooks/useTodoSync";

const NotesManager = () => {
  const dispatch = useDispatch();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const allNotes = useSelector((state) => state.todo.tasks);
  const activeNote = selectedNoteId ? allNotes[selectedNoteId] : null; // activeNote might be undefined if just deleted

  // Use sync hook for automatic syncing
  const { syncStatus, lastSyncedAt, manualSync, isSyncing } = useTodoSync();

  useEffect(() => {
    dispatch(migrateLegacyData());
  }, [dispatch]);

  // Handle Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (selectedNoteId) {
        setSelectedNoteId(null);
        return true; // Prevent default behavior (exit app)
      }
      return false; // Valid default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedNoteId]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // FAB bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      {/* Pass headerAnim to Header if needed, or if Header is fixed */}
      <Header
        headerAnim={headerAnim}
        count={Object.keys(allNotes).length}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onSync={manualSync}
        isSyncing={isSyncing}
      />

      {selectedNoteId && activeNote ? (
        activeNote.type === 'text' ? (
          <TextNote
            noteId={selectedNoteId}
            onBack={() => setSelectedNoteId(null)}
          />
        ) : activeNote.type === 'audio' ? (
          <AudioNote
            noteId={selectedNoteId}
            onBack={() => setSelectedNoteId(null)}
          />
        ) : (
          <ListNotes
            noteId={selectedNoteId}
            onBack={() => setSelectedNoteId(null)}
            autoCreate={false}
          />
        )
      ) : (
        <NotesList
          onOpen={(id) => setSelectedNoteId(id)}
          onCreate={() => setShowTypePicker(true)}
        />
      )}

      {/* Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Note Type</Text>

            <TouchableOpacity onPress={() => {
              const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
              const today = new Date().toISOString().split('T')[0];
              dispatch(createNote({ id: newId, date: today, title: '', type: 'text' }));
              setSelectedNoteId(newId);
              setShowTypePicker(false);
            }} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>📝 Text</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
              const today = new Date().toISOString().split('T')[0];
              dispatch(createNote({ id: newId, date: today, title: '', type: 'list' }));
              setSelectedNoteId(newId);
              setShowTypePicker(false);
            }} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>✅ Todo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
              const today = new Date().toISOString().split('T')[0];
              dispatch(createNote({ id: newId, date: today, title: '', type: 'audio' }));
              setSelectedNoteId(newId);
              setShowTypePicker(false);
            }} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>🎙️ Audio</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  notesListContainer: {
    flex: 1,
    marginTop: 20,
  },
  passwordList: {
    paddingHorizontal: 20,
  },
  mainFab: {
    bottom: 30,
    right: 30,
  },
  secondaryFab: {
    bottom: 100,
    right: 30,
    backgroundColor: "#FF6B6B",
    shadowColor: "#FF6B6B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#6C63FF',
  },
});

export default NotesManager;
