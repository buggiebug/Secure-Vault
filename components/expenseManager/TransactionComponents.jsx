import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import GetImage from '@/components/utils/GetImage';
import ExpenseUtils from './utils/utils';
import ExpenseModal from './ExpenseModal';


const THEME = {
  bg: '#f8f9ff',
  card: '#FFFFFF',
  accent: '#6C63FF',
  income: '#00C851',
  expense: '#FF6B6B',
  borrowed: '#FBBF24',
  text: '#333333',
  textMuted: '#888888',
  surface: '#F0F2F5',
  border: '#E0E0E0',
};

// ─── Transaction Type Tag ────────────────────────────────────────────
const TransactionTypeTag = ({ type }) => {
  const config = {
    Income: { color: THEME.income, bg: 'rgba(0,200,81,0.12)', icon: 'arrow-downward', label: 'Income' },
    Expense: { color: THEME.expense, bg: 'rgba(255,107,107,0.12)', icon: 'arrow-upward', label: 'Expense' },
    Borrowed: { color: THEME.borrowed, bg: 'rgba(251,191,36,0.12)', icon: 'swap-horiz', label: 'Borrowed' },
  };
  const c = config[type] || config.Expense;
  return (
    <View style={[styles.typeTag, { backgroundColor: c.bg, borderColor: c.color + '30' }]}>
      <MaterialIcons name={c.icon} size={10} color={c.color} />
      <Text style={[styles.typeTagText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

// ─── Transaction Row Item ─────────────────────────────────────────────
const TransactionItem = ({ item, onPress }) => {
  const amount = Number(item.amount) || 0;
  const isExpense = item.transactionType === 'Expense';
  const isBorrowed = item.transactionType === 'Borrowed';

  const amountColor = isExpense ? THEME.expense : isBorrowed ? THEME.borrowed : THEME.income;
  const amountSign = isExpense ? '-' : '+';
  const imageKey = String(item.payUsing || item.lenderName || 'cash').toLowerCase().replace(/\s+/g, '');

  return (
    <TouchableOpacity style={styles.item} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.itemImageWrap}>
        {GetImage(imageKey, styles.itemImage)}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemDescription} numberOfLines={1}>{item.description || 'Transaction'}</Text>
        <View style={styles.itemMeta}>
          <TransactionTypeTag type={item.transactionType} />
          {item.category ? <Text style={styles.itemCategory}> · {item.category}</Text> : null}
        </View>
        <Text style={styles.itemDate}>{ExpenseUtils.getRelativeTime(item.transactionDate)}</Text>
      </View>

      <View style={styles.itemAmountWrap}>
        <Text style={[styles.itemAmount, { color: amountColor }]}>
          {amountSign}₹{ExpenseUtils.formatCurrency(Math.abs(amount), 2)}
        </Text>
        {item.status && item.status !== 'Completed' && (
          <Text style={[styles.itemStatus, item.status === 'Pending' && { color: THEME.borrowed }]}>
            {item.status}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Detail Row ───────────────────────────────────────────────────────
const DetailRow = ({ label, value, valueColor }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueColor && { color: valueColor }]}>{value || '-'}</Text>
  </View>
);

// ─── Transaction Detail Modal ─────────────────────────────────────────
const TransactionDetailModal = ({ item, visible, onClose, onPayBill, onEdit }) => {
  if (!item) return null;

  const amount = Number(item.amount) || 0;
  const isExpense = item.transactionType === 'Expense';
  const isBorrowed = item.transactionType === 'Borrowed';
  const amountColor = isExpense ? THEME.expense : isBorrowed ? THEME.borrowed : THEME.income;
  const imageKey = String(item.payUsing || item.lenderName || 'cash').toLowerCase().replace(/\s+/g, '');

  const handlePayBill = () => {
    onClose(false);
    if (onPayBill) onPayBill(item);
  };

  const handleEdit = () => {
    onClose(false);
    if (onEdit) onEdit(item);
  };

  return (
    <ExpenseModal title="Transaction Details" visible={visible} onClose={() => onClose(false)}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Amount Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalImageWrap}>
            {GetImage(imageKey, styles.modalImage)}
          </View>
          <Text style={[styles.modalAmount, { color: amountColor }]}>
            {isExpense ? '-' : '+'}₹{ExpenseUtils.formatCurrency(Math.abs(amount), 2)}
          </Text>
          <Text style={styles.modalDescription}>{item.description || 'Transaction'}</Text>
          <TransactionTypeTag type={item.transactionType} />
        </View>

        {/* Details Grid */}
        <View style={styles.detailsSection}>
          {item.payUsing && <DetailRow label="Paid via" value={item.payUsing} />}
          {item.category && <DetailRow label="Category" value={item.category} />}
          {item.notes && <DetailRow label="Notes" value={item.notes} />}
          <DetailRow label="Status" value={item.status || 'Completed'} />
          <DetailRow label="Date" value={ExpenseUtils.getIndiaTime(item.transactionDate)} />
          {item.recurring && <DetailRow label="Recurring" value="Yes" valueColor="#10B981" />}

          {isBorrowed && <>
            <DetailRow label="Lender" value={item.lenderName} />
            <DetailRow label="Borrowed for" value={item.borrowedType} />
            <DetailRow label="Total borrowed" value={`₹${item.totalBorrowedAmount || 0}`} />
            <DetailRow label="Remaining" value={`₹${Math.abs(amount)}`} valueColor={THEME.borrowed} />
            <DetailRow label="Settled" value={item.isSettled ? 'Yes ✓' : 'No'} valueColor={item.isSettled ? '#10B981' : '#F87171'} />
          </>}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          {isBorrowed && !item.isSettled && (
            <TouchableOpacity style={styles.payBillButton} onPress={handlePayBill}>
              <MaterialIcons name="payments" size={18} color="#fff" />
              <Text style={styles.payBillText}>Pay This Bill</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.payBillButton, { backgroundColor: '#6C63FF', flex: 1, marginLeft: (isBorrowed && !item.isSettled) ? 10 : 0 }]} onPress={handleEdit}>
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.payBillText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ExpenseModal>
  );
};

const styles = StyleSheet.create({
  // ── Item ─────────────────────────────
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  itemImageWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  itemImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  itemDetails: { flex: 1, marginRight: 6 },
  itemDescription: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 4,
  },
  itemCategory: { color: THEME.textMuted, fontSize: 11 },
  itemDate: { color: THEME.textMuted, fontSize: 11 },
  itemAmountWrap: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3 },
  itemStatus: { fontSize: 10, color: THEME.textMuted, marginTop: 2 },

  // ── Type Tag ─────────────────────────
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  typeTagText: { fontSize: 10, fontWeight: '600' },

  // ── Modal ────────────────────────────
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  modalImageWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalImage: { width: '75%', height: '75%', resizeMode: 'contain' },
  modalAmount: { fontSize: 30, fontWeight: '800', marginBottom: 6 },
  modalDescription: { fontSize: 15, color: '#555', marginBottom: 10, textAlign: 'center' },

  // ── Detail Rows ──────────────────────
  detailsSection: { borderRadius: 12, backgroundColor: '#F9F9F9', overflow: 'hidden' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: { color: '#888', fontSize: 13 },
  detailValue: { color: '#1A1A1A', fontSize: 13, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },

  // ── Actions ─────────────────────────
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  payBillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.income,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: THEME.income,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payBillText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export { TransactionItem, TransactionDetailModal };
