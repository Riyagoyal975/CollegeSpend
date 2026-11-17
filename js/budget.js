/**
 * CollegeSpend - Budget Manager
 * Monitors monthly spending against target budget, computes daily allowance,
 * calculates category allocations, and generates financial warning states.
 */

const BudgetManager = {
    // Retrieve budget config from storage
    getBudgetConfig() {
        const settings = StorageManager.getSettings();
        return {
            monthlyBudget: Number(settings.monthlyBudget) || 8000,
            currency: settings.currency || '₹'
        };
    },

    // Set new monthly budget
    setMonthlyBudget(amount) {
        const num = Number(amount);
        if (isNaN(num) || num <= 0) {
            return { success: false, error: 'Budget must be a positive number.' };
        }
        StorageManager.setSettings({ monthlyBudget: num });
        return { success: true, monthlyBudget: num };
    },

    // Calculate budget health and metrics for the current calendar month
    calculateStatus(expenses) {
        const { monthlyBudget, currency } = this.getBudgetConfig();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        // Calculate days in month and days remaining
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);

        // Filter transactions for current month (Timezone-safe string matching)
        const currentMonthExpenses = expenses.filter(e => {
            if (!e.date) return false;
            const clean = String(e.date).split('T')[0].trim();
            const parts = clean.split('-');
            if (parts.length >= 2) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                return y === currentYear && m === (currentMonth + 1);
            }
            return false;
        });

        const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const remainingBudget = monthlyBudget - totalSpentThisMonth;
        const usagePercentage = monthlyBudget > 0 ? (totalSpentThisMonth / monthlyBudget) * 100 : 0;

        // Daily recommended safe burn rate
        const dailySafeAllowance = remainingBudget > 0 ? (remainingBudget / daysRemaining) : 0;
        const currentDailyBurnRate = currentDay > 0 ? (totalSpentThisMonth / currentDay) : 0;

        // Determine Budget Status Tier
        let status = 'safe'; // 'safe' | 'warning' | 'danger'
        let message = 'Your spending is well within the allocated monthly budget.';
        let alertClass = 'badge-success';

        if (totalSpentThisMonth > monthlyBudget) {
            status = 'exceeded';
            message = `⚠️ ALERT: You have exceeded your monthly budget by ${currency}${Math.abs(remainingBudget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}!`;
            alertClass = 'badge-danger';
        } else if (usagePercentage >= 85) {
            status = 'warning';
            message = `⚠️ CAUTION: You have used ${usagePercentage.toFixed(1)}% of your monthly budget. Only ${currency}${remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining!`;
            alertClass = 'badge-warning';
        } else if (usagePercentage >= 65) {
            status = 'moderate';
            message = `Notice: Budget usage is at ${usagePercentage.toFixed(1)}%. Maintain recommended daily spend of ${currency}${dailySafeAllowance.toFixed(0)}/day.`;
            alertClass = 'badge-info';
        }

        // Category-wise spending in current month
        const categorySpending = {};
        CATEGORIES.forEach(c => { categorySpending[c.id] = 0; });
        currentMonthExpenses.forEach(e => {
            if (categorySpending[e.category] !== undefined) {
                categorySpending[e.category] += Number(e.amount);
            }
        });

        return {
            monthlyBudget,
            currency,
            totalSpentThisMonth,
            remainingBudget,
            usagePercentage: Math.min(Math.round(usagePercentage * 10) / 10, 999),
            daysRemaining,
            dailySafeAllowance: Math.round(dailySafeAllowance),
            currentDailyBurnRate: Math.round(currentDailyBurnRate),
            status,
            message,
            alertClass,
            categorySpending,
            isOverBudget: totalSpentThisMonth > monthlyBudget
        };
    }
};

window.BudgetManager = BudgetManager;

