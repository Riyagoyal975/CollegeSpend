/**
 * CollegeSpend - Data Storage & Model Manager
 * Handles LocalStorage persistence, default demo data, and data import/export.
 */

const STORAGE_KEYS = {
    EXPENSES: 'collegespend_expenses',
    BUDGET: 'collegespend_budget',
    SETTINGS: 'collegespend_settings',
    CATEGORY_BUDGETS: 'collegespend_cat_budgets'
};

// Standard College Expense Categories
const CATEGORIES = [
    { id: 'Food', name: 'Food & Canteen', icon: '🍔', color: '#f59e0b', type: 'essential' },
    { id: 'Travel', name: 'Travel & Metro', icon: '🚌', color: '#3b82f6', type: 'essential' },
    { id: 'Stationery', name: 'Stationery & Books', icon: '📚', color: '#10b981', type: 'essential' },
    { id: 'Shopping', name: 'Shopping & Clothes', icon: '🛍️', color: '#ec4899', type: 'discretionary' },
    { id: 'College Fees', name: 'College & Exam Fees', icon: '🎓', color: '#8b5cf6', type: 'essential' },
    { id: 'Entertainment', name: 'Entertainment & Outings', icon: '🎬', color: '#ef4444', type: 'discretionary' },
    { id: 'Others', name: 'Others & Misc', icon: '📦', color: '#6b7280', type: 'discretionary' }
];

const PAYMENT_METHODS = ['UPI / GPay / PhonePe', 'Cash', 'Debit / Credit Card', 'Net Banking'];

// Generate realistic dates within current month & previous days
function getRelativeDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Sample realistic demo expenses for a B.Tech student
const DEFAULT_EXPENSES = [
    {
        id: 'exp-101',
        title: 'College Canteen Lunch & Chai',
        amount: 140,
        category: 'Food',
        date: getRelativeDate(0),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Samosa, Veg Thali and cutting chai with batchmates',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-102',
        title: 'Monthly Metro Smart Card Recharge',
        amount: 600,
        category: 'Travel',
        date: getRelativeDate(1),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Monthly pass for college commute',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-103',
        title: 'Discrete Mathematics Textbook & Notebooks',
        amount: 480,
        category: 'Stationery',
        date: getRelativeDate(2),
        paymentMethod: 'Cash',
        description: 'Kenneth Rosen Discrete Math reference guide and 2 register notebooks',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-104',
        title: 'Semester Mid-Term Exam Fee',
        amount: 1200,
        category: 'College Fees',
        date: getRelativeDate(4),
        paymentMethod: 'Net Banking',
        description: '3rd Semester Examination and Lab Assessment Fee',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-105',
        title: 'Movie Ticket & Popcorn with Friends',
        amount: 380,
        category: 'Entertainment',
        date: getRelativeDate(5),
        paymentMethod: 'Debit / Credit Card',
        description: 'Weekend sci-fi movie at mall multiplex',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-106',
        title: 'College Mess Dinner',
        amount: 90,
        category: 'Food',
        date: getRelativeDate(5),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Extra non-veg dinner coupon',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-107',
        title: 'Scientific Calculator fx-991CW',
        amount: 1150,
        category: 'Stationery',
        date: getRelativeDate(7),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Mandatory calculator for engineering exams and lab sessions',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-108',
        title: 'Campus Printing & Lab Record Binding',
        amount: 120,
        category: 'Stationery',
        date: getRelativeDate(8),
        paymentMethod: 'Cash',
        description: 'Data Structures and Discrete Math lab assignment spiral prints',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-109',
        title: 'Auto-Rickshaw to Campus',
        amount: 70,
        category: 'Travel',
        date: getRelativeDate(9),
        paymentMethod: 'Cash',
        description: 'Shared auto from metro station during morning rush',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-110',
        title: 'Hostel Night Canteen Maggi & Coffee',
        amount: 85,
        category: 'Food',
        date: getRelativeDate(10),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Late night coding session snack',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-111',
        title: 'College Fest T-Shirt & Merchandise',
        amount: 450,
        category: 'Shopping',
        date: getRelativeDate(12),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Annual Tech Fest customized batch t-shirt',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-112',
        title: 'Spotify Student Subscription',
        amount: 59,
        category: 'Entertainment',
        date: getRelativeDate(14),
        paymentMethod: 'Debit / Credit Card',
        description: 'Monthly student premium music plan',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-113',
        title: 'Mobile Phone Data Recharge (50GB)',
        amount: 299,
        category: 'Others',
        date: getRelativeDate(15),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Add-on data pack for online lectures and project research',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-114',
        title: 'Pharmacy Cold Medicine & Vicks',
        amount: 135,
        category: 'Others',
        date: getRelativeDate(17),
        paymentMethod: 'Cash',
        description: 'Seasonal cough syrup and lozenges from campus chemist',
        createdAt: new Date().toISOString()
    },
    {
        id: 'exp-115',
        title: 'Weekend Evening Pizza with Roommates',
        amount: 320,
        category: 'Food',
        date: getRelativeDate(18),
        paymentMethod: 'UPI / GPay / PhonePe',
        description: 'Shared large pizza split after project submission',
        createdAt: new Date().toISOString()
    }
];

const DEFAULT_SETTINGS = {
    studentName: '',
    rollNumber: '',
    course: 'B.Tech Computer Science and Engineering',
    semester: '3rd Semester',
    universityName: 'Manav Rachna University',
    projectTitle: 'CollegeSpend – Smart College Daily Expense Tracker',
    groupMembers: '',
    currency: '₹',
    monthlyBudget: 8000,
    theme: 'dark'
};

const StorageManager = {
    // Initialize storage with defaults if empty
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
            this.setExpenses(DEFAULT_EXPENSES);
        }
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            this.setSettings(DEFAULT_SETTINGS);
        }
    },

    // Expenses
    getExpenses() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading expenses from localStorage', e);
            return [];
        }
    },

    setExpenses(expenses) {
        try {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
            // Dispatch event for reactive UI updates
            window.dispatchEvent(new CustomEvent('expensesUpdated', { detail: { expenses } }));
            return true;
        } catch (e) {
            console.error('Error saving expenses to localStorage', e);
            return false;
        }
    },

    addExpense(expense) {
        const expenses = this.getExpenses();
        const newExpense = {
            id: 'exp-' + Date.now(),
            createdAt: new Date().toISOString(),
            ...expense
        };
        expenses.unshift(newExpense);
        this.setExpenses(expenses);
        return newExpense;
    },

    updateExpense(id, updatedData) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedData, updatedAt: new Date().toISOString() };
            this.setExpenses(expenses);
            return expenses[index];
        }
        return null;
    },

    deleteExpense(id) {
        let expenses = this.getExpenses();
        const initialLength = expenses.length;
        expenses = expenses.filter(e => e.id !== id);
        if (expenses.length !== initialLength) {
            this.setExpenses(expenses);
            return true;
        }
        return false;
    },

    // Settings
    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (!data) return { ...DEFAULT_SETTINGS };
            const parsed = JSON.parse(data);
            // Clear out legacy hardcoded name if previously stored
            if (parsed.studentName === 'Aarav Sharma') {
                parsed.studentName = '';
            }
            if (parsed.collegeName && !parsed.universityName) {
                parsed.universityName = parsed.collegeName;
            }
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    },

    setSettings(settings) {
        try {
            const merged = { ...this.getSettings(), ...settings };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: { settings: merged } }));
            return true;
        } catch (e) {
            console.error('Error saving settings', e);
            return false;
        }
    },

    // Reset to demo data
    resetToDemoData() {
        this.setExpenses(DEFAULT_EXPENSES);
        this.setSettings(DEFAULT_SETTINGS);
        return true;
    },

    // Clear all user transactions
    clearAllData() {
        this.setExpenses([]);
        return true;
    },

    // Export data to JSON string
    exportDataJSON() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            settings: this.getSettings(),
            expenses: this.getExpenses()
        };
        return JSON.stringify(data, null, 2);
    },

    // Import from JSON string
    importDataJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data.expenses)) {
                this.setExpenses(data.expenses);
                if (data.settings) {
                    this.setSettings(data.settings);
                }
                return { success: true, count: data.expenses.length };
            }
            return { success: false, error: 'Invalid file format: missing expenses array' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};

// Auto initialize on load
StorageManager.init();

