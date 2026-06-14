const TransactionValidate = (data) => {
    const { description, transactionDate, amount, discount, cashback, payUsing, category, transactionType,
        location, recurring, notes, upiId, accountNumber, status, lenderName, borrowedType, isSettled
    } = data;
    let errors = [];
    let success = true;

    if (!description) {
        success = false; errors.push("Description required");
    }

    if (!amount) {
        success = false; errors.push("Amount required");
    }

    if (Number(amount) <= 0) {
        success = false; errors.push("Enter a valid amount");
    }

    if (transactionType && !['Income', 'Expense', 'Borrowed'].includes(transactionType)) {
        success = false; errors.push("Transaction Type required");
    }

    if (transactionType === "Borrowed") {
        if (!lenderName) {
            success = false; errors.push("Lender Name required");
        }
        if(isSettled && !payUsing) {
            success = false; errors.push("Pay Using required");
        }
    }

    if (!payUsing && transactionType !== "Borrowed"){
        success = false; errors.push("Pay Using required");
    }
    if (!category && transactionType !== "Borrowed") {
        success = false; errors.push("Category required");
    }

    if (recurring) {
        if (recurring !== true && recurring !== false) {
            success = false; errors.push('Recurring type must be boolean');
        }
    }

    if (status && !["Pending", "Failed", "Completed"].includes(status)) {
        success = false; errors.push("Status must be one of [Pending, Failed, Completed]");
    }

    if(!transactionDate){
        success = false; errors.push("Date required");
    }

    return {
        success,
        errors,
        data
    };
}

module.exports = TransactionValidate