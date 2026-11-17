# CollegeSpend – Smart College Daily Expense Tracker
### B.Tech 3rd Semester Discrete Mathematics Mini-Project

[![Project Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/)
[![Course](https://img.shields.io/badge/Course-B.Tech%203rd%20Sem%20(CSE%2FIT)-purple.svg)]()
[![Subject](https://img.shields.io/badge/Subject-Discrete%20Mathematics-success.svg)]()
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Chart.js-orange.svg)]()

---

## 📌 Project Overview
**CollegeSpend** is a modern, student-centric daily financial management web application specifically engineered for a **B.Tech 3rd Semester Discrete Mathematics** college project.

While most expense trackers only calculate totals and render charts, **CollegeSpend genuinely implements core Discrete Mathematics concepts in functional, executable JavaScript code** directly linked to student financial transactions:
1. **Set Theory** ($\cup, \cap, \setminus, \Delta$, Cartesian Product, Cardinality, Principle of Inclusion-Exclusion).
2. **Relations & Equivalence** (Ordered pairs, Relation Matrix $M_R$, Reflexivity, Symmetry, Transitivity, Partitions).
3. **Functions & Mappings** (Single-valued left-total mappings, Injective/Pigeonhole Principle, Surjective, Bijective, Composite functions $(g \circ f)(x)$).
4. **Propositional Logic & Truth Tables** (Live financial atomic propositions, Truth Table Generator for $2^n$ rows, Tautology/Contradiction classification, De Morgan's laws).
5. **Graph Theory** (Undirected Weighted Graph $G=(V, E)$, HTML5 Canvas visualizer, Adjacency Matrix, Adjacency List, Vertex Degrees $\deg(v)$, Handshaking Lemma $\sum \deg(v) = 2|E|$).

---

## 🚀 Key Features

### 1. Financial Management
* **Interactive Dashboard:** Real-time metrics for Total Expenses, Today's Spend, Current Month Outlay, and Remaining Monthly Budget.
* **Monthly Budgeting & Burn Rate:** Dynamic budget progress bar with warning tiers (Safe `<65%`, Moderate `65-85%`, Warning `85-100%`, Exceeded `>100%`) and calculated **Safe Daily Allowance** ($(\text{Remaining Budget}) / (\text{Days Left})$).
* **Full Transaction Ledger:** Add, edit, delete, search, sort (date, amount, title), and filter by category, payment mode, and date range.
* **Reports & Analytics:** Daily, weekly, monthly aggregations, highest spending category badge, category proportion table, and Chart.js visualizations (Spending Trend Bar Chart, Category Doughnut Chart, Payment Mode Polar Chart).
* **Export & Backup:** One-click CSV export and JSON backup/restore.

### 2. Discrete Mathematics Laboratory (Viva-Ready)
* **Set Operations Section:** Dynamic Venn diagram visualizer displaying $A \cup B$, $A \cap B$, $A \setminus B$, $B \setminus A$, and $A \Delta B$. Includes preset comparisons (e.g., Weekday vs Weekend, Hostel vs Day Scholar) and verifies $|A \cup B| = |A| + |B| - |A \cap B|$.
* **Relations Matrix ($7 \times 7$):** Formally tests Reflexive, Symmetric, and Transitive properties on Category Same-Day Co-occurrence and Spending Tier Equivalence classes.
* **Function Properties:** Analyzes injectivity with Pigeonhole Principle counter-examples, surjectivity, and bijectivity. Includes a live Composite Function calculator $(h \circ g \circ f)(x)$.
* **Propositional Truth Evaluator:** Evaluates live financial conditions ($P, Q, R, S$) to `TRUE` or `FALSE`. Generates complete 2-variable and 3-variable truth tables and classifies expressions into Tautology, Contradiction, or Contingency.
* **Interactive Graph Canvas:** Renders categories as vertices and same-day spending occurrences as edges. Verifies the Handshaking Lemma with live values.

### 3. UI/UX & Aesthetics
* Modern financial SaaS dark/light mode interface.
* Responsive sidebar layout with smooth transitions.
* Custom modal confirmation dialogs and non-blocking toast notifications.
* Zero external paid APIs or backend server requirements.

---

## 📂 Directory Structure

```
college-spend/
├── index.html                  # Single-Page Application container
├── css/
│   ├── style.css               # Themes (Light/Dark), layouts, sidebar, header
│   └── components.css          # Cards, modals, tables, badges, toasts, math widgets
├── js/
│   ├── app.js                  # Main coordinator, routing, modal & event handlers
│   ├── storage.js              # LocalStorage wrapper, default demo dataset, JSON backup
│   ├── expense.js              # Expense CRUD, validation, search, filter, CSV export
│   ├── budget.js               # Budget calculations, warning states, daily safe allowance
│   ├── analytics.js           # Statistics aggregator & Chart.js chart manager
│   └── discrete-math/
│       ├── set-theory.js       # Sets: Union, Intersection, Difference, Cardinality, PIE
│       ├── relations.js        # Relations: Ordered pairs, 7x7 Matrix, Equivalence tests
│       ├── functions.js        # Functions: Injective, Surjective, Bijective, Composition
│       ├── logic.js            # Propositional Logic: Truth table generator & Tautologies
│       └── graph-theory.js     # Graph: Canvas renderer, Matrix, Degrees, Handshaking Lemma
├── README.md                   # Quickstart guide and viva preparation notes
└── DOCUMENTATION.md            # Comprehensive B.Tech Academic Project Report
```

---

## 💻 How to Run the Application Locally

The project is built entirely with client-side **HTML5, CSS3, and JavaScript**, persisting data through browser **LocalStorage**. No database installation or backend setup is required.

### Method 1: Direct Browser Launch (Simplest)
1. Navigate to the project folder: `c:\Users\riyag\expense tracker`.
2. Double-click **`index.html`** or right-click $\to$ **Open with Google Chrome / Microsoft Edge / Firefox**.
3. The application will immediately load with pre-populated sample college expense data.

### Method 2: Using VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The dashboard will launch at `http://127.0.0.1:5500/index.html`.

### Method 3: Using Python Built-in HTTP Server
Open PowerShell in the project directory and run:
```powershell
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Method 4: Using Node.js `npx serve`
```powershell
npx serve .
```

---

## 🎓 Viva Voce Demonstration Guide

When presenting this project to external examiners, follow this sequence:

| Step | Section to Open | What to Show & Explain to Examiner |
| :--- | :--- | :--- |
| **1** | **Dashboard** | Show the 4 metric cards, real-time budget progress bar, daily safe allowance calculation, and the recent transactions ledger. Highlight dark/light theme switching. |
| **2** | **Transactions** | Add a new expense (e.g. "Library Photostat", ₹40, Stationery). Show instant validation (preventing negative/zero values), dynamic update of totals, and CSV export. |
| **3** | **Set Theory** | Navigate to **Discrete Math Lab $\to$ 1. Set Theory**. Show Set $A$ and Set $B$ chips. Point out the dynamic Venn diagram and demonstrate that the Principle of Inclusion-Exclusion formula $|A \cup B| = |A| + |B| - |A \cap B|$ evaluates to True. |
| **4** | **Relations** | Switch to **2. Relations**. Explain the $7 \times 7$ binary matrix $M_R$. Explain why Reflexivity ($M[i][i] = 1$), Symmetry ($M = M^T$), and Transitivity are verified. Show how Spending Tiers partition transactions into disjoint equivalence classes. |
| **5** | **Functions** | Switch to **3. Functions**. Explain why category assignment $f: E \to C$ is **not injective** by citing the **Pigeonhole Principle** (multiple expenses sharing the same category). Demonstrate the composite function $(h \circ g \circ f)(x)$ evaluator. |
| **6** | **Propositional Logic** | Switch to **4. Propositional Logic**. Show the live truth evaluation of propositions $P, Q, R, S$. Change the truth table dropdown from 2 to 3 variables. Select "Verify De Morgan's Law" to show it evaluates to a **Tautology**. |
| **7** | **Graph Theory** | Switch to **5. Graph Theory**. Show the HTML5 Canvas co-spending graph with category nodes and weighted edges. Point out the vertex degree table and explain the **Handshaking Lemma**: $\sum \deg(v) = 2|E|$ holds true dynamically. |

---

## 👨‍💻 Student Profile & Academic Details
* **Student Name:** Editable via Profile Settings (stored in LocalStorage)
* **Degree / Course:** B.Tech Computer Science and Engineering
* **Semester:** 3rd Semester
* **University:** Manav Rachna University
* **Project Title:** CollegeSpend – Smart College Daily Expense Tracker
* **Subject:** Discrete Mathematics / Discrete Mathematical Structures
* **Academic Session:** 2026-2027

---
*For the complete academic submission report including ER diagrams, Data Flow Diagrams, System Architecture, and Algorithms, please refer to [DOCUMENTATION.md](file:///c:/Users/riyag/expense%20tracker/DOCUMENTATION.md).*

