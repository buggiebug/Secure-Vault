import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const THEME = {
  accent: '#6C63FF',
  income: '#00C851',
  expense: '#FF6B6B',
  borrowed: '#FBBF24',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.70)',
};

const BalanceCard = ({ expenseStats, onToggleVisibility, visible = true }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const netBalance = Number(expenseStats?.netBalance) || 0;
  const totalIncome = Number(expenseStats?.totalIncome) || 0;
  const totalExpense = Number(expenseStats?.totalExpense) || 0;
  const totalBorrowed = Number(expenseStats?.totalBorrowed) || 0;
  const isNegative = netBalance < 0;

  const fmt = (n) => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (n) => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: cardAnim,
          transform: [
            { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
            { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      {/* Decorations */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Balance */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.balanceLabel}>
            {isNegative ? '⚠️  Net Deficit' : '✅  Total Balance'}
          </Text>
          <View style={styles.balanceRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.balanceAmount}>
              {visible ? fmt(netBalance) : '••••••'}
            </Text>
            {!isNegative && netBalance > 0 && (
              <MaterialIcons name="arrow-upward" size={18} color={THEME.income} style={styles.trendIcon} />
            )}
            {isNegative && (
              <MaterialIcons name="arrow-downward" size={18} color={THEME.expense} style={styles.trendIcon} />
            )}
          </View>
        </View>

        <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeBtn}>
          <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Income */}
        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, { backgroundColor: 'rgba(74,222,128,0.18)' }]}>
            <MaterialIcons name="arrow-downward" size={15} color={THEME.income} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statAmount, { color: THEME.income }]}>
              {visible ? `₹${fmtShort(totalIncome)}` : '₹•••'}
            </Text>
          </View>
        </View>

        <View style={styles.statSep} />

        {/* Expense */}
        <View style={styles.statItem}>
          <View style={[styles.statIconWrap, { backgroundColor: 'rgba(248,113,113,0.18)' }]}>
            <MaterialIcons name="arrow-upward" size={15} color={THEME.expense} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statAmount, { color: THEME.expense }]}>
              {visible ? `₹${fmtShort(totalExpense)}` : '₹•••'}
            </Text>
          </View>
        </View>

        {/* Borrowed – only when non-zero */}
        {totalBorrowed > 0 && (
          <>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(251,191,36,0.18)' }]}>
                <MaterialIcons name="swap-horiz" size={15} color={THEME.borrowed} />
              </View>
              <View>
                <Text style={styles.statLabel}>Borrowed</Text>
                <Text style={[styles.statAmount, { color: THEME.borrowed }]}>
                  {visible ? `₹${fmtShort(totalBorrowed)}` : '₹•••'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: THEME.accent,
    padding: 20,
    overflow: 'hidden',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },

  // Decorations
  decor1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -45,
    right: -35,
  },
  decor2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -25,
    left: 15,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 2,
    marginTop: 4,
  },
  balanceAmount: {
    color: THEME.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  trendIcon: {
    marginLeft: 8,
    marginTop: 8,
  },
  eyeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 13,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 1,
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 6,
  },
});

export default BalanceCard;
