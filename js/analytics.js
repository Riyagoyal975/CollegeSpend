/**
 * CollegeSpend - Analytics & Chart Reporting Module
 * Computes statistical summaries, category distributions, timeline aggregations,
 * and maintains interactive Chart.js charts.
 */

const AnalyticsModule = {
    charts: {
        trendChart: null,
        categoryChart: null,
        paymentChart: null
    },

    // Aggregate statistics across expenses
    computeAnalytics(expenses, timeframe = 'all') {
        const now = new Date();
        let filteredExpenses = [...expenses];
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12
        const localTodayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const utcTodayStr = now.toISOString().split('T')[0];

        // Apply timeframe filter with unified date logic
        if (timeframe === 'today') {
            filteredExpenses = expenses.filter(e => {
                if (!e.date) return false;
                const clean = String(e.date).split('T')[0].trim();
                return clean === localTodayStr || clean === utcTodayStr;
            });
        } else if (timeframe === 'this_week') {
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            const weekStartStr = `${oneWeekAgo.getFullYear()}-${String(oneWeekAgo.getMonth() + 1).padStart(2, '0')}-${String(oneWeekAgo.getDate()).padStart(2, '0')}`;
            filteredExpenses = expenses.filter(e => {
                if (!e.date) return false;
                const clean = String(e.date).split('T')[0].trim();
                return clean >= weekStartStr;
            });
        } else if (timeframe === 'this_month') {
            filteredExpenses = expenses.filter(e => {
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
        }

        const totalSpent = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const count = filteredExpenses.length;
        const averagePerTransaction = count > 0 ? (totalSpent / count) : 0;

        // Category breakdown
        const categoryMap = {};
        CATEGORIES.forEach(c => {
            categoryMap[c.id] = {
                id: c.id,
                name: c.name,
                icon: c.icon,
                color: c.color,
                type: c.type,
                total: 0,
                count: 0
            };
        });

        filteredExpenses.forEach(e => {
            if (categoryMap[e.category]) {
                categoryMap[e.category].total += Number(e.amount);
                categoryMap[e.category].count += 1;
            } else {
                if (!categoryMap['Others']) {
                    categoryMap['Others'] = { id: 'Others', name: 'Others', icon: '📦', color: '#6b7280', total: 0, count: 0 };
                }
                categoryMap['Others'].total += Number(e.amount);
                categoryMap['Others'].count += 1;
            }
        });

        const categoryList = Object.values(categoryMap).map(cat => ({
            ...cat,
            percentage: totalSpent > 0 ? Math.round((cat.total / totalSpent) * 1000) / 10 : 0
        })).sort((a, b) => b.total - a.total);

        // Highest spending category
        const highestCategory = categoryList.length > 0 && categoryList[0].total > 0 ? categoryList[0] : null;

        // Payment method breakdown
        const paymentMap = {};
        PAYMENT_METHODS.forEach(pm => paymentMap[pm] = 0);
        filteredExpenses.forEach(e => {
            if (paymentMap[e.paymentMethod] !== undefined) {
                paymentMap[e.paymentMethod] += Number(e.amount);
            } else {
                paymentMap[e.paymentMethod] = Number(e.amount);
            }
        });

        // Timeline aggregations for trend chart (last 14 days or by date)
        const dateAggregates = {};
        filteredExpenses.forEach(e => {
            dateAggregates[e.date] = (dateAggregates[e.date] || 0) + Number(e.amount);
        });

        // Sorted timeline dates
        const sortedDates = Object.keys(dateAggregates).sort();
        const trendData = sortedDates.map(date => ({
            date,
            amount: dateAggregates[date]
        }));

        return {
            timeframe,
            totalSpent,
            count,
            averagePerTransaction: Math.round(averagePerTransaction * 100) / 100,
            categoryList,
            highestCategory,
            paymentMap,
            trendData
        };
    },

    // Initialize or update Chart.js charts
    renderCharts(analyticsData) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library is not loaded. Skipping chart rendering.');
            return;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

        // 1. Spending Trend Chart (Bar + Line)
        const trendCanvas = document.getElementById('analyticsTrendChart');
        if (trendCanvas) {
            if (this.charts.trendChart) {
                this.charts.trendChart.destroy();
            }

            const labels = analyticsData.trendData.map(d => {
                const dateParts = d.date.split('-');
                return `${dateParts[2]}/${dateParts[1]}`;
            });
            const dataValues = analyticsData.trendData.map(d => d.amount);

            this.charts.trendChart = new Chart(trendCanvas, {
                type: 'bar',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        label: 'Daily Spending (₹)',
                        data: dataValues.length ? dataValues : [0],
                        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.65)' : 'rgba(37, 99, 235, 0.7)',
                        borderColor: isDark ? '#38bdf8' : '#2563eb',
                        borderWidth: 1.5,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` Spent: ₹${context.raw.toLocaleString('en-IN')}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: textColor, font: { family: 'Inter', size: 11 } },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                color: textColor,
                                font: { family: 'Inter', size: 11 },
                                callback: (val) => '₹' + val
                            },
                            grid: { color: gridColor }
                        }
                    }
                }
            });
        }

        // 2. Category Doughnut Chart
        const catCanvas = document.getElementById('analyticsCategoryChart');
        if (catCanvas) {
            if (this.charts.categoryChart) {
                this.charts.categoryChart.destroy();
            }

            const activeCats = analyticsData.categoryList.filter(c => c.total > 0);
            const catLabels = activeCats.map(c => `${c.icon} ${c.id}`);
            const catData = activeCats.map(c => c.total);
            const catColors = activeCats.map(c => c.color);

            this.charts.categoryChart = new Chart(catCanvas, {
                type: 'doughnut',
                data: {
                    labels: catLabels.length ? catLabels : ['No Expenses Yet'],
                    datasets: [{
                        data: catData.length ? catData : [1],
                        backgroundColor: catColors.length ? catColors : ['#94a3b8'],
                        borderWidth: 2,
                        borderColor: isDark ? '#0f172a' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: { family: 'Inter', size: 11 },
                                boxWidth: 12,
                                padding: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` Total: ₹${ctx.raw.toLocaleString('en-IN')}`
                            }
                        }
                    }
                }
            });
        }

        // 3. Payment Method Chart
        const paymentCanvas = document.getElementById('analyticsPaymentChart');
        if (paymentCanvas) {
            if (this.charts.paymentChart) {
                this.charts.paymentChart.destroy();
            }

            const pmLabels = Object.keys(analyticsData.paymentMap);
            const pmData = Object.values(analyticsData.paymentMap);
            const pmColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

            this.charts.paymentChart = new Chart(paymentCanvas, {
                type: 'polarArea',
                data: {
                    labels: pmLabels,
                    datasets: [{
                        data: pmData,
                        backgroundColor: pmColors.map(c => isDark ? c + 'b3' : c + 'cc'),
                        borderColor: isDark ? '#1e293b' : '#ffffff',
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: textColor,
                                font: { family: 'Inter', size: 10 },
                                boxWidth: 10
                            }
                        }
                    },
                    scales: {
                        r: {
                            ticks: { display: false },
                            grid: { color: gridColor }
                        }
                    }
                }
            });
        }
    }
};

window.AnalyticsModule = AnalyticsModule;

