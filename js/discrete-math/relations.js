/**
 * Discrete Mathematics Module: Relations
 * Implements Binary Relations, Ordered Pairs, Domain, Codomain, Range,
 * Relation Matrix representation, and Equivalence Relation verification (Reflexive, Symmetric, Transitive).
 */

const RelationsModule = {
    /**
     * Model 1: Expense-to-Category Assignment Relation
     * R_assign ⊆ Expenses × Categories
     * Ordered pairs: (e_i, c_j) where expense e_i is categorized under c_j
     */
    buildExpenseCategoryRelation(expenses) {
        // Domain = Set of Expense IDs / Titles
        const domain = expenses.map(e => ({ id: e.id, label: e.title.length > 22 ? e.title.substring(0, 20) + '...' : e.title }));
        
        // Codomain = Set of all predefined Categories
        const codomain = CATEGORIES.map(c => c.id);

        // Ordered pairs
        const orderedPairs = expenses.map(e => ({
            expenseId: e.id,
            expenseLabel: e.title,
            category: e.category,
            amount: e.amount,
            pairNotation: `(${e.id}, ${e.category})`
        }));

        // Range = { y ∈ Codomain | ∃x ∈ Domain, (x, y) ∈ R }
        const rangeSet = new Set(expenses.map(e => e.category));
        const range = Array.from(rangeSet);

        // Verification of Left-Total and Right-Unique (Functional relation)
        const isLeftTotal = expenses.every(e => !!e.category);
        const isRightUnique = true; // By system design, each transaction has exactly one category

        return {
            name: 'Expense-Category Mapping Relation (R_assign)',
            domainCount: domain.length,
            codomainCount: codomain.length,
            rangeCount: range.length,
            domain,
            codomain,
            range,
            orderedPairs,
            isFunction: isLeftTotal && isRightUnique,
            description: 'A binary relation mapping each recorded student expenditure to its allocated category.'
        };
    },

    /**
     * Model 2: Category Co-occurrence Relation on Categories
     * R_cooccur ⊆ Categories × Categories
     * (c1, c2) ∈ R_cooccur iff c1 and c2 were spent on the SAME calendar day (or c1 == c2)
     * Demonstrates Reflexive, Symmetric, and Transitive tests!
     */
    buildCategoryCooccurrenceRelation(expenses) {
        const categories = CATEGORIES.map(c => c.id);
        const n = categories.length;

        // Group categories by date
        const dateCategories = {};
        expenses.forEach(e => {
            if (!dateCategories[e.date]) {
                dateCategories[e.date] = new Set();
            }
            dateCategories[e.date].add(e.category);
        });

        // Initialize NxN relation matrix with zeros
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        const pairs = [];

        // Definition: (c_i, c_j) ∈ R if both spent on same day OR c_i === c_j (Reflexive closure)
        for (let i = 0; i < n; i++) {
            const catA = categories[i];
            for (let j = 0; j < n; j++) {
                const catB = categories[j];
                let related = false;

                if (i === j) {
                    // Reflexive element
                    related = true;
                } else {
                    // Check if there is any date where both catA and catB occur
                    for (const date in dateCategories) {
                        const setOnDate = dateCategories[date];
                        if (setOnDate.has(catA) && setOnDate.has(catB)) {
                            related = true;
                            break;
                        }
                    }
                }

                if (related) {
                    matrix[i][j] = 1;
                    pairs.push([catA, catB]);
                }
            }
        }

        // Test Relation Properties
        const propReflexive = this.checkReflexive(matrix, n);
        const propSymmetric = this.checkSymmetric(matrix, n);
        const propTransitive = this.checkTransitive(matrix, n);
        const isEquivalence = propReflexive.holds && propSymmetric.holds && propTransitive.holds;

        return {
            name: 'Category Same-Day Co-occurrence Relation',
            set: categories,
            matrix,
            pairs,
            properties: {
                reflexive: propReflexive,
                symmetric: propSymmetric,
                transitive: propTransitive,
                isEquivalence,
                equivalenceClasses: isEquivalence ? this.findEquivalenceClasses(categories, matrix) : null
            }
        };
    },

    /**
     * Model 3: Spending Tier Equivalence Relation
     * R_tier ⊆ Expenses × Expenses
     * e1 ~ e2 iff Tier(e1) == Tier(e2)
     * Tiers: 'Budget' (< ₹150), 'Moderate' (₹150 - ₹500), 'Major' (> ₹500)
     * This is mathematically a TRUE Equivalence Relation (partitions the expense set)!
     */
    buildSpendingTierEquivalenceRelation(expenses) {
        const getTier = (amt) => {
            if (amt < 150) return 'Micro (< ₹150)';
            if (amt <= 500) return 'Standard (₹150 - ₹500)';
            return 'Major (> ₹500)';
        };

        const sampleExpenses = expenses.slice(0, 10); // Take top 10 for clean matrix visualization
        const n = sampleExpenses.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        const pairs = [];

        for (let i = 0; i < n; i++) {
            const tierA = getTier(sampleExpenses[i].amount);
            for (let j = 0; j < n; j++) {
                const tierB = getTier(sampleExpenses[j].amount);
                if (tierA === tierB) {
                    matrix[i][j] = 1;
                    pairs.push([sampleExpenses[i].id, sampleExpenses[j].id]);
                }
            }
        }

        const reflexive = this.checkReflexive(matrix, n);
        const symmetric = this.checkSymmetric(matrix, n);
        const transitive = this.checkTransitive(matrix, n);

        // Group into Equivalence Classes
        const partitions = {
            'Micro (< ₹150)': [],
            'Standard (₹150 - ₹500)': [],
            'Major (> ₹500)': []
        };
        sampleExpenses.forEach(e => {
            const t = getTier(e.amount);
            partitions[t].push(`${e.title} (₹${e.amount})`);
        });

        return {
            name: 'Spending Tier Equivalence Relation (R_tier)',
            description: 'Defined as e_i ~ e_j ⇔ Tier(e_i) = Tier(e_j). Partitions the universe of transactions into mutually disjoint equivalence classes.',
            sampleExpenses,
            matrix,
            pairsCount: pairs.length,
            properties: {
                reflexive,
                symmetric,
                transitive,
                isEquivalence: true // Mathematically guaranteed by equality of tier image
            },
            partitions
        };
    },

    // 1. Reflexive Test: ∀a ∈ S, (a, a) ∈ R ⇔ M[i][i] == 1 for all i
    checkReflexive(matrix, n) {
        if (n === 0) return { holds: false, reason: 'Empty relation' };
        for (let i = 0; i < n; i++) {
            if (matrix[i][i] !== 1) {
                return {
                    holds: false,
                    reason: `Diagonal element M[${i}][${i}] is 0. Element is not self-related.`
                };
            }
        }
        return {
            holds: true,
            reason: `All ${n} diagonal elements M[i][i] are 1. Every element is related to itself.`
        };
    },

    // 2. Symmetric Test: ∀a, b, (a, b) ∈ R → (b, a) ∈ R ⇔ M == M^T
    checkSymmetric(matrix, n) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] !== matrix[j][i]) {
                    return {
                        holds: false,
                        reason: `Asymmetry detected at M[${i}][${j}] = ${matrix[i][j]} but M[${j}][${i}] = ${matrix[j][i]}.`
                    };
                }
            }
        }
        return {
            holds: true,
            reason: 'Matrix is symmetric about its principal diagonal: M = Mᵀ. For all (a, b) ∈ R, (b, a) ∈ R.'
        };
    },

    // 3. Transitive Test: ∀a, b, c, (a, b) ∈ R ∧ (b, c) ∈ R → (a, c) ∈ R
    checkTransitive(matrix, n) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] === 1) {
                    for (let k = 0; k < n; k++) {
                        if (matrix[j][k] === 1 && matrix[i][k] !== 1) {
                            return {
                                holds: false,
                                reason: `Transitivity fails: (${i}, ${j}) ∈ R and (${j}, ${k}) ∈ R, but (${i}, ${k}) ∉ R.`
                            };
                        }
                    }
                }
            }
        }
        return {
            holds: true,
            reason: 'Whenever (a, b) ∈ R and (b, c) ∈ R, (a, c) ∈ R holds for all triplets.'
        };
    },

    // Find equivalence classes for an equivalence relation
    findEquivalenceClasses(elements, matrix) {
        const visited = new Set();
        const classes = [];
        for (let i = 0; i < elements.length; i++) {
            if (!visited.has(i)) {
                const cls = [];
                for (let j = 0; j < elements.length; j++) {
                    if (matrix[i][j] === 1) {
                        visited.add(j);
                        cls.push(elements[j]);
                    }
                }
                classes.push(cls);
            }
        }
        return classes;
    }
};

window.RelationsModule = RelationsModule;

