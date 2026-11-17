/**
 * Discrete Mathematics Module: Propositional Logic & Boolean Algebra
 * Implements truth evaluation of live financial propositions,
 * logical connectives (¬, ∧, ∨, →, ↔, ⊕), Truth Table generator,
 * and Tautology / Contradiction / Contingency classification.
 */

const LogicModule = {
    // Basic Logical Connectives
    NOT(p) { return !p; },
    AND(p, q) { return p && q; },
    OR(p, q) { return p || q; },
    IMPLIES(p, q) { return (!p) || q; }, // Material Implication: p → q ≡ ¬p ∨ q
    BICONDITIONAL(p, q) { return p === q; }, // Biconditional: p ↔ q ≡ (p → q) ∧ (q → p)
    XOR(p, q) { return (p && !q) || (!p && q); },

    /**
     * Evaluate Live Atomic Propositions against actual user expense state
     */
    evaluateLivePropositions(expenses, monthlyBudget, thresholdAmount = 500, selectedCategory = 'Food') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Total this month (Timezone-safe string matching)
        const thisMonthExpenses = expenses.filter(e => {
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
        const currentMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // Proposition P: "Monthly budget is exceeded" (Total_month > Budget)
        const P = currentMonthTotal > monthlyBudget;

        // Proposition Q: "There exists at least one expense > threshold (₹500)"
        const Q = expenses.some(e => Number(e.amount) > thresholdAmount);

        // Proposition R: "Student has spent on selectedCategory (e.g. Food)"
        const R = expenses.some(e => e.category === selectedCategory);

        // Proposition S: "Remaining budget is healthy (≥ 25% remaining)"
        const remaining = monthlyBudget - currentMonthTotal;
        const S = monthlyBudget > 0 ? (remaining / monthlyBudget >= 0.25) : false;

        // Evaluate compound logic expressions
        const compoundResults = [
            {
                expression: 'P ∧ Q',
                name: 'Budget Exceeded AND High Single Expense Exists',
                formula: 'P ∧ Q',
                value: this.AND(P, Q),
                interpretation: (this.AND(P, Q))
                    ? 'CRITICAL ALERT: Budget is completely blown and big ticket expenses were made!'
                    : 'Condition not jointly active.'
            },
            {
                expression: 'P → ¬S',
                name: 'If Budget Exceeded, then Safe Budget is False',
                formula: 'P → ¬S',
                value: this.IMPLIES(P, this.NOT(S)),
                interpretation: 'Logical Consistency: By definition, if budget is exceeded, remaining budget cannot be healthy (True).'
            },
            {
                expression: 'Q ∨ R',
                name: 'High Expense Recorded OR Selected Category Spent',
                formula: 'Q ∨ R',
                value: this.OR(Q, R),
                interpretation: `At least one condition holds true: Single expense > ₹${thresholdAmount} or active spending in ${selectedCategory}.`
            },
            {
                expression: '¬P ∧ S',
                name: 'Budget Under Limit AND Healthy Surplus Exists',
                formula: '¬P ∧ S',
                value: this.AND(this.NOT(P), S),
                interpretation: (this.AND(this.NOT(P), S))
                    ? 'Optimal Financial Health: Student spending is well within planned parameters.'
                    : 'Student is near or above threshold limits.'
            },
            {
                expression: 'P ↔ (Remaining < 0)',
                name: 'Budget Exceeded Equivalent to Negative Residue',
                formula: 'P ↔ (Residue < 0)',
                value: this.BICONDITIONAL(P, remaining < 0),
                interpretation: 'Mathematical Tautology: Definition of budget deficit matches the condition.'
            }
        ];

        return {
            propositions: {
                P: {
                    symbol: 'P',
                    statement: `Monthly budget of ₹${monthlyBudget} is exceeded (Current: ₹${currentMonthTotal})`,
                    value: P,
                    raw: `Current Month: ₹${currentMonthTotal} > Budget: ₹${monthlyBudget}`
                },
                Q: {
                    symbol: 'Q',
                    statement: `At least one transaction amount exceeds threshold ₹${thresholdAmount}`,
                    value: Q,
                    raw: `Max expense recorded: ₹${expenses.length ? Math.max(...expenses.map(e => e.amount)) : 0}`
                },
                R: {
                    symbol: 'R',
                    statement: `At least one expense belongs to "${selectedCategory}" category`,
                    value: R,
                    raw: `Transactions in ${selectedCategory}: ${expenses.filter(e => e.category === selectedCategory).length}`
                },
                S: {
                    symbol: 'S',
                    statement: 'Remaining monthly budget is healthy (≥ 25%)',
                    value: S,
                    raw: `Remaining: ₹${remaining} (${monthlyBudget > 0 ? Math.round((remaining / monthlyBudget) * 100) : 0}%)`
                }
            },
            compoundResults
        };
    },

    /**
     * Generate Full 2^n Truth Table for standard logical operations
     * Supports 2 variables (P, Q) or 3 variables (P, Q, R)
     */
    generateTruthTable(variables = ['P', 'Q']) {
        const rows = [];
        const n = variables.length;
        const totalRows = Math.pow(2, n);

        for (let i = 0; i < totalRows; i++) {
            // Truth assignments: e.g. T T, T F, F T, F F
            const assignment = {};
            for (let j = 0; j < n; j++) {
                const bit = (i >> (n - 1 - j)) & 1;
                // 1 -> True, 0 -> False
                assignment[variables[j]] = (bit === 0); // standard conventional table order: T then F
            }

            const p = assignment['P'];
            const q = assignment['Q'];
            const r = assignment['R'] !== undefined ? assignment['R'] : false;

            const row = {
                inputs: { ...assignment },
                results: {
                    notP: this.NOT(p),
                    and: this.AND(p, q),
                    or: this.OR(p, q),
                    implies: this.IMPLIES(p, q),
                    biconditional: this.BICONDITIONAL(p, q),
                    xor: this.XOR(p, q)
                }
            };

            if (n === 3) {
                row.results.pAndQImpliesR = this.IMPLIES(this.AND(p, q), r);
                row.results.pOrQAndR = this.AND(this.OR(p, q), r);
            }

            rows.push(row);
        }

        return {
            variables,
            rows,
            headers: n === 2 
                ? ['P', 'Q', '¬P', 'P ∧ Q', 'P ∨ Q', 'P → Q', 'P ↔ Q', 'P ⊕ Q']
                : ['P', 'Q', 'R', 'P ∧ Q', 'P ∨ Q', 'P → Q', '(P ∧ Q) → R', '(P ∨ Q) ∧ R']
        };
    },

    /**
     * Classify an arbitrary formula as Tautology, Contradiction, or Contingency
     * Example: P ∨ ¬P (Tautology), P ∧ ¬P (Contradiction), P ∧ Q (Contingency)
     */
    classifyExpression(expressionType) {
        // Supported types: 'tautology', 'contradiction', 'contingency', 'demorgan'
        const table = this.generateTruthTable(['P', 'Q']);
        let results = [];
        let formulaName = '';
        let formulaString = '';

        switch (expressionType) {
            case 'tautology':
                formulaName = 'Law of Excluded Middle (P ∨ ¬P)';
                formulaString = 'P ∨ ¬P';
                results = table.rows.map(r => this.OR(r.inputs.P, !r.inputs.P));
                break;
            case 'contradiction':
                formulaName = 'Principle of Contradiction (P ∧ ¬P)';
                formulaString = 'P ∧ ¬P';
                results = table.rows.map(r => this.AND(r.inputs.P, !r.inputs.P));
                break;
            case 'demorgan':
                formulaName = "De Morgan's First Law: ¬(P ∧ Q) ↔ (¬P ∨ ¬Q)";
                formulaString = '¬(P ∧ Q) ↔ (¬P ∨ ¬Q)';
                results = table.rows.map(r => {
                    const left = !this.AND(r.inputs.P, r.inputs.Q);
                    const right = this.OR(!r.inputs.P, !r.inputs.Q);
                    return this.BICONDITIONAL(left, right);
                });
                break;
            case 'implication_equivalence':
                formulaName = 'Implication Identity: (P → Q) ↔ (¬P ∨ Q)';
                formulaString = '(P → Q) ↔ (¬P ∨ Q)';
                results = table.rows.map(r => {
                    const left = this.IMPLIES(r.inputs.P, r.inputs.Q);
                    const right = this.OR(!r.inputs.P, r.inputs.Q);
                    return this.BICONDITIONAL(left, right);
                });
                break;
            default:
                formulaName = 'Contingent Spending Conjunction (P ∧ Q)';
                formulaString = 'P ∧ Q';
                results = table.rows.map(r => this.AND(r.inputs.P, r.inputs.Q));
                break;
        }

        const allTrue = results.every(v => v === true);
        const allFalse = results.every(v => v === false);

        let classification = 'Contingency';
        let explanation = 'The truth value depends on the truth values of its constituent atomic propositions (contains both True and False outcomes).';

        if (allTrue) {
            classification = 'Tautology (Universally Valid)';
            explanation = 'The compound proposition evaluates to TRUE in EVERY possible truth assignment across the universe of interpretation.';
        } else if (allFalse) {
            classification = 'Contradiction (Absurdity)';
            explanation = 'The compound proposition evaluates to FALSE in EVERY possible truth assignment.';
        }

        return {
            formulaName,
            formulaString,
            results,
            classification,
            explanation,
            isTautology: allTrue,
            isContradiction: allFalse,
            isContingency: !allTrue && !allFalse
        };
    }
};

window.LogicModule = LogicModule;

