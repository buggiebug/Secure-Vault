// Expense manager utility helpers
const ExpenseUtils = {
  getIndiaTime: (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  },

  formatCurrency: (amount, minimumFractionDigits = 0) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits,
      maximumFractionDigits: 2,
    });
  },

  getAmountSign: (transactionType) => {
    if (transactionType === 'Expense') return '-';
    return '+';
  },

  getAmountColor: (transactionType) => {
    if (transactionType === 'Expense') return '#F87171';
    if (transactionType === 'Borrowed') return '#FBBF24';
    return '#4ADE80';
  },

  getRelativeTime: (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return ExpenseUtils.getIndiaTime(dateStr);
  },
};

export default ExpenseUtils;
