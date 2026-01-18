import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useAudioPlayer, useAudioRecorder, useAudioRecorderState, useAudioPlayerStatus, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import { updateNoteTitle, updateNoteAudio, updateNoteBody } from '../../redux/slice/todoSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AudioNote = ({ noteId, onBack }) => {
    const dispatch = useDispatch();
    const noteData = useSelector((state) => state.todo.tasks[noteId]);
    
    // Audio URI from redux
    const savedAudioUri = noteData?.audioUri;
    const { title, body } = noteData || {};

    // --- Permissions & Mode ---
    const [permissionStatus, setPermissionStatus] = useState(null);
    useEffect(() => {
        (async () => {
             const status = await AudioModule.requestRecordingPermissionsAsync();
             setPermissionStatus(status.status);
             if (status.granted) {
                 await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: true,
                 });
             }
        })();
    }, []);

    const requestPerm = async () => {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setPermissionStatus(status.status);
        if (status.granted) {
            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
             });
        }
        return status.granted;
    }

    // --- Recorder Hook ---
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);
    
    // --- Player Hook ---
    const player = useAudioPlayer(savedAudioUri || null);
    const playerStatus = useAudioPlayerStatus(player);

    if (!noteData) return null;

    const onTitleChange = (text) => dispatch(updateNoteTitle({ noteId, title: text }));
    const onBodyChange = (text) => dispatch(updateNoteBody({ noteId, body: text }));

    const startRecording = async () => {
        try {
            if (permissionStatus !== 'granted') {
                 const granted = await requestPerm();
                 if (!granted) {
                     Alert.alert("Permission denied", "Microphone permission is required.");
                     return;
                 }
            }
            await recorder.prepareToRecordAsync();
            recorder.record();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        if (!recorderState.isRecording) return;
        await recorder.stop();
        
        // After stop, get URI
        const uri = recorder.uri;
        let durationSec = 0;
        if (recorderState.durationMillis) {
            durationSec = Math.floor(recorderState.durationMillis / 1000);
        }

        if (uri) {
            dispatch(updateNoteAudio({ noteId, audioUri: uri, audioDuration: durationSec }));
        }
    };

    const togglePlayback = () => {
        if (player.playing) {
            player.pause();
        } else {
            // Replay if finished
            if (playerStatus.isLoaded && playerStatus.duration > 0) {
                 if (playerStatus.currentTime >= playerStatus.duration - 0.2 || playerStatus.didJustFinish) {
                      player.seekTo(0);
                 }
            }
            player.play();
        }
    };

    // --- Helper ---
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    let durationDisplay = "00:00";
    if (recorderState.isRecording) {
        durationDisplay = formatTime(Math.floor(recorderState.durationMillis / 1000));
    } else if (savedAudioUri) {
         const totalDuration = noteData.audioDuration || 0;
         if (playerStatus.playing) {
             // Show remaining time
             const remaining = Math.max(0, totalDuration - Math.floor(playerStatus.currentTime));
             durationDisplay = formatTime(remaining);
         } else {
             // Show total duration
             durationDisplay = formatTime(totalDuration);
         }
    }

    return (
        <View style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Title */}
                <TextInput 
                    style={styles.titleInput}
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder="Title"
                    placeholderTextColor="#aaa"
                />

                {/* Body Text (Before Audio) */}
                <TextInput
                    style={styles.bodyInput}
                    value={body}
                    onChangeText={onBodyChange}
                    placeholder="Type something..."
                    placeholderTextColor="#999"
                    multiline
                />

                {/* Audio Player / Recorder Capsule */}
                <View style={styles.audioSection}>
                    {savedAudioUri ? (
                        <View style={styles.capsulePlayer}>
                            <TouchableOpacity onPress={togglePlayback} style={styles.playPauseBtn}>
                                <Ionicons name={playerStatus.playing ? "pause-circle" : "play-circle"} size={32} color="#555" />
                            </TouchableOpacity>
                            
                            {/* Waveform Visual (Simulated) */}
                            <View style={styles.waveformContainer}>
                                <MaterialCommunityIcons name="waveform" size={24} color="#555" style={{opacity: 0.6}} />
                                <View style={styles.waveformLine} /> 
                            </View>

                            <Text style={styles.durationText}>{durationDisplay}</Text>

                            <TouchableOpacity 
                                onPress={() => dispatch(updateNoteAudio({ noteId, audioUri: null, audioDuration: 0 }))} 
                                style={styles.deleteBtn}
                            >
                                <Ionicons name="trash-outline" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.recorderContainer}>
                             {recorderState.isRecording ? (
                                <View style={styles.recordingState}>
                                    <Text style={styles.recordingTimer}>{durationDisplay}</Text>
                                    <TouchableOpacity onPress={stopRecording} style={styles.stopRecordingBtn}>
                                        <Ionicons name="stop" size={24} color="white" />
                                    </TouchableOpacity>
                                     <Text style={styles.recordingLabel}>Recording...</Text>
                                </View>
                             ) : (
                                 <View style={styles.emptyAudioState}>
                                     {/* User can type without audio, but let's show record button clearly at bottom or inline */}
                                    <TouchableOpacity onPress={startRecording} style={styles.startRecordBtn}>
                                        <Ionicons name="mic" size={24} color="#fff" />
                                    </TouchableOpacity>
                                 </View>
                             )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffdf9', // Slight warm paper tone like screenshot
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        paddingHorizontal: 5,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
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
        marginBottom: 20,
        lineHeight: 24,
        minHeight: 40,
    },
    audioSection: {
        marginBottom: 20,
    },
    capsulePlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E6E1', // Beige/Grey from screenshot
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 60,
    },
    playPauseBtn: {
        marginRight: 10,
    },
    waveformContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    waveformLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#555', // Simplified line
        borderRadius: 1,
    },
    durationText: {
        fontSize: 14,
        color: '#555',
        marginRight: 15,
        fontVariant: ['tabular-nums'],
    },
    deleteBtn: {
        padding: 5,
    },
    recorderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    startRecordBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
    },
    recordingState: {
        alignItems: 'center',
    },
    stopRecordingBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    recordingTimer: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    recordingLabel: {
        color: 'red',
        fontWeight: 'bold',
    },
});

export default AudioNote;
