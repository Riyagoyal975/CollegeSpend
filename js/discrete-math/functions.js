/**
 * Discrete Mathematics Module: Functions
 * Models mathematical functions f: X -> Y
 * Tests Injective (One-to-One), Surjective (Onto), Bijective properties,
 * implements Composite Functions (g ∘ f)(x), and mathematical aggregations (Total, Average, Budget residue).
 */

const FunctionsModule = {
    /**
     * Formal Function 1: Category Mapping Function
     * f_cat: Expenses -> Categories
     * Maps each expense transaction e ∈ Expenses to exactly one c ∈ Categories
     */
    analyzeCategoryFunction(expenses) {
        const domain = expenses.map(e => e.id);
        const codomain = CATEGORIES.map(c => c.id);

        // Map: ExpenseId -> Category
        const mapping = {};
        const imageElements = new Set();
        const categoryPreimages = {}; // c -> [e1, e2]

        codomain.forEach(c => categoryPreimages[c] = []);

        expenses.forEach(e => {
            mapping[e.id] = e.category;
            imageElements.add(e.category);
            if (categoryPreimages[e.category]) {
                categoryPreimages[e.category].push(e.id);
            }
        });

        // 1. Injective (One-to-One) Test:
        // f(a) = f(b) -> a = b.
        // If domain has > codomain elements, Pigeonhole Principle implies it cannot be injective!
        let isInjective = true;
        let injectiveCounterExample = null;

        for (const cat in categoryPreimages) {
            if (categoryPreimages[cat].length > 1) {
                isInjective = false;
                const e1 = expenses.find(e => e.id === categoryPreimages[cat][0]);
                const e2 = expenses.find(e => e.id === categoryPreimages[cat][1]);
                injectiveCounterExample = {
                    category: cat,
                    e1: `${e1.title} (${e1.id})`,
                    e2: `${e2.title} (${e2.id})`,
                    explanation: `Pigeonhole Principle: Both "${e1.title}" and "${e2.title}" map to the same category "${cat}". Therefore, f is NOT Injective (Many-to-One).`
                };
                break;
            }
        }

        // 2. Surjective (Onto) Test:
        // Range = Codomain (every category has at least one pre-image)
        const missingCategories = codomain.filter(c => !imageElements.has(c));
        const isSurjective = missingCategories.length === 0;

        // 3. Bijective Test:
        const isBijective = isInjective && isSurjective;

        return {
            name: 'Category Mapping Function: f_cat: E → C',
            domainSize: domain.length,
            codomainSize: codomain.length,
            rangeSize: imageElements.size,
            mapping,
            categoryPreimages,
            isInjective,
            injectiveExplanation: isInjective 
                ? 'Every expense maps to a distinct category (strictly one-to-one).'
                : (injectiveCounterExample ? injectiveCounterExample.explanation : 'Multiple expenses share categories.'),
            isSurjective,
            surjectiveExplanation: isSurjective
                ? 'Range equals Codomain. Every defined category has at least one logged expense (Onto).'
                : `Range ⊂ Codomain. Categories without expenses: { ${missingCategories.join(', ')} }. Therefore, f is NOT Surjective.`,
            isBijective,
            bijectiveExplanation: isBijective
                ? 'f is both Injective and Surjective; an exact one-to-one correspondence exists (Invertible).'
                : 'Since f is not both injective and surjective, it is NOT Bijective (cannot have a two-sided inverse function).'
        };
    },

    /**
     * Formal Function 2: Amount Evaluation Function
     * g_amt: Expenses -> ℝ⁺
     * Maps each expense to its monetary cost
     */
    analyzeAmountFunction(expenses) {
        const domain = expenses.map(e => ({ id: e.id, title: e.title, amount: e.amount }));
        const amounts = expenses.map(e => e.amount);

        // Check injectivity: do any two transactions share the same amount?
        const seenAmounts = new Map();
        let duplicateFound = null;

        for (const e of expenses) {
            if (seenAmounts.has(e.amount)) {
                duplicateFound = {
                    amount: e.amount,
                    expA: seenAmounts.get(e.amount),
                    expB: e.title
                };
                break;
            } else {
                seenAmounts.set(e.amount, e.title);
            }
        }

        const isInjective = !duplicateFound;

        return {
            name: 'Amount Evaluation Function: g_amt: E → ℝ⁺',
            isInjective,
            explanation: isInjective 
                ? 'All logged expenses have unique amounts.'
                : `Distinct transactions "${duplicateFound.expA}" and "${duplicateFound.expB}" both have amount ₹${duplicateFound.amount}. Hence not injective.`
        };
    },

    /**
     * Mathematical Aggregation Functions (Calculus of Spending)
     */
    calculateAggregates(expenses, monthlyBudget) {
        // Total Expense: Summation Function Σ e.amount
        const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // Arithmetic Mean: μ = (1 / n) Σ e_i
        const count = expenses.length;
        const averageExpense = count > 0 ? (totalExpense / count) : 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12
        const localTodayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const utcTodayStr = now.toISOString().split('T')[0];

        // Current Month Filter Function (Timezone-safe string matching)
        const currentMonthExpenses = expenses.filter(e => {
            if (!e.date) return false;
            const clean = String(e.date).split('T')[0].trim();
            const parts = clean.split('-');
            if (parts.length >= 2) {
                const y = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                return y === currentYear && m === currentMonth;
            }
            return false;
        });

        const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const currentMonthCount = currentMonthExpenses.length;

        // Remaining Budget Residue Function: R(b, E) = b - Σ_{e ∈ Month} amount(e)
        const remainingBudget = monthlyBudget - currentMonthTotal;
        const budgetUsagePercentage = monthlyBudget > 0 ? ((currentMonthTotal / monthlyBudget) * 100) : 0;

        // Today's Expenses: Filter transactions using the unified date filter
        const todayExpenses = expenses.filter(e => {
            if (!e.date) return false;
            const clean = String(e.date).split('T')[0].trim();
            return clean === localTodayStr || clean === utcTodayStr;
        });

        // Both total amount and count are derived strictly from the same todayExpenses array
        const todayTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const todayCount = todayExpenses.length;

        return {
            count,
            totalExpense,
            averageExpense: Math.round(averageExpense * 100) / 100,
            currentMonthExpenses,
            currentMonthTotal,
            currentMonthCount,
            remainingBudget,
            budgetUsagePercentage: Math.min(Math.round(budgetUsagePercentage * 10) / 10, 999),
            todayExpenses,
            todayTotal,
            todayCount,
            isOverBudget: remainingBudget < 0
        };
    },

    /**
     * Composite Function Implementation:
     * Let f: Transaction -> Amount (in ₹)
     * Let g: Amount -> Tax / Surcharge (e.g. 5% GST on dining / platform fee)
     * Let h: Amount -> Remaining Monthly Budget impact
     * (g ∘ f)(t) = g(f(t))
     * (h ∘ f)(t) = RemainingBudget - f(t)
     */
    evaluateComposition(sampleAmount, budgetRemaining, gstRate = 0.05) {
        const f = (amt) => Number(amt);
        const g = (amt) => Math.round(amt * gstRate * 100) / 100; // Tax
        const compositeTotalCost = (amt) => f(amt) + g(amt);
        const compositeBudgetResidue = (amt) => budgetRemaining - compositeTotalCost(amt);

        const amt = f(sampleAmount);
        const tax = g(amt);
        const total = compositeTotalCost(amt);
        const newBudgetResidue = compositeBudgetResidue(amt);

        return {
            inputAmount: amt,
            tax,
            totalWithTax: total,
            budgetResidue: newBudgetResidue,
            notation: `(h ∘ g ∘ f)(x) = InitialBudget − (x + ${gstRate * 100}% of x)`
        };
    }
};

window.FunctionsModule = FunctionsModule;

