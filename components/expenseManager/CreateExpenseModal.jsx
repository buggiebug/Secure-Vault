import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createExpense, updateExpense, resetStatus, getAllExpenses } from '@/redux/slice/expenseSlice';
import { selectExpenseDetails } from '@/redux/reselect/reselectData';
import Notify from '@/components/utils/Notify';
import TransactionValidate from './validation/payload';
import ExpenseUtils from './utils/utils';

// ── Theme ──────────────────────────────────────────────────────────────────
const DARK = {
    bg: '#f8f9ff',
    card: '#FFFFFF',
    surface: '#F0F2F5',
    border: '#E0E0E0',
    text: '#333333',
    textMuted: '#888888',
    accent: '#6C63FF',
    income: '#00C851',
    expense: '#FF6B6B',
    borrowed: '#FBBF24',
    error: '#FF6B6B',
    inputBg: '#FFFFFF',
    inputBorder: '#E0E0E0',
};

// ── Constants ──────────────────────────────────────────────────────────────
const TRANSACTION_TYPES = ['Expense', 'Income', 'Borrowed'];
const PAYMENT_METHODS = [
    'Cash', 'UPI', 'GooglePay', 'PhonePe', 'Paytm',
    'AmazonPay', 'Mobikwik', 'PayPal', 'IMPS',
    'Credit Card', 'Debit Card', 'Other',
];
const BORROWED_FOR = ['Self', 'Friend', 'Family', 'Others'];
const STATUSES = ['Completed', 'Pending', 'Failed'];
const CATEGORIES = [
    'Salary', 'Food', 'Transport', 'Shopping', 'Entertainment',
    'Health', 'Education', 'Bills', 'Groceries', 'Travel', 'Other',
];

const TYPE_CONFIG = {
    Expense: { color: DARK.expense, bg: 'rgba(255,107,107,0.12)', icon: 'arrow-upward', label: 'Expense' },
    Income: { color: DARK.income, bg: 'rgba(0,200,81,0.12)', icon: 'arrow-downward', label: 'Income' },
    Borrowed: { color: DARK.borrowed, bg: 'rgba(251,191,36,0.12)', icon: 'swap-horiz', label: 'Borrowed' },
};

// ── Sub-components ─────────────────────────────────────────────────────────
const SectionLabel = ({ label, required }) => (
    <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
    </Text>
);

const TypeSelector = ({ value, onChange }) => (
    <View style={styles.typeRow}>
        {TRANSACTION_TYPES.map(type => {
            const cfg = TYPE_CONFIG[type];
            const active = value === type;
            return (
                <TouchableOpacity
                    key={type}
                    onPress={() => onChange(type)}
                    activeOpacity={0.75}
                    style={[
                        styles.typeChip,
                        { borderColor: cfg.color + '60' },
                        active && { backgroundColor: cfg.color, borderColor: cfg.color },
                    ]}
                >
                    <MaterialIcons name={cfg.icon} size={14} color={active ? '#fff' : cfg.color} />
                    <Text style={[styles.typeChipText, { color: active ? '#fff' : cfg.color }]}>
                        {type}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const PillSelector = ({ options, value, onChange }) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillContainer}
    >
        {options.map(opt => {
            const active = value === opt;
            return (
                <TouchableOpacity
                    key={opt}
                    onPress={() => onChange(active ? '' : opt)}
                    activeOpacity={0.7}
                    style={[styles.pill, active && styles.pillActive]}
                >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

const DarkInput = ({ value, onChangeText, placeholder, keyboardType = 'default',
    editable = true, multiline = false, error = false }) => (
    <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError,
        !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={DARK.textMuted}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
    />
);

// ── Main Component ─────────────────────────────────────────────────────────
const CreateExpenseModal = ({ visible, onClose, prefillBill = null, editItem = null }) => {
    const dispatch = useDispatch();
    const { loadingStatus, loadingModal } = useSelector(selectExpenseDetails);

    const isCreating = loadingStatus === 'loading' && loadingModal === 'createExpense';
    const isUpdating = loadingStatus === 'loading' && loadingModal === 'updateExpense';
    const isSubmitting = isCreating || isUpdating;
    const justSucceeded = loadingStatus === 'succeeded' && (loadingModal === 'createExpense' || loadingModal === 'updateExpense');

    const INITIAL = {
        description: '',
        amount: '',
        transactionType: 'Expense',
        payUsing: '',
        category: '',
        notes: '',
        status: 'Completed',
        transactionDate: '',
        recurring: false,
        lenderName: '',
        borrowedType: 'Self',
        isSettled: false,
        oldBillId: '',
    };

    const [form, setForm] = useState({ ...INITIAL });
    const [displayDate, setDisplayDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState({});

    // Pre-fill for "Pay Bill" flow or "Edit" flow
    useEffect(() => {
        if (editItem?._id) {
            setForm({
                ...INITIAL,
                description: editItem.description || '',
                amount: String(Math.abs(editItem.amount) || ''),
                transactionType: editItem.transactionType || 'Expense',
                lenderName: editItem.lenderName || '',
                borrowedType: editItem.borrowedType || 'Self',
                payUsing: editItem.payUsing || '',
                category: editItem.category || '',
                notes: editItem.notes || '',
                status: editItem.status || 'Completed',
                isSettled: editItem.isSettled || false,
                oldBillId: '',
                recurring: editItem.recurring || false,
                transactionDate: editItem.transactionDate || '',
            });
            setDisplayDate(editItem.transactionDate ? ExpenseUtils.getIndiaTime(editItem.transactionDate) : '');
        } else if (prefillBill?._id) {
            setForm({
                ...INITIAL,
                description: prefillBill.description || '',
                amount: String(Math.abs(prefillBill.amount) || ''),
                transactionType: prefillBill.transactionType || 'Borrowed',
                lenderName: prefillBill.lenderName || '',
                borrowedType: prefillBill.borrowedType || 'Self',
                payUsing: prefillBill.payUsing || '',
                notes: prefillBill.notes || '',
                status: prefillBill.status || 'Completed',
                isSettled: true,
                oldBillId: prefillBill._id,
            });
            setDisplayDate('');
        } else {
            resetForm();
        }
    }, [prefillBill, editItem, visible]);

    // Auto-close + refresh on success
    useEffect(() => {
        if (justSucceeded) {
            dispatch(getAllExpenses());
            dispatch(resetStatus());
            resetForm();
            onClose();
        }
    }, [justSucceeded]);

    const resetForm = () => {
        setForm({ ...INITIAL });
        setDisplayDate('');
        setErrors({});
    };

    const set = field => value => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            setForm(prev => ({ ...prev, transactionDate: String(selectedDate) }));
            setDisplayDate(ExpenseUtils.getIndiaTime(selectedDate));
        } else if (event.type === 'dismissed') {
            setShowDatePicker(false);
        }
    };

    const validate = () => {
        const result = TransactionValidate(form);
        if (!result.success) {
            const fieldMap = {
                'Description required': 'description',
                'Amount required': 'amount',
                'Enter a valid amount': 'amount',
                'Lender Name required': 'lenderName',
                'Pay Using required': 'payUsing',
                'Category required': 'category',
                'Date required': 'transactionDate',
            };
            const newErrors = {};
            result.errors.forEach(e => { if (fieldMap[e]) newErrors[fieldMap[e]] = e; });
            setErrors(newErrors);
            Notify(result.errors[0], 1);
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        if (editItem?._id) {
            dispatch(updateExpense({ id: editItem._id, formData: form }));
        } else {
            // console.log(form)
            dispatch(createExpense({ formData: form }));
        }
    };

    const isBorrowed = form.transactionType === 'Borrowed';
    const isPrefilled = !!prefillBill?._id;
    const isEditing = !!editItem?._id;
    const typeCfg = TYPE_CONFIG[form.transactionType] || TYPE_CONFIG.Expense;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => { resetForm(); onClose(); }}
        >
            <StatusBar barStyle="dark-content" backgroundColor={DARK.bg} />
            <SafeAreaView style={styles.root}>

                {/* ── Top App Bar ─────────────────────────────────── */}
                <View style={styles.appBar}>
                    <TouchableOpacity
                        onPress={() => { resetForm(); onClose(); }}
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color={DARK.text} />
                    </TouchableOpacity>

                    <View style={styles.appBarTitleWrap}>
                        <Text style={styles.appBarTitle}>
                            {isEditing ? 'Edit Transaction' : isPrefilled ? 'Pay Borrowed Bill' : 'Add Transaction'}
                        </Text>
                        <Text style={styles.appBarSub}>
                            {isEditing ? 'Update transaction details' : isPrefilled ? 'Settle your borrowed amount' : 'Record a new transaction'}
                        </Text>
                    </View>

                    {/* Type indicator pill */}
                    <View style={[styles.typePill, { backgroundColor: typeCfg.bg, borderColor: typeCfg.color + '50' }]}>
                        <MaterialIcons name={typeCfg.icon} size={12} color={typeCfg.color} />
                        <Text style={[styles.typePillText, { color: typeCfg.color }]}>{form.transactionType}</Text>
                    </View>
                </View>

                {/* ── Form ────────────────────────────────────────── */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        {/* ── Transaction Type ───────────────────── */}
                        <View style={styles.section}>
                            <SectionLabel label="Transaction Type" required />
                            {isEditing ? (
                                <TypeSelector value={form.transactionType} onChange={() => { }} />
                            ) : (
                                <TypeSelector value={form.transactionType} onChange={set('transactionType')} />
                            )}
                        </View>

                        {/* ── Amount ─────────────────────────────── */}
                        <View style={styles.amountSection}>
                            <Text style={styles.amountLabel}>Amount</Text>
                            <View style={[styles.amountRow, errors.amount && styles.inputError]}>
                                <Text style={[styles.rupeeSymbol, { color: typeCfg.color }]}>₹</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={form.amount}
                                    onChangeText={set('amount')}
                                    placeholder="0.00"
                                    placeholderTextColor={DARK.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>
                            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                        </View>

                        {/* ── Description ────────────────────────── */}
                        <View style={styles.section}>
                            <SectionLabel label="Description" required />
                            <DarkInput
                                value={form.description}
                                onChangeText={set('description')}
                                placeholder="e.g. Lunch, Salary, EMI…"
                                editable={!isPrefilled}
                                error={!!errors.description}
                            />
                            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                        </View>

                        {/* ── Borrowed Fields ─────────────────────── */}
                        {isBorrowed && (
                            <View style={styles.section}>
                                <SectionLabel label="Lender Name" required />
                                <DarkInput
                                    value={form.lenderName}
                                    onChangeText={set('lenderName')}
                                    placeholder="Who lent you the money?"
                                    editable={!isPrefilled}
                                    error={!!errors.lenderName}
                                />
                                {errors.lenderName && <Text style={styles.errorText}>{errors.lenderName}</Text>}

                                {!isPrefilled && (
                                    <>
                                        <SectionLabel label="Borrowed For" />
                                        <PillSelector options={BORROWED_FOR} value={form.borrowedType} onChange={set('borrowedType')} />
                                    </>
                                )}

                                {isPrefilled && (
                                    <View style={styles.switchCard}>
                                        <View>
                                            <Text style={styles.switchLabel}>Mark as Settled</Text>
                                            <Text style={styles.switchSub}>This will record the repayment</Text>
                                        </View>
                                        <Switch
                                            value={form.isSettled}
                                            trackColor={{ true: DARK.accent, false: DARK.border }}
                                            thumbColor="#fff"
                                            disabled
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        {/* ── Pay Using ──────────────────────────── */}
                        {(!isBorrowed || form.isSettled) && (
                            <View style={styles.section}>
                                <SectionLabel label="Pay Using" required />
                                <PillSelector options={PAYMENT_METHODS} value={form.payUsing} onChange={set('payUsing')} />
                                {errors.payUsing && <Text style={styles.errorText}>{errors.payUsing}</Text>}
                            </View>
                        )}

                        {/* ── Category ───────────────────────────── */}
                        {!isBorrowed && (
                            <View style={styles.section}>
                                <SectionLabel label="Category" required />
                                <PillSelector options={CATEGORIES} value={form.category} onChange={set('category')} />
                                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                            </View>
                        )}

                        {/* ── Two-column: Status + Date ───────────── */}
                        <View style={styles.twoCol}>
                            <View style={{ flex: 1 }}>
                                <SectionLabel label="Status" />
                                <View style={styles.statusRow}>
                                    {STATUSES.map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => set('status')(s)}
                                            style={[styles.statusChip,
                                            form.status === s && {
                                                backgroundColor: s === 'Completed' ? DARK.accent
                                                    : s === 'Pending' ? DARK.borrowed : DARK.expense,
                                                borderColor: 'transparent',
                                            }
                                            ]}
                                        >
                                            <Text style={[styles.statusText, form.status === s && { color: '#fff' }]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* ── Date ───────────────────────────────── */}
                        <View style={styles.section}>
                            <SectionLabel label="Date" required />
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                                style={[styles.dateBtn, errors.transactionDate && styles.inputError]}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={18}
                                    color={displayDate ? DARK.accent : DARK.textMuted}
                                />
                                <Text style={[styles.dateBtnText, !displayDate && styles.dateBtnPlaceholder]}>
                                    {displayDate || 'Select a date'}
                                </Text>
                                <MaterialIcons name="chevron-right" size={18} color={DARK.textMuted} />
                            </TouchableOpacity>
                            {errors.transactionDate && <Text style={styles.errorText}>{errors.transactionDate}</Text>}

                            {showDatePicker && (
                                <View style={styles.datePickerWrap}>
                                    <DateTimePicker
                                        value={form.transactionDate ? new Date(form.transactionDate) : new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        maximumDate={new Date()}
                                        themeVariant="dark"
                                        onChange={handleDateChange}
                                    />
                                </View>
                            )}
                        </View>

                        {/* ── Notes ──────────────────────────────── */}
                        <View style={styles.section}>
                            <SectionLabel label="Notes" />
                            <DarkInput
                                value={form.notes}
                                onChangeText={set('notes')}
                                placeholder="Optional notes…"
                                multiline
                            />
                        </View>

                        {/* ── Recurring ──────────────────────────── */}
                        {!isBorrowed && (
                            <View style={styles.switchCard}>
                                <View>
                                    <Text style={styles.switchLabel}>Recurring Transaction</Text>
                                    <Text style={styles.switchSub}>Repeats on a regular schedule</Text>
                                </View>
                                <Switch
                                    value={form.recurring}
                                    onValueChange={set('recurring')}
                                    trackColor={{ true: DARK.accent, false: DARK.border }}
                                    thumbColor="#fff"
                                />
                            </View>
                        )}

                        {/* Bottom spacing for action bar */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* ── Sticky Action Bar ────────────────────────── */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={resetForm}
                        disabled={isSubmitting}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={16} color={DARK.textMuted} />
                        <Text style={styles.resetBtnText}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            { backgroundColor: typeCfg.color },
                            isSubmitting && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="check-circle" size={20} color="#fff" />
                                <Text style={styles.submitBtnText}>
                                    {isEditing ? 'Update' : isPrefilled ? 'Pay Bill' : 'Add Transaction'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </Modal>
    );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: DARK.bg,
    },

    // App Bar
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 4,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: DARK.border,
        backgroundColor: DARK.card,
        gap: 12,
    },
    backBtn: {
        backgroundColor: DARK.surface,
        padding: 9,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: DARK.border,
    },
    appBarTitleWrap: { flex: 1 },
    appBarTitle: {
        color: DARK.text,
        fontSize: 17,
        fontWeight: '700',
    },
    appBarSub: {
        color: DARK.textMuted,
        fontSize: 12,
        marginTop: 1,
    },
    typePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
    },
    typePillText: { fontSize: 11, fontWeight: '700' },

    // Amount hero
    amountSection: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 4,
        backgroundColor: DARK.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: DARK.border,
    },
    amountLabel: {
        color: DARK.textMuted,
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: DARK.accent,
        paddingBottom: 6,
    },
    rupeeSymbol: {
        fontSize: 28,
        fontWeight: '700',
        marginRight: 6,
    },
    amountInput: {
        flex: 1,
        fontSize: 36,
        fontWeight: '800',
        color: DARK.text,
        padding: 0,
    },

    // Form sections
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 16 },
    section: {
        marginHorizontal: 16,
        marginTop: 18,
    },

    // Labels
    label: {
        color: DARK.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 8,
    },
    required: { color: DARK.expense },
    errorText: { color: DARK.error, fontSize: 11, marginTop: 4 },

    // Dark Input
    input: {
        backgroundColor: DARK.inputBg,
        borderWidth: 1.5,
        borderColor: DARK.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: DARK.text,
    },
    inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
    inputError: { borderColor: DARK.error },
    inputDisabled: { opacity: 0.5 },

    // Type Selector
    typeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    typeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1.5,
        backgroundColor: DARK.card,
    },
    typeChipText: { fontSize: 13, fontWeight: '700' },

    // Pills
    pillContainer: { paddingVertical: 2, paddingRight: 8 },
    pill: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: DARK.border,
        backgroundColor: DARK.surface,
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: DARK.accent,
        borderColor: DARK.accent,
    },
    pillText: { fontSize: 13, color: DARK.textMuted, fontWeight: '500' },
    pillTextActive: { color: '#fff', fontWeight: '700' },

    // Status
    twoCol: { marginHorizontal: 16, marginTop: 18 },
    statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    statusChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: DARK.border,
        backgroundColor: DARK.surface,
    },
    statusText: { color: DARK.textMuted, fontSize: 13, fontWeight: '600' },

    // Date
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: DARK.inputBg,
        borderWidth: 1.5,
        borderColor: DARK.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    dateBtnText: { flex: 1, color: DARK.text, fontSize: 14 },
    dateBtnPlaceholder: { color: DARK.textMuted },
    datePickerWrap: {
        marginTop: 8,
        backgroundColor: DARK.card,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Switch card
    switchCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 18,
        backgroundColor: DARK.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: DARK.border,
    },
    switchLabel: { color: DARK.text, fontSize: 14, fontWeight: '600' },
    switchSub: { color: DARK.textMuted, fontSize: 11, marginTop: 2 },

    // Action Bar
    actionBar: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 8 : 12,
        backgroundColor: DARK.card,
        borderTopWidth: 1,
        borderTopColor: DARK.border,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: DARK.border,
        backgroundColor: DARK.surface,
    },
    resetBtnText: { color: DARK.textMuted, fontWeight: '600', fontSize: 14 },
    submitBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    submitBtnDisabled: { opacity: 0.55 },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default CreateExpenseModal;
