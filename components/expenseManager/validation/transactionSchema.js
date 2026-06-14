const transactionSchema = {
  id: Number, // Unique identifier for each transaction
  description: String, // Description of the transaction (e.g., 'Grocery Shopping')
  date: Date, // Date and time of the transaction (e.g., '2024-11-01 14:35:00')
  amount: Number, // Transaction amount, positive for income and negative for expenses
  payUsing: String, // Payment method (e.g., 'Paytm', 'GPay', 'IMPS')
  category: String, // Category of the transaction (e.g., 'Food', 'Salary', 'Bills')
  transactionType: String, // Type of transaction ('Income' or 'Expense')
  location: String, // Optional field for location details (e.g., 'City or Store Name')
  recurring: Boolean, // Boolean to indicate if the transaction is recurring
  notes: String, // Optional field for any additional notes
  upiId: String, // Optional UPI ID if payment was through UPI
  accountNumber: String, // Optional account number for bank transactions
  status: String, // "Completed", "Pending", "Failed"
  discount: Number,
  cashback: Number,
};


export default transactionSchema;