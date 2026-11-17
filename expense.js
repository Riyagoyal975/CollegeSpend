/**
 * CollegeSpend - Expense Manager
 * Handles Expense CRUD operations, validation, search, filtering, and CSV export.
 */

const ExpenseManager = {
    // Validate an expense payload
    validate(expense) {
        const errors = [];

        if (!expense.title || expense.title.trim().length === 0) {
            errors.push('Expense title / description is required.');
        } else if (expense.title.trim().length > 100) {
            errors.push('Title cannot exceed 100 characters.');
        }

        const amount = Number(expense.amount);
        if (isNaN(amount) || amount <= 0) {
            errors.push('Please enter a valid expense amount greater than zero.');
        } else if (amount > 1000000) {
            errors.push('Expense amount exceeds practical limit (₹10,00,000).');
        }

        if (!expense.date) {
            errors.push('Expense date is required.');
        } else {
            const dateObj = new Date(expense.date);
            if (isNaN(dateObj.getTime())) {
                errors.push('Invalid date format.');
            }
        }

        const validCatIds = CATEGORIES.map(c => c.id);
        if (!expense.category || !validCatIds.includes(expense.category)) {
            errors.push('Please select a valid expense category.');
        }

        if (!expense.paymentMethod || !PAYMENT_METHODS.includes(expense.paymentMethod)) {
            errors.push('Please select a valid payment method.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Create a new expense
    create(data) {
        const validation = this.validate(data);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const newExpense = StorageManager.addExpense({
            title: data.title.trim(),
            amount: parseFloat(Number(data.amount).toFixed(2)),
            category: data.category,
            paymentMethod: data.paymentMethod,
            date: data.date,
            description: data.description ? data.description.trim() : ''
        });

        return { success: true, expense: newExpense };
    },

    // Update an existing expense
    update(id, data) {
        const validation = this.validate(data);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const updated = StorageManager.updateExpense(id, {
            title: data.title.trim(),
            amount: parseFloat(Number(data.amount).toFixed(2)),
            category: data.category,
            paymentMethod: data.paymentMethod,
            date: data.date,
            description: data.description ? data.description.trim() : ''
        });

        if (updated) {
            return { success: true, expense: updated };
        }
        return { success: false, errors: ['Expense not found with ID: ' + id] };
    },

    // Delete an expense
    delete(id) {
        const result = StorageManager.deleteExpense(id);
        return { success: result };
    },

    // Retrieve single expense by ID
    getById(id) {
        const expenses = StorageManager.getExpenses();
        return expenses.find(e => e.id === id) || null;
    },

    // Filter, Search, and Sort expenses
    filterAndSort(expenses, filters = {}) {
        let result = [...expenses];

        // 1. Text Search query (matches title, description, or category)
        if (filters.search && filters.search.trim() !== '') {
            const query = filters.search.toLowerCase().trim();
            result = result.filter(e => 
                e.title.toLowerCase().includes(query) ||
                (e.description && e.description.toLowerCase().includes(query)) ||
                e.category.toLowerCase().includes(query)
            );
        }

        // 2. Category filter
        if (filters.category && filters.category !== 'all') {
            result = result.filter(e => e.category === filters.category);
        }

        // 3. Payment Method filter
        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
            result = result.filter(e => e.paymentMethod === filters.paymentMethod);
        }

        // 4. Date Range filter
        if (filters.startDate) {
            result = result.filter(e => e.date >= filters.startDate);
        }
        if (filters.endDate) {
            result = result.filter(e => e.date <= filters.endDate);
        }

        // 5. Min / Max Amount
        if (filters.minAmount !== undefined && filters.minAmount !== '') {
            result = result.filter(e => e.amount >= Number(filters.minAmount));
        }
        if (filters.maxAmount !== undefined && filters.maxAmount !== '') {
            result = result.filter(e => e.amount <= Number(filters.maxAmount));
        }

        // 6. Sorting
        const sortBy = filters.sortBy || 'date_desc';
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date_asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date_desc':
                    return new Date(b.date) - new Date(a.date);
                case 'amount_asc':
                    return a.amount - b.amount;
                case 'amount_desc':
                    return b.amount - a.amount;
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        return result;
    },

    // Export expenses to CSV formatted file
    exportToCSV(expenses) {
        const headers = ['ID', 'Date', 'Title', 'Category', 'Amount (INR)', 'Payment Method', 'Description'];
        const rows = expenses.map(e => [
            `"${e.id}"`,
            `"${e.date}"`,
            `"${(e.title || '').replace(/"/g, '""')}"`,
            `"${e.category}"`,
            e.amount,
            `"${e.paymentMethod}"`,
            `"${(e.description || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `collegespend_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

window.ExpenseManager = ExpenseManager;

