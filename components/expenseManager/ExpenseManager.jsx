import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
    RefreshControl,
    StatusBar,
    Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { selectExpenseDetails } from '@/redux/reselect/reselectData';
import { selectUserDetails } from '@/redux/reselect/reselectData';


import { TransactionItem, TransactionDetailModal } from './TransactionComponents';
import Header from './Header';
import CreateExpenseModal from './CreateExpenseModal';

// ── Theme ────────────────────────────────────────────────────────────
const THEME = {
    bg: '#f8f9ff',
    card: '#FFFFFF',
    accent: '#6C63FF',
    accentDark: '#5A52D5',
    income: '#00C851',
    expense: '#FF6B6B',
    borrowed: '#FBBF24',
    text: '#333333',
    textMuted: '#888888',
    textSecondary: '#555555',
    surface: '#F0F2F5',
    border: '#E0E0E0',
};

// ── Filter Chip ───────────────────────────────────────────────────────
const FilterChip = ({ label, active, onPress, color }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
            styles.chip,
            active && { backgroundColor: color || THEME.accent, borderColor: color || THEME.accent },
        ]}
    >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
);

// ── Empty State ───────────────────────────────────────────────────────
const EmptyState = ({ onRefresh, filter }) => (
    <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'No Transactions Yet' : `No ${filter} Transactions`}
        </Text>
        <Text style={styles.emptySubtitle}>
            {filter === 'all'
                ? 'Start tracking your money by adding your first transaction.'
                : `Try switching filters or add a new ${filter.toLowerCase()} transaction.`}
        </Text>
        <TouchableOpacity style={styles.emptyRefresh} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color={THEME.accent} />
            <Text style={styles.emptyRefreshText}>Pull to refresh</Text>
        </TouchableOpacity>
    </View>
);

// ── Section Header ────────────────────────────────────────────────────
const SectionHeader = ({ title, count }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
            <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{count}</Text>
            </View>
        )}
    </View>
);

// ── Main Component ────────────────────────────────────────────────────
const ExpenseManager = ({ refreshing, onRefresh }) => {
    const flatListRef = useRef(null);

    const { expenseData, loadingStatus, loadingModal } = useSelector(selectExpenseDetails);
    const { userData } = useSelector(selectUserDetails);

    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [prefillBill, setPrefillBill] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [balanceVisible, setBalanceVisible] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    const fabAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(0)).current;

    // Animations on mount
    useEffect(() => {
        Animated.parallel([
            Animated.spring(fabAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
            Animated.timing(headerAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    // Track sync status
    useEffect(() => {
        if (loadingStatus === 'succeeded' && loadingModal === 'getAllExpenses') {
            setLastSyncedAt(Date.now());
        }
    }, [loadingStatus, loadingModal]);

    // ── Derived data ─────────────────────────────────────────────────
    const expenses = Array.isArray(expenseData?.expenses) ? expenseData.expenses : [];
    const stats = expenseData?.stats || {};

    const filteredExpenses = useMemo(() => {
        if (activeFilter === 'all') return expenses;
        if (activeFilter === 'income') return expenses.filter(e => e.transactionType === 'Income');
        if (activeFilter === 'expense') return expenses.filter(e => e.transactionType === 'Expense');
        if (activeFilter === 'borrowed') return expenses.filter(e => e.transactionType === 'Borrowed');
        return expenses;
    }, [expenses, activeFilter]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleItemPress = useCallback((item) => {
        setSelectedItem(item);
        setModalVisible(true);
    }, []);

    const handleAddTransaction = useCallback(() => {
        setPrefillBill(null);
        setEditItem(null);
        setCreateModalVisible(true);
    }, []);

    const handlePayBill = useCallback((bill) => {
        setModalVisible(false);
        setEditItem(null);
        setPrefillBill(bill);
        setCreateModalVisible(true);
    }, []);

    const handleEdit = useCallback((item) => {
        setModalVisible(false);
        setPrefillBill(null);
        setEditItem(item);
        setCreateModalVisible(true);
    }, []);

    const isSyncing = loadingStatus === 'loading' && loadingModal === 'getAllExpenses';

    // ── Render ─────────────────────────────────────────────────────
    const showBorrowedFilter =
        Array.isArray(userData?.settings?.expenseTrackService?.transactionType) &&
        userData.settings.expenseTrackService.transactionType.includes('Borrowed');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

            {/* App Header — contains balance + stats */}
            <Header
                headerAnim={headerAnim}
                count={expenses.length}
                syncStatus={
                    isSyncing ? 'syncing'
                        : loadingStatus === 'failed' ? 'error'
                            : 'success'
                }
                lastSyncedAt={lastSyncedAt}
                onSync={onRefresh}
                isSyncing={isSyncing}
                expenseStats={stats}
                balanceVisible={balanceVisible}
                onToggleVisibility={() => setBalanceVisible(v => !v)}
            />

            {/* Filter Chips */}
            <View style={styles.filterBar}>
                <FilterChip label="All" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
                <FilterChip label="Income" active={activeFilter === 'income'} onPress={() => setActiveFilter('income')} color={THEME.income} />
                <FilterChip label="Expense" active={activeFilter === 'expense'} onPress={() => setActiveFilter('expense')} color={THEME.expense} />
                {showBorrowedFilter && (
                    <FilterChip label="Borrowed" active={activeFilter === 'borrowed'} onPress={() => setActiveFilter('borrowed')} color={THEME.borrowed} />
                )}
            </View>

            <FlatList
                ref={flatListRef}
                data={filteredExpenses}
                keyExtractor={(item, idx) => `${item._id || idx}-${idx}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || false}
                        onRefresh={onRefresh}
                        tintColor={THEME.accent}
                        colors={[THEME.accent]}
                        progressBackgroundColor={THEME.card}
                    />
                }

                // ── Header ────────────────────────────────────────────────
                ListHeaderComponent={
                    <View>
                        {/* Section Header */}
                        <SectionHeader
                            title={activeFilter === 'all' ? 'All Transactions' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Transactions`}
                            count={filteredExpenses.length}
                        />
                    </View>
                }

                // ── Item ──────────────────────────────────────────────────
                renderItem={({ item }) => (
                    <TransactionItem item={item} onPress={handleItemPress} />
                )}

                // ── Empty ─────────────────────────────────────────────────
                ListEmptyComponent={
                    <EmptyState onRefresh={onRefresh} filter={activeFilter} />
                }

                // ── Footer ────────────────────────────────────────────────
                ListFooterComponent={
                    filteredExpenses.length > 0 ? (
                        <View style={styles.listFooter}>
                            <Text style={styles.listFooterText}>
                                Showing {filteredExpenses.length} of {expenses.length} transactions
                            </Text>
                        </View>
                    ) : null
                }
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
            />

            {/* ── Floating Action Button ────────────────────────────── */}
            <Animated.View
                style={[
                    styles.fabWrap,
                    {
                        transform: [
                            { scale: fabAnim },
                            { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                        ],
                        opacity: fabAnim,
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleAddTransaction}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* ── Transaction Detail Modal ──────────────────────────── */}
            <TransactionDetailModal
                item={selectedItem}
                visible={modalVisible}
                onClose={setModalVisible}
                onPayBill={handlePayBill}
                onEdit={handleEdit}
            />

            {/* ── Create Expense Modal ──────────────────────────────── */}
            <CreateExpenseModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                prefillBill={prefillBill}
                editItem={editItem}
            />
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    listContent: {
        paddingBottom: 100,
    },


    // ── Filter Bar ───────────────────────────────────
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.surface,
    },
    chipText: {
        color: THEME.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
    },

    // ── Section Header ───────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 8,
    },
    sectionTitle: {
        color: THEME.text,
        fontSize: 16,
        fontWeight: '700',
    },
    countBadge: {
        backgroundColor: THEME.accent,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },

    // ── Empty State ──────────────────────────────────
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyEmoji: {
        fontSize: 52,
        marginBottom: 16,
    },
    emptyTitle: {
        color: THEME.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: THEME.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyRefresh: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: THEME.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    emptyRefreshText: {
        color: THEME.accent,
        fontSize: 13,
        fontWeight: '600',
    },

    // ── List Footer ──────────────────────────────────
    listFooter: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    listFooterText: {
        color: THEME.textMuted,
        fontSize: 12,
    },

    // ── FAB ─────────────────────────────────────────
    fabWrap: {
        position: 'absolute',
        bottom: 24,
        right: 20,
    },
    fab: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: THEME.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
});

export default ExpenseManager;