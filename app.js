/**
 * CollegeSpend - Main Application Coordinator
 * Connects UI views, event listeners, CRUD operations, Analytics,
 * and the Discrete Mathematics Laboratory.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    const App = {
        currentView: 'dashboard-view',
        currentMathSubView: 'set-theory',
        currentAnalyticsTimeframe: 'all',
        deletingExpenseId: null,
        filters: {
            search: '',
            category: 'all',
            paymentMethod: 'all',
            startDate: '',
            endDate: '',
            sortBy: 'date_desc'
        },

        // Date utility helper (returns YYYY-MM-DD in local calendar time)
        getTodayDateString(d = new Date()) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        init() {
            this.applySavedTheme();
            this.bindNavigation();
            this.bindHeaderActions();
            this.bindExpenseModal();
            this.bindDeleteModal();
            this.bindTransactionFilters();
            this.bindBudgetForm();
            this.bindAnalyticsActions();
            this.bindMathLab();
            this.bindSettingsForm();
            this.bindGlobalEvents();
            this.startDateWatcher();

            // Initial render
            this.refreshAll();

            // Set today's date as default in expense form
            const todayStr = this.getTodayDateString();
            const dateInput = document.getElementById('expInputDate');
            if (dateInput) dateInput.value = todayStr;
        },

        // Watch for calendar date changes automatically across midnight and tab focus
        startDateWatcher() {
            let lastDate = this.getTodayDateString();

            // Periodic check every 30 seconds
            setInterval(() => {
                const currentDate = this.getTodayDateString();
                if (currentDate !== lastDate) {
                    lastDate = currentDate;
                    this.refreshAll();
                }
            }, 30000);

            // Check on tab focus
            window.addEventListener('focus', () => {
                const currentDate = this.getTodayDateString();
                if (currentDate !== lastDate) {
                    lastDate = currentDate;
                    this.refreshAll();
                }
            });

            // Check on visibility change
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    const currentDate = this.getTodayDateString();
                    if (currentDate !== lastDate) {
                        lastDate = currentDate;
                        this.refreshAll();
                    }
                }
            });
        },

        // Theme management
        applySavedTheme() {
            const settings = StorageManager.getSettings();
            const theme = settings.theme || 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        },

        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            StorageManager.setSettings({ theme: newTheme });
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';

            // Refresh charts for theme color adaptation
            this.renderAnalyticsView();
            if (this.currentView === 'math-lab-view' && this.currentMathSubView === 'graph-theory') {
                this.renderGraphTheorySubView();
            }
        },

        // Toast notification system
        showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : '❌');
            toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3200);
        },

        // Navigation
        bindNavigation() {
            const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const target = item.getAttribute('data-target');
                    if (target) {
                        this.switchView(target);
                        // Close mobile sidebar if open
                        const sidebar = document.getElementById('sidebar');
                        if (sidebar) sidebar.classList.remove('open');
                    }
                });
            });

            // Mobile menu toggle
            const mobileBtn = document.getElementById('mobileMenuToggle');
            const sidebar = document.getElementById('sidebar');
            if (mobileBtn && sidebar) {
                mobileBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });
            }

            // Quick button from dashboard to transactions
            const dashViewAllBtn = document.getElementById('dashViewAllTransactionsBtn');
            if (dashViewAllBtn) {
                dashViewAllBtn.addEventListener('click', () => {
                    this.switchView('transactions-view');
                });
            }

            // Quick click on sidebar profile badge navigates to profile settings
            const profileCard = document.getElementById('sidebarProfileCard');
            if (profileCard) {
                profileCard.addEventListener('click', () => {
                    this.switchView('settings-view');
                    setTimeout(() => {
                        const nameInput = document.getElementById('settingsStudentName');
                        if (nameInput) nameInput.focus();
                    }, 100);
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) sidebar.classList.remove('open');
                });
            }
        },

        switchView(viewId) {
            this.currentView = viewId;

            // Update sidebar nav active state
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
                if (item.getAttribute('data-target') === viewId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Update visible view section
            document.querySelectorAll('.view-section').forEach(sec => {
                sec.classList.remove('active');
            });
            const activeSec = document.getElementById(viewId);
            if (activeSec) activeSec.classList.add('active');

            // Header titles update
            const titleMap = {
                'dashboard-view': { title: 'Dashboard Overview', sub: 'Track daily spending habits, budget limits & mathematical models' },
                'transactions-view': { title: 'Expense Transactions Ledger', sub: 'Search, filter, edit and export all recorded college expenditures' },
                'budget-view': { title: 'Monthly Budget & Allowance Planner', sub: 'Maintain fiscal discipline, allocate category limits & monitor burn rate' },
                'analytics-view': { title: 'Expense Analytics & Reports', sub: 'Visual breakdown charts, time aggregations, and category proportions' },
                'math-lab-view': { title: 'Discrete Mathematics Laboratory', sub: 'Interactive demonstration of Set Theory, Relations, Functions, Logic & Graph Theory' },
                'settings-view': { title: 'Settings & Academic Profile', sub: 'Manage demo datasets, backup JSON records, and student identification' }
            };

            const info = titleMap[viewId] || { title: 'CollegeSpend', sub: '' };
            const pageTitle = document.getElementById('headerPageTitle');
            const pageSub = document.getElementById('headerPageSubtitle');
            if (pageTitle) pageTitle.textContent = info.title;
            if (pageSub) pageSub.textContent = info.sub;

            // Trigger specific renders
            if (viewId === 'dashboard-view') this.renderDashboard();
            if (viewId === 'transactions-view') this.renderTransactionsTable();
            if (viewId === 'budget-view') this.renderBudgetView();
            if (viewId === 'analytics-view') this.renderAnalyticsView();
            if (viewId === 'math-lab-view') this.renderMathLab();
            if (viewId === 'settings-view') this.renderSettingsView();
        },

        bindHeaderActions() {
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => this.toggleTheme());
            }

            const addExpBtn = document.getElementById('headerAddExpenseBtn');
            if (addExpBtn) {
                addExpBtn.addEventListener('click', () => this.openExpenseModal());
            }

            const dashQuickAdd = document.getElementById('dashQuickAddBtn');
            if (dashQuickAdd) {
                dashQuickAdd.addEventListener('click', () => this.openExpenseModal());
            }

            const transAddNew = document.getElementById('transAddNewExpenseBtn');
            if (transAddNew) {
                transAddNew.addEventListener('click', () => this.openExpenseModal());
            }
        },

        bindGlobalEvents() {
            window.addEventListener('expensesUpdated', () => {
                this.refreshAll();
            });
            window.addEventListener('settingsUpdated', () => {
                this.refreshAll();
            });
            window.addEventListener('storage', (e) => {
                if (!e.key || e.key === STORAGE_KEYS.EXPENSES || e.key === STORAGE_KEYS.SETTINGS) {
                    this.refreshAll();
                }
            });
        },

        refreshAll() {
            this.renderProfileDetails();
            this.renderDashboard(); // Always keep dashboard metrics & budget progress bar updated
            if (this.currentView === 'transactions-view') this.renderTransactionsTable();
            if (this.currentView === 'budget-view') this.renderBudgetView();
            if (this.currentView === 'analytics-view') this.renderAnalyticsView();
            if (this.currentView === 'math-lab-view') this.renderMathLab();
        },

        renderProfileDetails() {
            const settings = StorageManager.getSettings();
            const sidebarStudent = document.getElementById('sidebarStudentName');
            const sidebarRoll = document.getElementById('sidebarRollNumber');
            const sidebarAcademic = document.getElementById('sidebarAcademicInfo');
            const sidebarUniv = document.getElementById('sidebarUniversity');
            const sidebarProject = document.getElementById('sidebarProjectTitle');

            if (sidebarStudent) {
                const name = (settings.studentName || '').trim();
                sidebarStudent.textContent = name || 'Student Profile';
            }
            if (sidebarRoll) {
                const roll = (settings.rollNumber || '').trim();
                sidebarRoll.textContent = roll ? `Roll: ${roll}` : '';
                sidebarRoll.style.display = roll ? 'block' : 'none';
            }
            if (sidebarAcademic) {
                const courseShort = settings.course || 'B.Tech CSE';
                const sem = settings.semester || '3rd Semester';
                sidebarAcademic.textContent = `${courseShort} • ${sem}`;
            }
            if (sidebarUniv) {
                sidebarUniv.textContent = settings.universityName || 'Manav Rachna University';
            }
            if (sidebarProject) {
                sidebarProject.textContent = settings.projectTitle || 'Discrete Math Project';
            }
        },

        // =========================================================================
        // DASHBOARD VIEW
        // =========================================================================
        renderDashboard() {
            const expenses = StorageManager.getExpenses();
            const settings = StorageManager.getSettings();
            const budgetStatus = BudgetManager.calculateStatus(expenses);
            const aggregates = FunctionsModule.calculateAggregates(expenses, budgetStatus.monthlyBudget);

            // 1. Metric Cards
            const totalSpentEl = document.getElementById('dashTotalSpent');
            if (totalSpentEl) totalSpentEl.textContent = `${settings.currency}${aggregates.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const totalCountEl = document.getElementById('dashTotalCount');
            if (totalCountEl) totalCountEl.textContent = `${aggregates.count} total transaction${aggregates.count === 1 ? '' : 's'}`;

            const todaySpentEl = document.getElementById('dashTodaySpent');
            if (todaySpentEl) todaySpentEl.textContent = `${settings.currency}${aggregates.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const todayCountEl = document.getElementById('dashTodayCount');
            if (todayCountEl) {
                todayCountEl.textContent = `${aggregates.todayCount} expense${aggregates.todayCount === 1 ? '' : 's'} today`;
            }

            const monthSpentEl = document.getElementById('dashMonthSpent');
            if (monthSpentEl) monthSpentEl.textContent = `${settings.currency}${aggregates.currentMonthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const monthDaysEl = document.getElementById('dashMonthDays');
            if (monthDaysEl) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const currentMonthName = monthNames[new Date().getMonth()];
                monthDaysEl.textContent = `${aggregates.currentMonthCount} expense${aggregates.currentMonthCount === 1 ? '' : 's'} in ${currentMonthName}`;
            }

            const remainingEl = document.getElementById('dashRemainingBudget');
            if (remainingEl) remainingEl.textContent = `${settings.currency}${aggregates.remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            // Budget Icon Box & Status Subtitle
            const budgetIconBox = document.getElementById('dashBudgetIconBox');
            const budgetStatusBadge = document.getElementById('dashBudgetStatusBadge');
            if (aggregates.isOverBudget) {
                if (budgetIconBox) budgetIconBox.className = 'metric-icon-box icon-red';
                if (budgetStatusBadge) {
                    budgetStatusBadge.textContent = 'Budget Exceeded!';
                    budgetStatusBadge.style.color = 'var(--danger)';
                }
            } else {
                if (budgetIconBox) budgetIconBox.className = 'metric-icon-box icon-green';
                if (budgetStatusBadge) {
                    budgetStatusBadge.textContent = `${aggregates.budgetUsagePercentage}% of monthly limit`;
                    budgetStatusBadge.style.color = 'var(--success)';
                }
            }

            // 2. Budget Health Card
            const alertText = document.getElementById('budgetAlertText');
            if (alertText) alertText.textContent = budgetStatus.message;

            const percentageBadge = document.getElementById('budgetPercentageBadge');
            if (percentageBadge) {
                percentageBadge.textContent = `${budgetStatus.usagePercentage}% Used`;
                percentageBadge.className = `badge ${budgetStatus.alertClass}`;
            }

            const budgetBar = document.getElementById('dashboardBudgetBar');
            if (budgetBar) {
                const usagePct = Number(budgetStatus.usagePercentage) || 0;
                const barWidth = Math.max(0, Math.min(usagePct, 100));
                budgetBar.style.width = `${barWidth}%`;
                budgetBar.className = `budget-bar-fill ${budgetStatus.status}`;
                budgetBar.setAttribute('role', 'progressbar');
                budgetBar.setAttribute('aria-valuenow', usagePct.toFixed(1));
                budgetBar.setAttribute('aria-valuemin', '0');
                budgetBar.setAttribute('aria-valuemax', '100');
            }

            const budgetLimitEl = document.getElementById('dashMonthlyBudgetLimit');
            if (budgetLimitEl) budgetLimitEl.textContent = `Target Budget: ${settings.currency}${budgetStatus.monthlyBudget.toLocaleString('en-IN')}`;

            const dailySafeEl = document.getElementById('dashDailySafeAllowance');
            if (dailySafeEl) dailySafeEl.textContent = `Safe Allowance: ${settings.currency}${budgetStatus.dailySafeAllowance}/day (${budgetStatus.daysRemaining} days left)`;

            // 3. Recent Transactions Table (Top 5)
            const recentTbody = document.getElementById('dashboardRecentTbody');
            if (recentTbody) {
                const recent = expenses.slice(0, 5);
                if (recent.length === 0) {
                    recentTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No transactions found. Click "+ Add Expense" to begin.</td></tr>`;
                } else {
                    recentTbody.innerHTML = recent.map(e => this.renderTableRow(e)).join('');
                    this.attachRowActionListeners(recentTbody);
                }
            }

            // 4. Dashboard Charts
            const analyticsData = AnalyticsModule.computeAnalytics(expenses, 'all');
            AnalyticsModule.renderCharts(analyticsData);

            const highestCatBadge = document.getElementById('dashHighestCatBadge');
            if (highestCatBadge) {
                highestCatBadge.textContent = analyticsData.highestCategory 
                    ? `Top: ${analyticsData.highestCategory.icon} ${analyticsData.highestCategory.id} (₹${analyticsData.highestCategory.total.toLocaleString('en-IN')})`
                    : 'Top: None';
            }
        },

        // Helper: render single table row
        renderTableRow(expense) {
            const catObj = CATEGORIES.find(c => c.id === expense.category) || { icon: '📦', color: '#6b7280' };
            const settings = StorageManager.getSettings();

            return `
                <tr data-id="${expense.id}">
                    <td style="white-space: nowrap; color: var(--text-secondary); font-size: 0.8rem;">
                        ${expense.date}
                    </td>
                    <td>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.escapeHTML(expense.title)}</div>
                        ${expense.description ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHTML(expense.description)}</div>` : ''}
                    </td>
                    <td>
                        <span class="badge badge-category" style="border-left: 3px solid ${catObj.color};">
                            <span>${catObj.icon}</span> <span>${expense.category}</span>
                        </span>
                    </td>
                    <td>
                        <span style="font-size: 0.76rem; color: var(--text-secondary);">${expense.paymentMethod}</span>
                    </td>
                    <td>
                        <span class="table-amount" style="color: var(--text-primary);">${settings.currency}${Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-secondary btn-sm action-edit-btn" data-id="${expense.id}" title="Edit Expense">✏️</button>
                            <button class="btn btn-secondary btn-sm action-delete-btn" data-id="${expense.id}" title="Delete Expense" style="color: var(--danger);">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        },

        attachRowActionListeners(container) {
            container.querySelectorAll('.action-edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.openExpenseModal(id);
                });
            });

            container.querySelectorAll('.action-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.confirmDelete(id);
                });
            });
        },

        escapeHTML(str) {
            if (!str) return '';
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag));
        },

        // =========================================================================
        // EXPENSE TRANSACTIONS VIEW
        // =========================================================================
        bindTransactionFilters() {
            const searchInput = document.getElementById('transSearchInput');
            const catFilter = document.getElementById('transCategoryFilter');
            const payFilter = document.getElementById('transPaymentFilter');
            const sortSelect = document.getElementById('transSortSelect');
            const startDate = document.getElementById('transStartDate');
            const endDate = document.getElementById('transEndDate');
            const resetBtn = document.getElementById('transResetFiltersBtn');
            const exportCsvBtn = document.getElementById('transExportCsvBtn');

            const handleFilterChange = () => {
                this.filters.search = searchInput.value;
                this.filters.category = catFilter.value;
                this.filters.paymentMethod = payFilter.value;
                this.filters.sortBy = sortSelect.value;
                this.filters.startDate = startDate.value;
                this.filters.endDate = endDate.value;
                this.renderTransactionsTable();
            };

            if (searchInput) searchInput.addEventListener('input', handleFilterChange);
            if (catFilter) catFilter.addEventListener('change', handleFilterChange);
            if (payFilter) payFilter.addEventListener('change', handleFilterChange);
            if (sortSelect) sortSelect.addEventListener('change', handleFilterChange);
            if (startDate) startDate.addEventListener('change', handleFilterChange);
            if (endDate) endDate.addEventListener('change', handleFilterChange);

            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    catFilter.value = 'all';
                    payFilter.value = 'all';
                    sortSelect.value = 'date_desc';
                    startDate.value = '';
                    endDate.value = '';
                    this.filters = { search: '', category: 'all', paymentMethod: 'all', startDate: '', endDate: '', sortBy: 'date_desc' };
                    this.renderTransactionsTable();
                });
            }

            if (exportCsvBtn) {
                exportCsvBtn.addEventListener('click', () => {
                    const expenses = StorageManager.getExpenses();
                    const filtered = ExpenseManager.filterAndSort(expenses, this.filters);
                    ExpenseManager.exportToCSV(filtered);
                    this.showToast(`Exported ${filtered.length} transactions to CSV.`);
                });
            }
        },

        renderTransactionsTable() {
            const allExpenses = StorageManager.getExpenses();
            const filtered = ExpenseManager.filterAndSort(allExpenses, this.filters);
            const settings = StorageManager.getSettings();

            const tbody = document.getElementById('fullTransactionsTbody');
            const countLabel = document.getElementById('transCountFilteredLabel');
            const sumBadge = document.getElementById('transFilteredSumBadge');

            const filteredSum = filtered.reduce((s, e) => s + Number(e.amount), 0);
            if (countLabel) countLabel.textContent = `Showing ${filtered.length} of ${allExpenses.length} transactions`;
            if (sumBadge) sumBadge.textContent = `Filtered Total: ${settings.currency}${filteredSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            if (tbody) {
                if (filtered.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No transactions match the selected filters.</td></tr>`;
                } else {
                    tbody.innerHTML = filtered.map(e => this.renderTableRow(e)).join('');
                    this.attachRowActionListeners(tbody);
                }
            }
        },

        // =========================================================================
        // EXPENSE MODAL (ADD / EDIT)
        // =========================================================================
        bindExpenseModal() {
            const modal = document.getElementById('expenseModal');
            const closeBtn = document.getElementById('expenseModalCloseBtn');
            const cancelBtn = document.getElementById('expenseModalCancelBtn');
            const form = document.getElementById('expenseForm');

            const closeModal = () => {
                if (modal) modal.classList.remove('active');
            };

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleExpenseFormSubmit();
                });
            }
        },

        openExpenseModal(editId = null) {
            const modal = document.getElementById('expenseModal');
            const titleEl = document.getElementById('expenseModalTitle');
            const form = document.getElementById('expenseForm');
            const idInput = document.getElementById('expenseFormId');
            const titleInput = document.getElementById('expInputTitle');
            const amountInput = document.getElementById('expInputAmount');
            const dateInput = document.getElementById('expInputDate');
            const catInput = document.getElementById('expInputCategory');
            const payInput = document.getElementById('expInputPayment');
            const descInput = document.getElementById('expInputDescription');

            if (!modal) return;

            form.reset();

            if (editId) {
                const exp = ExpenseManager.getById(editId);
                if (exp) {
                    titleEl.textContent = 'Edit Expense Record';
                    idInput.value = exp.id;
                    titleInput.value = exp.title;
                    amountInput.value = exp.amount;
                    dateInput.value = exp.date;
                    catInput.value = exp.category;
                    payInput.value = exp.paymentMethod;
                    descInput.value = exp.description || '';
                }
            } else {
                titleEl.textContent = 'Add New Student Expense';
                idInput.value = '';
                dateInput.value = this.getTodayDateString();
                payInput.value = 'UPI / GPay / PhonePe';
            }

            modal.classList.add('active');
        },

        handleExpenseFormSubmit() {
            const id = document.getElementById('expenseFormId').value;
            const title = document.getElementById('expInputTitle').value;
            const amount = document.getElementById('expInputAmount').value;
            const date = document.getElementById('expInputDate').value;
            const category = document.getElementById('expInputCategory').value;
            const paymentMethod = document.getElementById('expInputPayment').value;
            const description = document.getElementById('expInputDescription').value;

            const payload = { title, amount, date, category, paymentMethod, description };

            if (id) {
                // Update
                const res = ExpenseManager.update(id, payload);
                if (res.success) {
                    this.showToast('Expense successfully updated!', 'success');
                    document.getElementById('expenseModal').classList.remove('active');
                } else {
                    this.showToast(res.errors.join(' '), 'error');
                }
            } else {
                // Create
                const res = ExpenseManager.create(payload);
                if (res.success) {
                    this.showToast('New expense added successfully!', 'success');
                    document.getElementById('expenseModal').classList.remove('active');
                } else {
                    this.showToast(res.errors.join(' '), 'error');
                }
            }
        },

        // =========================================================================
        // DELETE CONFIRMATION MODAL
        // =========================================================================
        bindDeleteModal() {
            const modal = document.getElementById('deleteConfirmModal');
            const closeBtn = document.getElementById('deleteModalCloseBtn');
            const cancelBtn = document.getElementById('deleteModalCancelBtn');
            const confirmBtn = document.getElementById('deleteModalConfirmBtn');

            const closeModal = () => {
                if (modal) modal.classList.remove('active');
                this.deletingExpenseId = null;
            };

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    if (this.deletingExpenseId) {
                        ExpenseManager.delete(this.deletingExpenseId);
                        this.showToast('Expense record deleted successfully.', 'success');
                        closeModal();
                    }
                });
            }
        },

        confirmDelete(id) {
            const exp = ExpenseManager.getById(id);
            if (!exp) return;

            this.deletingExpenseId = id;
            const msgEl = document.getElementById('deleteConfirmMessage');
            if (msgEl) {
                msgEl.innerHTML = `Are you sure you want to permanently delete <strong>"${this.escapeHTML(exp.title)}"</strong> (₹${exp.amount})?`;
            }

            const modal = document.getElementById('deleteConfirmModal');
            if (modal) modal.classList.add('active');
        },

        // =========================================================================
        // BUDGET PLANNER VIEW
        // =========================================================================
        bindBudgetForm() {
            const form = document.getElementById('budgetSettingForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = document.getElementById('budgetInputAmount');
                    const res = BudgetManager.setMonthlyBudget(input.value);
                    if (res.success) {
                        this.showToast(`Monthly budget updated to ₹${res.monthlyBudget.toLocaleString('en-IN')}`, 'success');
                        this.renderBudgetView();
                    } else {
                        this.showToast(res.error, 'error');
                    }
                });
            }
        },

        renderBudgetView() {
            const expenses = StorageManager.getExpenses();
            const status = BudgetManager.calculateStatus(expenses);
            const settings = StorageManager.getSettings();

            const inputEl = document.getElementById('budgetInputAmount');
            if (inputEl) inputEl.value = status.monthlyBudget;

            const allowanceEl = document.getElementById('budgetDailyAllowanceValue');
            if (allowanceEl) allowanceEl.textContent = `${settings.currency}${status.dailySafeAllowance}`;

            const daysRemainingEl = document.getElementById('budgetDaysRemainingText');
            if (daysRemainingEl) daysRemainingEl.textContent = `${status.daysRemaining} days`;

            // Category progress list
            const container = document.getElementById('budgetCategoryListContainer');
            if (container) {
                container.innerHTML = CATEGORIES.map(cat => {
                    const spent = status.categorySpending[cat.id] || 0;
                    const pctOfBudget = status.monthlyBudget > 0 ? (spent / status.monthlyBudget) * 100 : 0;
                    return `
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 1.2rem;">${cat.icon}</span>
                                    <strong style="font-size: 0.88rem;">${cat.name}</strong>
                                    <span class="badge ${cat.type === 'essential' ? 'badge-info' : 'badge-warning'}" style="font-size: 0.7rem;">${cat.type}</span>
                                </div>
                                <span style="font-size: 0.88rem; font-weight: 700;">
                                    ${settings.currency}${spent.toLocaleString('en-IN')}
                                    <small style="color: var(--text-muted); font-weight: normal;">(${pctOfBudget.toFixed(1)}% of total budget)</small>
                                </span>
                            </div>
                            <div class="budget-bar-track">
                                <div class="budget-bar-fill" style="width: ${Math.min(pctOfBudget, 100)}%; background: ${cat.color};"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        },

        // =========================================================================
        // REPORTS & ANALYTICS VIEW
        // =========================================================================
        bindAnalyticsActions() {
            const buttonsContainer = document.getElementById('analyticsTimeframeButtons');
            if (buttonsContainer) {
                buttonsContainer.querySelectorAll('button').forEach(btn => {
                    btn.addEventListener('click', () => {
                        buttonsContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.currentAnalyticsTimeframe = btn.getAttribute('data-timeframe');
                        this.renderAnalyticsView();
                    });
                });
            }
        },

        renderAnalyticsView() {
            const expenses = StorageManager.getExpenses();
            const settings = StorageManager.getSettings();
            const data = AnalyticsModule.computeAnalytics(expenses, this.currentAnalyticsTimeframe);

            const totalSpentEl = document.getElementById('analyticsTotalSpent');
            if (totalSpentEl) totalSpentEl.textContent = `${settings.currency}${data.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const avgSpentEl = document.getElementById('analyticsAvgSpent');
            if (avgSpentEl) avgSpentEl.textContent = `${settings.currency}${data.averagePerTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

            const highestCatEl = document.getElementById('analyticsHighestCategory');
            const highestCatAmtEl = document.getElementById('analyticsHighestCatAmount');
            if (highestCatEl && highestCatAmtEl) {
                if (data.highestCategory) {
                    highestCatEl.textContent = `${data.highestCategory.icon} ${data.highestCategory.id}`;
                    highestCatAmtEl.textContent = `${settings.currency}${data.highestCategory.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                } else {
                    highestCatEl.textContent = '--';
                    highestCatAmtEl.textContent = `${settings.currency}0.00`;
                }
            }

            const txnCountEl = document.getElementById('analyticsTxnCount');
            if (txnCountEl) txnCountEl.textContent = data.count;

            const summaryBadge = document.getElementById('analyticsSummaryBadge');
            if (summaryBadge) summaryBadge.textContent = `${data.count} Expenses in Selected Timeframe`;

            // Category Table
            const catTbody = document.getElementById('analyticsCategoryTbody');
            if (catTbody) {
                catTbody.innerHTML = data.categoryList.map(c => `
                    <tr>
                        <td>
                            <span style="margin-right: 6px;">${c.icon}</span>
                            <strong>${c.name}</strong>
                        </td>
                        <td>${settings.currency}${c.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; max-width: 80px;">
                                    <div style="width: ${c.percentage}%; height: 100%; background: ${c.color};"></div>
                                </div>
                                <span style="font-weight: 600;">${c.percentage}%</span>
                            </div>
                        </td>
                        <td>${c.count}</td>
                    </tr>
                `).join('');
            }

            AnalyticsModule.renderCharts(data);
        },

        // =========================================================================
        // DISCRETE MATHEMATICS LAB (CORE VIVA COMPONENT)
        // =========================================================================
        bindMathLab() {
            // Sub-nav tab switching
            const tabs = document.querySelectorAll('.math-tabs-nav .math-tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    const targetSub = tab.getAttribute('data-math-sub');
                    this.currentMathSubView = targetSub;

                    document.querySelectorAll('.math-sub-view').forEach(sub => sub.classList.remove('active'));
                    const activeSub = document.getElementById(`math-sub-${targetSub}`);
                    if (activeSub) activeSub.classList.add('active');

                    this.renderMathLabSubView(targetSub);
                });
            });

            // Sync with live data button
            const syncBtn = document.getElementById('mathSyncLiveDataBtn');
            if (syncBtn) {
                syncBtn.addEventListener('click', () => {
                    this.renderMathLab();
                    this.showToast('Discrete Mathematics models synchronized with latest expenses!', 'success');
                });
            }

            // Set Theory Preset handler
            const presetSelect = document.getElementById('setPresetSelect');
            if (presetSelect) {
                presetSelect.addEventListener('change', () => {
                    this.renderSetTheorySubView();
                });
            }

            // Relations model selector
            const relSelect = document.getElementById('relationModelSelect');
            if (relSelect) {
                relSelect.addEventListener('change', () => {
                    this.renderRelationsSubView();
                });
            }

            // Function Composition evaluator
            const compBtn = document.getElementById('funcEvalCompositionBtn');
            if (compBtn) {
                compBtn.addEventListener('click', () => {
                    const input = document.getElementById('funcCompositionInput');
                    const amt = Number(input.value) || 100;
                    const expenses = StorageManager.getExpenses();
                    const budgetStatus = BudgetManager.calculateStatus(expenses);
                    const comp = FunctionsModule.evaluateComposition(amt, budgetStatus.remainingBudget);

                    const resBox = document.getElementById('funcCompositionResultBox');
                    if (resBox) {
                        resBox.innerHTML = `
                            <div><strong>Input Transaction Amount x:</strong> ₹${comp.inputAmount}</div>
                            <div><strong>Calculated 5% Surcharge g(x):</strong> ₹${comp.tax}</div>
                            <div><strong>Total Outlay (g ∘ f)(x) = f(x) + g(x):</strong> ₹${comp.totalWithTax}</div>
                            <div><strong>Resulting Budget Residue (h ∘ g ∘ f)(x):</strong> ₹${comp.budgetResidue}</div>
                            <div style="margin-top: 6px; color: var(--brand-primary); font-size: 0.8rem;">${comp.notation}</div>
                        `;
                    }
                });
            }

            // Truth Table generator variables selector
            const truthVarsSelect = document.getElementById('truthTableVarsSelect');
            if (truthVarsSelect) {
                truthVarsSelect.addEventListener('change', () => {
                    this.renderLogicTruthTable();
                });
            }

            const tautologySelect = document.getElementById('logicTautologySelect');
            if (tautologySelect) {
                tautologySelect.addEventListener('change', () => {
                    this.renderLogicTruthTable();
                });
            }

            // Canvas Redraw Button
            const redrawBtn = document.getElementById('redrawGraphBtn');
            if (redrawBtn) {
                redrawBtn.addEventListener('click', () => {
                    this.renderGraphTheorySubView();
                });
            }
        },

        renderMathLab() {
            this.renderMathLabSubView(this.currentMathSubView);
        },

        renderMathLabSubView(sub) {
            switch (sub) {
                case 'set-theory':
                    this.renderSetTheorySubView();
                    break;
                case 'relations':
                    this.renderRelationsSubView();
                    break;
                case 'functions':
                    this.renderFunctionsSubView();
                    break;
                case 'logic':
                    this.renderLogicSubView();
                    break;
                case 'graph-theory':
                    this.renderGraphTheorySubView();
                    break;
            }
        },

        // ---------------------------------------------------------------------
        // 1. SET THEORY SUB-VIEW
        // ---------------------------------------------------------------------
        renderSetTheorySubView() {
            const presetKey = document.getElementById('setPresetSelect')?.value || 'weekdaysVsWeekends';
            let setA, setB, labelA, labelB;

            if (presetKey === 'liveVsAll') {
                const expenses = StorageManager.getExpenses();
                setA = SetTheoryModule.getActiveExpenseCategories(expenses);
                setB = SetTheoryModule.universalSet;
                labelA = 'Active User Categories (A)';
                labelB = 'Universal Set of Categories (B)';
            } else {
                const preset = SetTheoryModule.presets[presetKey] || SetTheoryModule.presets.weekdaysVsWeekends;
                setA = preset.setA;
                setB = preset.setB;
                labelA = preset.labelA;
                labelB = preset.labelB;
            }

            const report = SetTheoryModule.evaluateAllOperations(setA, setB, labelA, labelB);

            // Set Labels & Cardinality
            document.getElementById('setALabel').textContent = labelA;
            document.getElementById('setACardinality').textContent = `|A| = ${report.cardinalityA}`;
            document.getElementById('setAChips').innerHTML = Array.from(setA).map(elem => `<span class="set-chip">${elem}</span>`).join('');

            document.getElementById('setBLabel').textContent = labelB;
            document.getElementById('setBCardinality').textContent = `|B| = ${report.cardinalityB}`;
            document.getElementById('setBChips').innerHTML = Array.from(setB).map(elem => `<span class="set-chip">${elem}</span>`).join('');

            // Dynamic Venn Diagram Content
            const onlyA = Array.from(report.differenceAB.set);
            const onlyB = Array.from(report.differenceBA.set);
            const bothAB = Array.from(report.intersection.set);

            document.getElementById('vennOnlyAContent').innerHTML = onlyA.length ? onlyA.map(e => `<div>• ${e}</div>`).join('') : '<em style="color:var(--text-muted);">None</em>';
            document.getElementById('vennIntersectionContent').innerHTML = bothAB.length ? bothAB.map(e => `<strong style="display:block;">${e}</strong>`).join('') : '<em style="color:var(--text-muted);">∅</em>';
            document.getElementById('vennOnlyBContent').innerHTML = onlyB.length ? onlyB.map(e => `<div>• ${e}</div>`).join('') : '<em style="color:var(--text-muted);">None</em>';

            // Operations Cards
            const opsGrid = document.getElementById('setOperationsGrid');
            if (opsGrid) {
                const ops = [
                    report.union,
                    report.intersection,
                    report.differenceAB,
                    report.differenceBA,
                    report.symmetricDifference,
                    report.complementA
                ];

                opsGrid.innerHTML = ops.map(op => `
                    <div class="set-operation-card">
                        <div class="set-operation-title">
                            <span>${op.name} (${op.notation})</span>
                            <span class="badge badge-info">Cardinality: ${op.cardinality}</span>
                        </div>
                        <div style="font-family: monospace; font-size: 0.9rem; color: var(--text-primary); margin: 6px 0;">
                            ${op.formatted}
                        </div>
                        <div style="font-size: 0.76rem; color: var(--text-secondary);">${op.description}</div>
                    </div>
                `).join('');
            }

            // PIE Box
            const pieBox = document.getElementById('setPieFormulaBox');
            if (pieBox) {
                pieBox.innerHTML = `
                    <div><strong>Principle of Inclusion-Exclusion Verification:</strong></div>
                    <div style="margin-top: 4px;">Formula: |A ∪ B| = |A| + |B| − |A ∩ B|</div>
                    <div style="margin-top: 2px; color: var(--success); font-weight: bold;">
                        ${report.relationships.pieFormula}  ✓ Verified True
                    </div>
                    <div style="margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">
                        Subset check: A ⊆ B: ${report.relationships.isASubsetB ? 'True' : 'False'} | Disjoint (A ∩ B = ∅): ${report.relationships.areDisjoint ? 'True' : 'False'}
                    </div>
                `;
            }
        },

        // ---------------------------------------------------------------------
        // 2. RELATIONS SUB-VIEW
        // ---------------------------------------------------------------------
        renderRelationsSubView() {
            const modelKey = document.getElementById('relationModelSelect')?.value || 'categoryCooccurrence';
            const expenses = StorageManager.getExpenses();
            const container = document.getElementById('relationDetailsContainer');
            if (!container) return;

            if (modelKey === 'categoryCooccurrence') {
                const rel = RelationsModule.buildCategoryCooccurrenceRelation(expenses);
                const cats = rel.set;

                // Render Relation Matrix Table
                let matrixHtml = `<table class="matrix-table" style="width: 100%;"><thead><tr><th>M_R</th>`;
                cats.forEach(c => matrixHtml += `<th>${c.substring(0, 4)}</th>`);
                matrixHtml += `</tr></thead><tbody>`;

                rel.matrix.forEach((row, i) => {
                    matrixHtml += `<tr><th>${cats[i].substring(0, 4)}</th>`;
                    row.forEach((val, j) => {
                        const cellClass = val === 1 ? 'matrix-cell-1' : 'matrix-cell-0';
                        matrixHtml += `<td class="${cellClass}">${val}</td>`;
                    });
                    matrixHtml += `</tr>`;
                });
                matrixHtml += `</tbody></table>`;

                container.innerHTML = `
                    <div style="margin-bottom: 16px;">
                        <h4 style="font-size: 0.95rem; font-weight: 700;">Relation: Category Same-Day Co-occurrence</h4>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                            Defined on the set of categories $C$: $(c_i, c_j) \in R$ iff both categories had expenses logged on the same calendar day, with reflexive identity pairs $(c_i, c_i)$ included.
                        </p>
                    </div>

                    <div class="two-col-grid" style="margin-bottom: 20px;">
                        <div>
                            <h5 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 8px;">Relation Properties Checklist</h5>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <div style="background: var(--bg-tertiary); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid ${rel.properties.reflexive.holds ? 'var(--success)' : 'var(--danger)'};">
                                    <strong>Reflexive:</strong> ${rel.properties.reflexive.holds ? '✅ YES' : '❌ NO'}
                                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${rel.properties.reflexive.reason}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid ${rel.properties.symmetric.holds ? 'var(--success)' : 'var(--danger)'};">
                                    <strong>Symmetric:</strong> ${rel.properties.symmetric.holds ? '✅ YES' : '❌ NO'}
                                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${rel.properties.symmetric.reason}</div>
                                </div>
                                <div style="background: var(--bg-tertiary); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid ${rel.properties.transitive.holds ? 'var(--success)' : 'var(--danger)'};">
                                    <strong>Transitive:</strong> ${rel.properties.transitive.holds ? '✅ YES' : '❌ NO'}
                                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${rel.properties.transitive.reason}</div>
                                </div>
                                <div class="formula-box" style="margin-top: 6px;">
                                    <strong>Equivalence Relation Verdict:</strong> ${rel.properties.isEquivalence ? 'YES (R is an Equivalence Relation)' : 'NO (Fails one or more equivalence axioms)'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 8px;">Relation Matrix $M_R$ (7 × 7)</h5>
                            <div class="table-responsive">${matrixHtml}</div>
                        </div>
                    </div>
                `;
            } else if (modelKey === 'expenseCategory') {
                const rel = RelationsModule.buildExpenseCategoryRelation(expenses);
                container.innerHTML = `
                    <div style="margin-bottom: 16px;">
                        <h4 style="font-size: 0.95rem; font-weight: 700;">${rel.name}</h4>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${rel.description}</p>
                    </div>

                    <div class="two-col-grid" style="margin-bottom: 20px;">
                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md);">
                            <h5 style="font-weight: 700; font-size: 0.88rem; margin-bottom: 6px;">Domain & Range Sets</h5>
                            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <strong>Domain (${rel.domainCount} elements):</strong> Set of all transaction IDs.
                            </p>
                            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <strong>Codomain (${rel.codomainCount} elements):</strong> All 7 standard categories.
                            </p>
                            <p style="font-size: 0.82rem; color: var(--text-secondary);">
                                <strong>Range (${rel.rangeCount} elements):</strong> { ${rel.range.join(', ')} }
                            </p>
                            <div class="formula-box" style="margin-top: 12px;">
                                Function Property: Left-total & Right-unique = <strong>${rel.isFunction ? 'TRUE (Every expense maps to exactly 1 category)' : 'FALSE'}</strong>
                            </div>
                        </div>

                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); max-height: 280px; overflow-y: auto;">
                            <h5 style="font-weight: 700; font-size: 0.88rem; margin-bottom: 8px;">Sample Ordered Pairs $(e_i, c_j) \in R$</h5>
                            <div style="display: flex; flex-direction: column; gap: 4px; font-family: monospace; font-size: 0.8rem;">
                                ${rel.orderedPairs.slice(0, 12).map(p => `<div>• (${p.expenseLabel}, <span style="color:var(--brand-primary);">${p.category}</span>) [₹${p.amount}]</div>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else if (modelKey === 'spendingTier') {
                const rel = RelationsModule.buildSpendingTierEquivalenceRelation(expenses);
                container.innerHTML = `
                    <div style="margin-bottom: 16px;">
                        <h4 style="font-size: 0.95rem; font-weight: 700;">${rel.name}</h4>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${rel.description}</p>
                    </div>

                    <div class="formula-box">
                        <strong>Theorem:</strong> Any relation induced by a function equality $a \sim b \iff f(a) = f(b)$ is strictly an <strong>Equivalence Relation</strong> (Reflexive, Symmetric, Transitive).
                    </div>

                    <div style="margin-top: 16px;">
                        <h5 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 10px;">Generated Equivalence Classes (Partitions of Set $E$):</h5>
                        <div class="two-col-grid">
                            ${Object.keys(rel.partitions).map(tierName => `
                                <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                    <strong style="color: var(--brand-primary); font-size: 0.85rem;">Class [${tierName}]:</strong>
                                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 6px;">
                                        ${rel.partitions[tierName].length ? rel.partitions[tierName].map(item => `<div>• ${item}</div>`).join('') : '<em>Empty class</em>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        },

        // ---------------------------------------------------------------------
        // 3. FUNCTIONS SUB-VIEW
        // ---------------------------------------------------------------------
        renderFunctionsSubView() {
            const expenses = StorageManager.getExpenses();
            const container = document.getElementById('functionsAnalysisContainer');
            if (!container) return;

            const catFunc = FunctionsModule.analyzeCategoryFunction(expenses);
            const amtFunc = FunctionsModule.analyzeAmountFunction(expenses);

            container.innerHTML = `
                <div class="two-col-grid" style="margin-bottom: 20px;">
                    <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--brand-primary); margin-bottom: 8px;">
                            ${catFunc.name}
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
                            Domain Size: <strong>${catFunc.domainSize}</strong> | Codomain Size: <strong>${catFunc.codomainSize}</strong> | Range Size: <strong>${catFunc.rangeSize}</strong>
                        </p>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-sm); border-left: 3px solid ${catFunc.isInjective ? 'var(--success)' : 'var(--warning)'};">
                                <div style="font-weight: 700; font-size: 0.84rem;">1. Injective (One-to-One): ${catFunc.isInjective ? '✅ YES' : '❌ NO'}</div>
                                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">${catFunc.injectiveExplanation}</div>
                            </div>

                            <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-sm); border-left: 3px solid ${catFunc.isSurjective ? 'var(--success)' : 'var(--warning)'};">
                                <div style="font-weight: 700; font-size: 0.84rem;">2. Surjective (Onto): ${catFunc.isSurjective ? '✅ YES' : '❌ NO'}</div>
                                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">${catFunc.surjectiveExplanation}</div>
                            </div>

                            <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-sm); border-left: 3px solid ${catFunc.isBijective ? 'var(--success)' : 'var(--danger)'};">
                                <div style="font-weight: 700; font-size: 0.84rem;">3. Bijective (Bijection): ${catFunc.isBijective ? '✅ YES' : '❌ NO'}</div>
                                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">${catFunc.bijectiveExplanation}</div>
                            </div>
                        </div>
                    </div>

                    <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <h4 style="font-size: 0.92rem; font-weight: 700; color: #8b5cf6; margin-bottom: 8px;">
                            ${amtFunc.name}
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
                            Maps each transaction $e$ to its monetary cost $g(e) = \text{amount} \in \mathbb{R}^+$.
                        </p>
                        <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-sm); border-left: 3px solid ${amtFunc.isInjective ? 'var(--success)' : 'var(--warning)'}; margin-bottom: 14px;">
                            <div style="font-weight: 700; font-size: 0.84rem;">Injectivity Test: ${amtFunc.isInjective ? '✅ Injectivity Holds' : '❌ Not Injective'}</div>
                            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 3px;">${amtFunc.explanation}</div>
                        </div>

                        <!-- Arrow Mapping Illustration -->
                        <h5 style="font-size: 0.84rem; font-weight: 700; margin-bottom: 8px;">Arrow Mapping (Sample Sample Pairs):</h5>
                        <div style="font-family: monospace; font-size: 0.8rem; max-height: 140px; overflow-y: auto;">
                            ${expenses.slice(0, 6).map(e => `
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="color: var(--text-primary); max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e.title}</span>
                                    <span style="color: var(--brand-accent);">──↦</span>
                                    <span class="badge badge-category">${e.category}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        // ---------------------------------------------------------------------
        // 4. PROPOSITIONAL LOGIC SUB-VIEW
        // ---------------------------------------------------------------------
        renderLogicSubView() {
            const expenses = StorageManager.getExpenses();
            const budgetStatus = BudgetManager.calculateStatus(expenses);
            const logicData = LogicModule.evaluateLivePropositions(expenses, budgetStatus.monthlyBudget);

            // 1. Live Propositions Grid
            const propsGrid = document.getElementById('logicLivePropositionsGrid');
            if (propsGrid) {
                const props = [logicData.propositions.P, logicData.propositions.Q, logicData.propositions.R, logicData.propositions.S];
                propsGrid.innerHTML = props.map(p => `
                    <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: var(--brand-primary); font-size: 0.95rem;">Proposition ${p.symbol}:</strong>
                            <div style="font-size: 0.82rem; color: var(--text-primary); margin-top: 2px;">${p.statement}</div>
                            <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Data: ${p.raw}</div>
                        </div>
                        <span class="badge ${p.value ? 'badge-success' : 'badge-danger'}" style="font-size: 0.95rem; font-family: monospace; padding: 6px 14px;">
                            ${p.value ? 'TRUE (T)' : 'FALSE (F)'}
                        </span>
                    </div>
                `).join('');
            }

            // 2. Compound Expressions Table
            const compoundTbody = document.getElementById('logicCompoundTbody');
            if (compoundTbody) {
                compoundTbody.innerHTML = logicData.compoundResults.map(item => `
                    <tr>
                        <td style="font-family: monospace; font-weight: 700; color: var(--brand-accent); font-size: 0.92rem;">${item.formula}</td>
                        <td style="font-weight: 600;">${item.name}</td>
                        <td>
                            <span class="badge ${item.value ? 'badge-success' : 'badge-danger'}" style="font-family: monospace;">
                                ${item.value ? 'TRUE (1)' : 'FALSE (0)'}
                            </span>
                        </td>
                        <td style="font-size: 0.8rem; color: var(--text-secondary);">${item.interpretation}</td>
                    </tr>
                `).join('');
            }

            // 3. Interactive Truth Table
            this.renderLogicTruthTable();
        },

        renderLogicTruthTable() {
            const varsCount = Number(document.getElementById('truthTableVarsSelect')?.value || 2);
            const tautologyKey = document.getElementById('logicTautologySelect')?.value || 'tautology';

            const vars = varsCount === 3 ? ['P', 'Q', 'R'] : ['P', 'Q'];
            const tableData = LogicModule.generateTruthTable(vars);
            const classification = LogicModule.classifyExpression(tautologyKey);

            const tableEl = document.getElementById('interactiveTruthTable');
            if (tableEl) {
                let html = `<thead><tr>`;
                tableData.headers.forEach(h => html += `<th>${h}</th>`);
                html += `</tr></thead><tbody>`;

                tableData.rows.forEach(r => {
                    html += `<tr>`;
                    vars.forEach(v => {
                        const val = r.inputs[v];
                        html += `<td class="${val ? 'val-true' : 'val-false'}">${val ? 'T' : 'F'}</td>`;
                    });

                    if (varsCount === 2) {
                        html += `<td class="${r.results.notP ? 'val-true' : 'val-false'}">${r.results.notP ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.and ? 'val-true' : 'val-false'}">${r.results.and ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.or ? 'val-true' : 'val-false'}">${r.results.or ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.implies ? 'val-true' : 'val-false'}">${r.results.implies ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.biconditional ? 'val-true' : 'val-false'}">${r.results.biconditional ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.xor ? 'val-true' : 'val-false'}">${r.results.xor ? 'T' : 'F'}</td>`;
                    } else {
                        html += `<td class="${r.results.and ? 'val-true' : 'val-false'}">${r.results.and ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.or ? 'val-true' : 'val-false'}">${r.results.or ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.implies ? 'val-true' : 'val-false'}">${r.results.implies ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.pAndQImpliesR ? 'val-true' : 'val-false'}">${r.results.pAndQImpliesR ? 'T' : 'F'}</td>`;
                        html += `<td class="${r.results.pOrQAndR ? 'val-true' : 'val-false'}">${r.results.pOrQAndR ? 'T' : 'F'}</td>`;
                    }
                    html += `</tr>`;
                });
                html += `</tbody>`;
                tableEl.innerHTML = html;
            }

            // Classification alert
            const alertBox = document.getElementById('logicClassificationAlert');
            if (alertBox) {
                alertBox.innerHTML = `
                    <div><strong>Formula Evaluated:</strong> ${classification.formulaName}</div>
                    <div style="font-weight: 700; color: ${classification.isTautology ? 'var(--success)' : 'var(--brand-primary)'}; margin-top: 4px;">
                        Classification: ${classification.classification}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                        ${classification.explanation}
                    </div>
                `;
            }
        },

        // ---------------------------------------------------------------------
        // 5. GRAPH THEORY SUB-VIEW
        // ---------------------------------------------------------------------
        renderGraphTheorySubView() {
            const expenses = StorageManager.getExpenses();
            const graphData = GraphTheoryModule.buildCategoryGraph(expenses);

            // Render Canvas
            GraphTheoryModule.renderCanvasGraph('categoryGraphCanvas', graphData);

            // Handshaking Lemma Verification Text
            const proofEl = document.getElementById('handshakingProofText');
            if (proofEl) {
                proofEl.innerHTML = `
                    <div>Vertices |V| = ${graphData.metrics.vertexCount} Categories</div>
                    <div>Edges |E| = ${graphData.metrics.edgeCount} Active Co-spending pairs</div>
                    <div>Total Degree Sum Σ deg(v) = ${graphData.metrics.totalDegreeSum}</div>
                    <div>2 × |E| = 2 × ${graphData.metrics.edgeCount} = ${2 * graphData.metrics.edgeCount}</div>
                    <div style="color: var(--success); margin-top: 4px;">
                        Status: ${graphData.metrics.handshakingHolds ? '✓ Handshaking Lemma Verified (Theorem Holds True)' : 'Calculated'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                        Connected Components: ${graphData.metrics.componentCount} | Connected Graph: ${graphData.metrics.isConnected ? 'Yes' : 'No (Isolated components exist)'}
                    </div>
                `;
            }

            // Vertex Degrees Table
            const degTbody = document.getElementById('vertexDegreesTbody');
            if (degTbody) {
                degTbody.innerHTML = graphData.degrees.map(d => `
                    <tr>
                        <td>
                            <span style="margin-right: 6px;">${d.icon}</span>
                            <strong>${d.name}</strong>
                        </td>
                        <td>
                            <span class="badge badge-category">${d.vertex}</span>
                        </td>
                        <td style="font-weight: 700; font-family: monospace; font-size: 0.95rem; color: var(--brand-primary);">
                            deg(v) = ${d.degree}
                        </td>
                    </tr>
                `).join('');
            }

            // Adjacency Matrix Table
            const matrixTable = document.getElementById('graphAdjMatrixTable');
            if (matrixTable) {
                const cats = graphData.vertices;
                let html = `<thead><tr><th>A</th>`;
                cats.forEach(c => html += `<th>${c.id.substring(0, 4)}</th>`);
                html += `</tr></thead><tbody>`;

                graphData.adjMatrix.forEach((row, i) => {
                    html += `<tr><th>${cats[i].id.substring(0, 4)}</th>`;
                    row.forEach((val, j) => {
                        const cellClass = val > 0 ? 'matrix-cell-1' : 'matrix-cell-0';
                        html += `<td class="${cellClass}">${val}</td>`;
                    });
                    html += `</tr>`;
                });
                html += `</tbody>`;
                matrixTable.innerHTML = html;
            }
        },

        // =========================================================================
        // SETTINGS & ACADEMIC DATA
        // =========================================================================
        bindSettingsForm() {
            const profileForm = document.getElementById('settingsProfileForm');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const studentName = document.getElementById('settingsStudentName')?.value.trim() || '';
                    const rollNumber = document.getElementById('settingsRollNumber')?.value.trim() || '';
                    const course = document.getElementById('settingsCourse')?.value.trim() || '';
                    const semester = document.getElementById('settingsSemester')?.value.trim() || '';
                    const universityName = document.getElementById('settingsUniversityName')?.value.trim() || '';
                    const projectTitle = document.getElementById('settingsProjectTitle')?.value.trim() || '';
                    const groupMembers = document.getElementById('settingsGroupMembers')?.value.trim() || '';

                    StorageManager.setSettings({
                        studentName,
                        rollNumber,
                        course,
                        semester,
                        universityName,
                        projectTitle,
                        groupMembers
                    });
                    this.showToast('Student profile & academic details saved successfully!', 'success');
                    this.renderProfileDetails();
                });
            }

            // Restore default university & project details
            const resetDefaultsBtn = document.getElementById('btnResetProfileDefaults');
            if (resetDefaultsBtn) {
                resetDefaultsBtn.addEventListener('click', () => {
                    const courseInput = document.getElementById('settingsCourse');
                    const semInput = document.getElementById('settingsSemester');
                    const univInput = document.getElementById('settingsUniversityName');
                    const projInput = document.getElementById('settingsProjectTitle');

                    if (courseInput) courseInput.value = 'B.Tech Computer Science and Engineering';
                    if (semInput) semInput.value = '3rd Semester';
                    if (univInput) univInput.value = 'Manav Rachna University';
                    if (projInput) projInput.value = 'CollegeSpend – Smart College Daily Expense Tracker';

                    this.showToast('Default academic details restored. Click Save to persist.', 'info');
                });
            }

            // Reset demo data
            const resetBtn = document.getElementById('btnResetDemoData');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    if (confirm('Reset all transactions to default rich demo data?')) {
                        StorageManager.resetToDemoData();
                        this.showToast('Demo dataset loaded successfully!', 'success');
                        this.refreshAll();
                    }
                });
            }

            // Clear all expenses
            const clearBtn = document.getElementById('btnClearAllExpenses');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    if (confirm('⚠️ WARNING: This will permanently delete ALL expense records. Proceed?')) {
                        StorageManager.clearAllData();
                        this.showToast('All transaction records cleared.', 'warning');
                        this.refreshAll();
                    }
                });
            }

            // Export JSON
            const exportBtn = document.getElementById('btnExportJSON');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    const jsonStr = StorageManager.exportDataJSON();
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `collegespend_backup_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    this.showToast('JSON backup file downloaded.', 'success');
                });
            }

            // Import JSON
            const importInput = document.getElementById('importJSONInput');
            if (importInput) {
                importInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const res = StorageManager.importDataJSON(event.target.result);
                        if (res.success) {
                            this.showToast(`Imported ${res.count} transactions successfully!`, 'success');
                            this.refreshAll();
                        } else {
                            this.showToast(`Import failed: ${res.error}`, 'error');
                        }
                    };
                    reader.readAsText(file);
                });
            }
        },

        renderSettingsView() {
            const settings = StorageManager.getSettings();
            const nameInput = document.getElementById('settingsStudentName');
            const rollInput = document.getElementById('settingsRollNumber');
            const courseInput = document.getElementById('settingsCourse');
            const semInput = document.getElementById('settingsSemester');
            const univInput = document.getElementById('settingsUniversityName');
            const projInput = document.getElementById('settingsProjectTitle');
            const membersInput = document.getElementById('settingsGroupMembers');

            if (nameInput) nameInput.value = settings.studentName || '';
            if (rollInput) rollInput.value = settings.rollNumber || '';
            if (courseInput) courseInput.value = settings.course || 'B.Tech Computer Science and Engineering';
            if (semInput) semInput.value = settings.semester || '3rd Semester';
            if (univInput) univInput.value = settings.universityName || 'Manav Rachna University';
            if (projInput) projInput.value = settings.projectTitle || 'CollegeSpend – Smart College Daily Expense Tracker';
            if (membersInput) membersInput.value = settings.groupMembers || '';
        }
    };

    // Boot application
    App.init();
    window.App = App;
});

