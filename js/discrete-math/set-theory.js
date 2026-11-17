/**
 * Discrete Mathematics Module: Set Theory
 * Implements fundamental set operations using native JavaScript Set instances.
 * Computes: Union, Intersection, Difference, Symmetric Difference, Cartesian Product, Cardinality, Subset check.
 */

const SetTheoryModule = {
    // Universe of Discourse: All standard college expense categories
    universalSet: new Set(['Food', 'Travel', 'Stationery', 'Shopping', 'College Fees', 'Entertainment', 'Others']),

    // Preset sets representing student spending profiles for demonstration & viva questions
    presets: {
        weekdaysVsWeekends: {
            title: 'Weekday vs Weekend Expenses',
            description: 'Categories where a student spent money during Monday-Friday (A) versus Saturday-Sunday (B).',
            setA: new Set(['Food', 'Travel', 'Stationery']),
            setB: new Set(['Food', 'Shopping', 'Entertainment']),
            labelA: 'Weekday Spending (A)',
            labelB: 'Weekend Spending (B)'
        },
        hostelVsDayScholar: {
            title: 'Hostel Resident vs Day Scholar Expenses',
            description: 'Comparison of common expense categories for a Hostel resident (A) and Day Scholar commuter (B).',
            setA: new Set(['Food', 'Entertainment', 'Others', 'College Fees']),
            setB: new Set(['Travel', 'Food', 'Stationery', 'College Fees']),
            labelA: 'Hostel Resident (A)',
            labelB: 'Day Scholar (B)'
        },
        essentialVsDiscretionary: {
            title: 'Essential vs Discretionary Categories',
            description: 'Categories considered fundamental needs (A) vs lifestyle wants (B).',
            setA: new Set(['Food', 'Travel', 'Stationery', 'College Fees']),
            setB: new Set(['Shopping', 'Entertainment', 'Others']),
            labelA: 'Essential Needs (A)',
            labelB: 'Discretionary Wants (B)'
        }
    },

    // 1. Union: A ∪ B = { x | x ∈ A ∨ x ∈ B }
    union(setA, setB) {
        const result = new Set(setA);
        for (const elem of setB) {
            result.add(elem);
        }
        return result;
    },

    // 2. Intersection: A ∩ B = { x | x ∈ A ∧ x ∈ B }
    intersection(setA, setB) {
        const result = new Set();
        for (const elem of setA) {
            if (setB.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    },

    // 3. Difference: A \ B = { x | x ∈ A ∧ x ∉ B }
    difference(setA, setB) {
        const result = new Set();
        for (const elem of setA) {
            if (!setB.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    },

    // 4. Symmetric Difference: A Δ B = (A \ B) ∪ (B \ A)
    symmetricDifference(setA, setB) {
        const diffAB = this.difference(setA, setB);
        const diffBA = this.difference(setB, setA);
        return this.union(diffAB, diffBA);
    },

    // 5. Complement relative to Universal Set: U \ A
    complement(setA, universe = this.universalSet) {
        return this.difference(universe, setA);
    },

    // 6. Cardinality: |S|
    cardinality(set) {
        return set.size;
    },

    // 7. Subset Check: A ⊆ B  (∀x (x ∈ A → x ∈ B))
    isSubset(setA, setB) {
        for (const elem of setA) {
            if (!setB.has(elem)) return false;
        }
        return true;
    },

    // 8. Strict/Proper Subset: A ⊂ B (A ⊆ B ∧ A ≠ B)
    isProperSubset(setA, setB) {
        return this.isSubset(setA, setB) && setA.size < setB.size;
    },

    // 9. Disjoint Check: A ∩ B = ∅
    areDisjoint(setA, setB) {
        return this.intersection(setA, setB).size === 0;
    },

    // 10. Cartesian Product: A × B = { (a, b) | a ∈ A ∧ b ∈ B }
    cartesianProduct(setA, setB, limit = 20) {
        const pairs = [];
        for (const a of setA) {
            for (const b of setB) {
                pairs.push([a, b]);
                if (pairs.length >= limit) break;
            }
            if (pairs.length >= limit) break;
        }
        return {
            pairs,
            totalCount: setA.size * setB.size
        };
    },

    // Convert JavaScript Set to mathematical string notation: { 'a', 'b', ... }
    formatSet(set) {
        if (!set || set.size === 0) return '∅ (Empty Set)';
        return `{ ${Array.from(set).join(', ')} }`;
    },

    // Extract live active categories from current expenses
    getActiveExpenseCategories(expenses) {
        const liveSet = new Set();
        expenses.forEach(e => liveSet.add(e.category));
        return liveSet;
    },

    // Execute complete analysis on two sets and return full report for UI & Viva
    evaluateAllOperations(setA, setB, labelA = 'Set A', labelB = 'Set B') {
        const unionSet = this.union(setA, setB);
        const intersectSet = this.intersection(setA, setB);
        const diffAB = this.difference(setA, setB);
        const diffBA = this.difference(setB, setA);
        const symDiff = this.symmetricDifference(setA, setB);
        const compA = this.complement(setA);
        const compB = this.complement(setB);

        const cardA = this.cardinality(setA);
        const cardB = this.cardinality(setB);
        const cardUnion = this.cardinality(unionSet);
        const cardIntersect = this.cardinality(intersectSet);

        // Principle of Inclusion-Exclusion verification: |A ∪ B| = |A| + |B| - |A ∩ B|
        const pieVerified = cardUnion === (cardA + cardB - cardIntersect);

        return {
            labelA,
            labelB,
            cardinalityA: cardA,
            cardinalityB: cardB,
            union: {
                notation: 'A ∪ B',
                name: 'Union',
                set: unionSet,
                formatted: this.formatSet(unionSet),
                cardinality: cardUnion,
                description: 'Elements belonging to either Set A, Set B, or both.'
            },
            intersection: {
                notation: 'A ∩ B',
                name: 'Intersection',
                set: intersectSet,
                formatted: this.formatSet(intersectSet),
                cardinality: cardIntersect,
                description: 'Elements common to both Set A and Set B.'
            },
            differenceAB: {
                notation: 'A − B (or A \\ B)',
                name: 'Relative Complement of B in A',
                set: diffAB,
                formatted: this.formatSet(diffAB),
                cardinality: this.cardinality(diffAB),
                description: 'Elements present in A but NOT in B.'
            },
            differenceBA: {
                notation: 'B − A (or B \\ A)',
                name: 'Relative Complement of A in B',
                set: diffBA,
                formatted: this.formatSet(diffBA),
                cardinality: this.cardinality(diffBA),
                description: 'Elements present in B but NOT in A.'
            },
            symmetricDifference: {
                notation: 'A Δ B',
                name: 'Symmetric Difference',
                set: symDiff,
                formatted: this.formatSet(symDiff),
                cardinality: this.cardinality(symDiff),
                description: 'Elements in A or B, but NOT in both: (A \\ B) ∪ (B \\ A).'
            },
            complementA: {
                notation: 'A′ (or U \\ A)',
                name: 'Absolute Complement of A',
                set: compA,
                formatted: this.formatSet(compA),
                cardinality: this.cardinality(compA),
                description: 'Elements in Universal Set U not in A.'
            },
            relationships: {
                isASubsetB: this.isSubset(setA, setB),
                isBSubsetA: this.isSubset(setB, setA),
                isAProperSubsetB: this.isProperSubset(setA, setB),
                areDisjoint: this.areDisjoint(setA, setB),
                pieVerified,
                pieFormula: `|A ∪ B| (${cardUnion}) = |A| (${cardA}) + |B| (${cardB}) − |A ∩ B| (${cardIntersect})`
            }
        };
    }
};

window.SetTheoryModule = SetTheoryModule;

