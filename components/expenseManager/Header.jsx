import React from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ACCENT = '#6C63FF';

const Header = ({
  headerAnim,
  count,
  syncStatus,
  lastSyncedAt,
  onSync,
  isSyncing,
  expenseStats,
  balanceVisible,
  onToggleVisibility,
}) => {
  const getSyncIcon = () => {
    if (isSyncing) return <ActivityIndicator size="small" color="#FFFFFF" />;
    switch (syncStatus) {
      case 'success': return <Ionicons name="cloud-done" size={16} color="#00C851" />;
      case 'error': return <Ionicons name="cloud-offline" size={16} color="#FF6B6B" />;
      default: return <Ionicons name="cloud-outline" size={16} color="#FFFFFF" />;
    }
  };

  const getLastSyncText = () => {
    if (!lastSyncedAt) return 'Not synced';
    const diff = Date.now() - lastSyncedAt;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const netBalance = String(expenseStats?.netBalance || '0');
  const totalIncome = String(expenseStats?.totalIncome || '0');
  const totalExpense = String(expenseStats?.totalExpense || '0');
  const totalBorrowed = String(expenseStats?.totalBorrowed || '0');

  const isNegative = netBalance.startsWith('-');
  const displayBalance = isNegative ? netBalance.substring(1) : netBalance;

  return (
    <Animated.View
      style={[
        styles.header,
        { transform: [{ translateY: headerAnim }] },
      ]}
    >
      {/* Decorative circles */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* ── Title Row ─────────────────────────────── */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.headerIcon}>💰</Text>
          <Text style={styles.headerTitle}>Expense Manager</Text>
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={onSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          {getSyncIcon()}
          <Text style={styles.syncText}>{getLastSyncText()}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerSubtitle}>
        Track spending, manage budgets, and stay in control.
      </Text>

      {/* ── Balance Section ───────────────────────── */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceLabelRow}>
          <Text style={styles.balanceLabel}>
            {isNegative ? '⚠️  Net Deficit' : 'Total Balance'}
          </Text>
          <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeBtn}>
            <Ionicons
              name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={16}
              color="rgba(255,255,255,0.75)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceCurrency}>₹</Text>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? displayBalance : '••••••'}
          </Text>
          {!isNegative && netBalance !== '0' && (
            <MaterialIcons name="arrow-upward" size={16} color="#00C851" style={styles.trendIcon} />
          )}
          {isNegative && (
            <MaterialIcons name="arrow-downward" size={16} color="#F87171" style={styles.trendIcon} />
          )}
        </View>
      </View>

      {/* ── Stats Row ─────────────────────────────── */}
      <View style={styles.statsRow}>

        {/* Income */}
        <View style={styles.statChip}>
          <MaterialIcons name="arrow-downward" size={12} color="#00C851" />
          <View>
            <Text style={styles.statChipLabel}>Income</Text>
            <Text style={[styles.statChipValue, { color: '#00C851' }]}>
              {balanceVisible ? `₹${totalIncome}` : '₹•••'}
            </Text>
          </View>
        </View>

        <View style={styles.statSep} />

        {/* Expense */}
        <View style={styles.statChip}>
          <MaterialIcons name="arrow-upward" size={12} color="#F87171" />
          <View>
            <Text style={styles.statChipLabel}>Expenses</Text>
            <Text style={[styles.statChipValue, { color: '#F87171' }]}>
              {balanceVisible ? `₹${totalExpense}` : '₹•••'}
            </Text>
          </View>
        </View>

        {/* Borrowed – only when present */}
        {totalBorrowed !== '0' && (
          <>
            <View style={styles.statSep} />
            <View style={styles.statChip}>
              <MaterialIcons name="swap-horiz" size={12} color="#FBBF24" />
              <View>
                <Text style={styles.statChipLabel}>Borrowed</Text>
                <Text style={[styles.statChipValue, { color: '#FBBF24' }]}>
                  {balanceVisible ? `₹${totalBorrowed}` : '₹•••'}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Spacer + Transaction count */}
        <View style={{ flex: 1 }} />
        <View style={styles.countBadge}>
          <Text style={styles.countText}>📊 {count || 0}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: ACCENT,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },

  // Decorations
  decor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -55,
    right: -45,
  },
  decor2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -35,
    left: -20,
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '400',
    lineHeight: 17,
    marginBottom: 18,
  },

  // Sync Button
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 5,
  },
  syncText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },

  // Balance
  balanceSection: {
    marginBottom: 16,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  eyeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 6,
    borderRadius: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceCurrency: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 2,
    marginTop: 3,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  trendIcon: {
    marginLeft: 8,
    marginTop: 6,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statChipLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 13,
  },
  statChipValue: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Count Badge
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Header;