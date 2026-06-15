import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncTodosThunk, fetchTodosThunk } from '../redux/slice/todoSlice';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom hook for automatic todo syncing
 * Syncs todos when:
 * - App comes online
 * - User logs in (initial fetch)
 * - Periodically in the background
 */
export const useTodoSync = () => {
    const dispatch = useDispatch();
    const { syncStatus, offlineQueue, lastSyncedAt } = useSelector(state => state.todo);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    // Initial fetch on login
    useEffect(() => {
        if (isLoggedIn && !lastSyncedAt) {
            dispatch(fetchTodosThunk());
        }
    }, [isLoggedIn, dispatch, lastSyncedAt]);

    // Periodic sync (every 5 minutes when online)
    useEffect(() => {
        if (!isLoggedIn) return;

        const interval = setInterval(() => {
            console.log('[useTodoSync] Periodic sync triggered');
            dispatch(syncTodosThunk());
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [isLoggedIn, dispatch]);

    // Sync when coming online
    useEffect(() => {
        if (!isLoggedIn) return;

        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                console.log('[useTodoSync] Network connected, syncing...');
                dispatch(syncTodosThunk());
            }
        });

        return () => unsubscribe();
    }, [isLoggedIn, dispatch]);

    // Manual sync function
    const manualSync = useCallback(() => {
        console.log('[useTodoSync] Manual sync triggered');
        if (isLoggedIn) {
            dispatch(syncTodosThunk());
        }
    }, [isLoggedIn, dispatch]);

    return {
        syncStatus,
        lastSyncedAt,
        offlineQueue: offlineQueue.length,
        manualSync,
        isSyncing: syncStatus === 'syncing',
    };
};

export default useTodoSync;
