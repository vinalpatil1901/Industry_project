// ==========================================================================
// Campus360 - Student Money Management Dashboard
// Complete Controller Script for All 4 Dashboard Sections
// ==========================================================================

import Chart from 'chart.js/auto';

// ---------- 1. Utilities & Formatting ----------
function formatINR(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthYearLabel(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || ''} ${year}`;
}

function getMonthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}

// ==========================================================================
// 2. Section 1: Daily Expense Tracker
// ==========================================================================
const EXPENSES_STORAGE_KEY = 'student_money_expenses';
let expenses = [];
let activeCategoryFilter = 'All';
let isCurrentMonthOnlyFilter = false;
let categoryChartInstance = null;

// Initial sample data to populate dashboard on first launch
const INITIAL_SAMPLE_EXPENSES = [
  { amount: 140, category: 'Food', date: getTodayStr(), description: 'Campus Canteen Lunch' },
  { amount: 50, category: 'Transport', date: getTodayStr(), description: 'Metro Smart Card Ride' },
  { amount: 450, category: 'Study', date: getTodayStr(), description: 'Data Structures Textbook' },
  { amount: 280, category: 'Entertainment', date: getTodayStr(), description: 'Weekend Cinema Ticket' },
  { amount: 95, category: 'Other', date: getTodayStr(), description: 'Stationery & Highlighter Set' }
];

function loadExpenses() {
  const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
  if (raw) {
    try {
      expenses = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse expenses', e);
      expenses = [...INITIAL_SAMPLE_EXPENSES];
      saveExpenses();
    }
  } else {
    expenses = [...INITIAL_SAMPLE_EXPENSES];
    saveExpenses();
  }
}

function saveExpenses() {
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
}

function updateExpenseMetrics() {
  const today = getTodayStr();
  const currentMonthKey = getMonthKey(today);

  let dailyTotal = 0;
  let monthlyTotal = 0;
  const daysInMonthSet = new Set();

  expenses.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    if (exp.date === today) {
      dailyTotal += amt;
    }
    if (getMonthKey(exp.date) === currentMonthKey) {
      monthlyTotal += amt;
      daysInMonthSet.add(exp.date);
    }
  });

  const loggedDays = Math.max(daysInMonthSet.size, 1);
  const dailyAverage = monthlyTotal / loggedDays;

  // DOM bindings
  const dailyTotalEl = document.getElementById('dailyTotalAmount');
  const monthlyTotalEl = document.getElementById('monthlyTotalAmount');
  const dailyAvgEl = document.getElementById('dailyAverageAmount');
  const totalEntriesVal = document.getElementById('totalEntriesValue');
  const totalEntriesCount = document.getElementById('totalEntriesCount');
  const activeMonthBadge = document.getElementById('activeMonthBadge');
  const monthlyTotalFoot = document.getElementById('monthlyTotalFoot');
  const todayDateLabel = document.getElementById('todayDateLabel');

  if (dailyTotalEl) dailyTotalEl.textContent = formatINR(dailyTotal);
  if (monthlyTotalEl) monthlyTotalEl.textContent = formatINR(monthlyTotal);
  if (dailyAvgEl) dailyAvgEl.textContent = formatINR(dailyAverage);
  if (totalEntriesVal) totalEntriesVal.textContent = expenses.length;
  if (totalEntriesCount) totalEntriesCount.textContent = `${expenses.length} Total`;

  const monthLabel = getMonthYearLabel(today);
  if (activeMonthBadge) activeMonthBadge.textContent = monthLabel;
  if (monthlyTotalFoot) monthlyTotalFoot.textContent = `Total spent in ${monthLabel}`;
  if (todayDateLabel) todayDateLabel.textContent = `Recorded for ${today}`;
}

function getFilteredExpenses() {
  const searchVal = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase().trim();
  const currentMonthKey = getMonthKey(getTodayStr());

  return expenses.filter(exp => {
    // Category chip filter
    if (activeCategoryFilter !== 'All' && exp.category !== activeCategoryFilter) {
      return false;
    }
    // Current month toggle
    if (isCurrentMonthOnlyFilter && getMonthKey(exp.date) !== currentMonthKey) {
      return false;
    }
    // Search query filter
    if (searchVal) {
      const matchCat = exp.category.toLowerCase().includes(searchVal);
      const matchDesc = (exp.description || '').toLowerCase().includes(searchVal);
      const matchDate = exp.date.includes(searchVal);
      const matchAmt = String(exp.amount).includes(searchVal);
      if (!matchCat && !matchDesc && !matchDate && !matchAmt) return false;
    }
    return true;
  });
}

function renderExpenseTable() {
  const tbody = document.querySelector('#expenseTable tbody');
  const emptyNotice = document.getElementById('emptyExpenseNotice');
  const statsCounter = document.getElementById('expenseStatsCounter');
  if (!tbody) return;

  tbody.innerHTML = '';
  const filtered = getFilteredExpenses();

  if (statsCounter) {
    statsCounter.textContent = `Showing ${filtered.length} of ${expenses.length} records`;
  }

  if (filtered.length === 0) {
    if (emptyNotice) emptyNotice.classList.remove('hidden');
    return;
  }
  if (emptyNotice) emptyNotice.classList.add('hidden');

  // Sort descending by date
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(exp => {
    const originalIndex = expenses.indexOf(exp);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${exp.date}</strong></td>
      <td>
        <span class="cat-pill ${exp.category}">
          ${getCategoryIcon(exp.category)} ${exp.category}
        </span>
      </td>
      <td>${escapeHtml(exp.description || '—')}</td>
      <td class="table-amount-cell">${formatINR(exp.amount)}</td>
      <td style="text-align: right;">
        <div class="table-actions-cell">
          <button type="button" class="action-icon-btn edit" data-action="edit" data-index="${originalIndex}" title="Edit Expense">
            <i class="fas fa-edit"></i>
          </button>
          <button type="button" class="action-icon-btn delete" data-action="delete" data-index="${originalIndex}" title="Delete Expense">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Food': return '<i class="fas fa-hamburger"></i>';
    case 'Transport': return '<i class="fas fa-bus"></i>';
    case 'Study': return '<i class="fas fa-book"></i>';
    case 'Entertainment': return '<i class="fas fa-film"></i>';
    case 'Other': return '<i class="fas fa-lightbulb"></i>';
    default: return '<i class="fas fa-tag"></i>';
  }
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'Food': return '#3b82f6';
    case 'Transport': return '#f59e0b';
    case 'Study': return '#8b5cf6';
    case 'Entertainment': return '#ec4899';
    case 'Other': return '#10b981';
    default: return '#64748b';
  }
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  const legendContainer = document.getElementById('categoryBreakdownLegend');
  const chartHeading = document.getElementById('categoryChartHeading');
  const chartMonthSub = document.getElementById('chartMonthSubtitle');
  const monthlySpendBadge = document.getElementById('chartMonthlySpendBadge');
  if (!canvas) return;

  const standardCategories = ['Food', 'Transport', 'Study', 'Entertainment', 'Other'];
  const today = getTodayStr();
  const currentMonthKey = getMonthKey(today);
  const currentMonthName = getMonthYearLabel(today);

  if (chartMonthSub) {
    chartMonthSub.textContent = `Month: ${currentMonthName} (Active Term)`;
  }

  // Aggregate monthly amounts for each standard category
  const categoryTotals = {
    Food: 0,
    Transport: 0,
    Study: 0,
    Entertainment: 0,
    Other: 0
  };

  let totalMonthSpend = 0;
  expenses.forEach(exp => {
    // If expense belongs to current month
    if (getMonthKey(exp.date) === currentMonthKey) {
      const cat = exp.category || 'Other';
      const amt = Number(exp.amount) || 0;
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += amt;
      } else {
        categoryTotals['Other'] += amt;
      }
      totalMonthSpend += amt;
    }
  });

  if (monthlySpendBadge) {
    monthlySpendBadge.textContent = `${formatINR(totalMonthSpend)} Spent`;
  }

  const chartLabels = standardCategories;
  const chartData = standardCategories.map(c => categoryTotals[c]);
  const chartColors = standardCategories.map(c => getCategoryColor(c));

  // Destroy previous chart instance cleanly
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  const hasData = totalMonthSpend > 0;

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: hasData ? chartData : [1, 1, 1, 1, 1],
        backgroundColor: hasData ? chartColors : ['#e2e8f0', '#cbd5e1', '#e2e8f0', '#cbd5e1', '#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '68%',
      plugins: {
        legend: {
          display: false // Using our custom clean SaaS legend
        },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const pct = totalMonthSpend > 0 ? ((val / totalMonthSpend) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // Render comprehensive category breakdown list
  if (legendContainer) {
    legendContainer.innerHTML = '';
    standardCategories.forEach(cat => {
      const amt = categoryTotals[cat];
      const pct = totalMonthSpend > 0 ? ((amt / totalMonthSpend) * 100).toFixed(1) : '0.0';
      const color = getCategoryColor(cat);

      const row = document.createElement('div');
      row.className = 'legend-row-item';
      row.innerHTML = `
        <div class="legend-left">
          <span class="legend-dot" style="background-color: ${color};"></span>
          <span class="legend-name">${cat}</span>
        </div>
        <div class="legend-right">
          <span class="legend-amount">${formatINR(amt)}</span>
          <span class="legend-pct">${pct}%</span>
        </div>
      `;
      legendContainer.appendChild(row);
    });
  }
}

function refreshExpenseSection() {
  updateExpenseMetrics();
  renderExpenseTable();
  renderCategoryChart();
}

// Form Submission (Add vs Save Edit)
function initExpenseForm() {
  const form = document.getElementById('expenseForm');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');
  const dateInput = document.getElementById('date');
  const descriptionInput = document.getElementById('description');
  const editIndexInput = document.getElementById('editExpenseIndex');
  const submitBtnText = document.getElementById('expenseSubmitBtnText');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formPanelTitle = document.getElementById('formPanelTitle');
  const formModeTag = document.getElementById('formModeTag');

  // Default date to today
  if (dateInput) dateInput.value = getTodayStr();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();
    const editIdx = parseInt(editIndexInput.value, 10);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!date) {
      alert('Please select an expense date.');
      return;
    }

    if (editIdx >= 0 && editIdx < expenses.length) {
      // Update existing item
      expenses[editIdx] = { amount, category, date, description };
      resetFormState();
    } else {
      // Add new item
      expenses.push({ amount, category, date, description });
      form.reset();
      dateInput.value = getTodayStr();
    }

    saveExpenses();
    refreshExpenseSection();
  });

  // Cancel Edit button
  cancelEditBtn.addEventListener('click', () => {
    resetFormState();
  });

  function resetFormState() {
    form.reset();
    editIndexInput.value = '-1';
    if (submitBtnText) submitBtnText.textContent = 'Add Expense';
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    if (formPanelTitle) formPanelTitle.textContent = 'Add New Expense';
    if (formModeTag) {
      formModeTag.textContent = 'New Entry';
      formModeTag.className = 'panel-tag';
    }
    if (dateInput) dateInput.value = getTodayStr();
  }

  // Handle Edit & Delete button clicks on table
  const table = document.getElementById('expenseTable');
  table.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.index, 10);

    if (action === 'delete') {
      const exp = expenses[idx];
      if (confirm(`Delete ${exp.category} expense of ${formatINR(exp.amount)} on ${exp.date}?`)) {
        expenses.splice(idx, 1);
        saveExpenses();
        // If we were editing this item, cancel edit
        if (parseInt(editIndexInput.value, 10) === idx) {
          resetFormState();
        }
        refreshExpenseSection();
      }
    } else if (action === 'edit') {
      const exp = expenses[idx];
      editIndexInput.value = idx;
      amountInput.value = exp.amount;
      categoryInput.value = exp.category;
      dateInput.value = exp.date;
      descriptionInput.value = exp.description || '';

      if (submitBtnText) submitBtnText.textContent = 'Save Changes';
      if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
      if (formPanelTitle) formPanelTitle.textContent = `Edit Expense #${idx + 1}`;
      if (formModeTag) {
        formModeTag.textContent = 'Editing';
        formModeTag.className = 'panel-tag blue';
      }

      form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      amountInput.focus();
    }
  });

  // Search input live filtering
  const searchInput = document.getElementById('expenseSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderExpenseTable();
    });
  }

  // Category filter chips
  const categoryChips = document.getElementById('categoryChips');
  if (categoryChips) {
    categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-item');
      if (!chip) return;
      categoryChips.querySelectorAll('.chip-item').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategoryFilter = chip.dataset.category || 'All';
      renderExpenseTable();
    });
  }

  // "This Month Only" filter button
  const filterCurrentMonthBtn = document.getElementById('filterCurrentMonthBtn');
  if (filterCurrentMonthBtn) {
    filterCurrentMonthBtn.addEventListener('click', () => {
      isCurrentMonthOnlyFilter = !isCurrentMonthOnlyFilter;
      filterCurrentMonthBtn.classList.toggle('active', isCurrentMonthOnlyFilter);
      filterCurrentMonthBtn.style.backgroundColor = isCurrentMonthOnlyFilter ? '#2563eb' : '';
      filterCurrentMonthBtn.style.color = isCurrentMonthOnlyFilter ? '#ffffff' : '';
      renderExpenseTable();
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportExpensesToCSV);
  }

  // Clear Data
  const clearBtn = document.getElementById('clearAllExpensesBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete all recorded expenses? This cannot be undone.')) {
        expenses = [];
        saveExpenses();
        resetFormState();
        refreshExpenseSection();
      }
    });
  }
}

function exportExpensesToCSV() {
  if (expenses.length === 0) {
    alert('No expense data to export.');
    return;
  }
  let csvContent = 'Date,Category,Description,Amount\n';
  expenses.forEach(e => {
    const desc = (e.description || '').replace(/"/g, '""');
    csvContent += `"${e.date}","${e.category}","${desc}",${e.amount}\n`;
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `student_expenses_${getTodayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================================================================
// 3. Section 2: Small Savings, Big Future
// ==========================================================================
const SAVINGS_GOALS_KEY = 'student_money_goals';
let savingsGoals = [];

const INITIAL_SAMPLE_GOALS = [
  { id: 1, title: 'Cloud Certification Exam', amount: 3500, saved: 2100, date: '2026-12-15' },
  { id: 2, title: 'Hostel Semester Emergency Cushion', amount: 5000, saved: 3250, date: '2026-11-30' },
  { id: 3, title: 'Ergonomic Coding Keyboard', amount: 2000, saved: 800, date: '2026-10-31' }
];

function initSavingsSection() {
  const resultEl = document.getElementById('savingsResult');
  const withInterestEl = document.getElementById('savingsWithInterest');
  const annualRateEl = document.getElementById('savingsAnnualRate');
  const milestoneTitle = document.getElementById('milestoneTitle');
  const milestoneDesc = document.getElementById('milestoneDesc');
  const calcBtn = document.getElementById('calcSavingsBtn');
  const daysInput = document.getElementById('savingDays');
  const goalForm = document.getElementById('goalForm');
  const goalsContainer = document.getElementById('goalsContainer');
  const amountSelector = document.getElementById('dailyAmountSelector');

  // Load goals
  const raw = localStorage.getItem(SAVINGS_GOALS_KEY);
  if (raw) {
    try {
      savingsGoals = JSON.parse(raw);
    } catch (e) {
      savingsGoals = [...INITIAL_SAMPLE_GOALS];
      saveGoals();
    }
  } else {
    savingsGoals = [...INITIAL_SAMPLE_GOALS];
    saveGoals();
  }

  function saveGoals() {
    localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(savingsGoals));
  }

  function renderGoals() {
    if (!goalsContainer) return;
    goalsContainer.innerHTML = '';

    if (savingsGoals.length === 0) {
      goalsContainer.innerHTML = `
        <div class="empty-state-notice" style="grid-column: 1 / -1;">
          <div class="empty-icon"><i class="fas fa-bullseye"></i></div>
          <h3>No Goals Set Yet</h3>
          <p>Create your first savings goal above to track your target and deadline!</p>
        </div>
      `;
      return;
    }

    savingsGoals.forEach((goal, idx) => {
      const saved = Number(goal.saved) || 0;
      const target = Number(goal.amount) || 1;
      const pct = Math.min(Math.round((saved / target) * 100), 100);
      const remaining = Math.max(target - saved, 0);

      const card = document.createElement('div');
      card.className = 'goal-card';
      card.innerHTML = `
        <div class="goal-top">
          <div>
            <div class="goal-name">${escapeHtml(goal.title)}</div>
            <div class="goal-deadline"><i class="fas fa-calendar-alt"></i> Deadline: ${goal.date}</div>
          </div>
          <button type="button" class="action-icon-btn delete" data-goal-delete="${idx}" title="Delete Goal">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>

        <div class="goal-progress-wrap">
          <div class="goal-progress-bar-bg">
            <div class="goal-progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="goal-numbers">
            <span>Saved: <strong>${formatINR(saved)}</strong> (${pct}%)</span>
            <span>Target: <strong>${formatINR(target)}</strong></span>
          </div>
          <div style="font-size: 0.72rem; color: #64748b;">
            Remaining: <strong>${formatINR(remaining)}</strong>
          </div>
        </div>

        <div class="goal-action-row">
          <span style="font-size: 0.74rem; font-weight: 600; color: #475569;">Quick Deposit:</span>
          <div class="quick-deposit-btns">
            <button type="button" class="btn-chip-deposit" data-goal-deposit="${idx}" data-amount="100">+ ₹100</button>
            <button type="button" class="btn-chip-deposit" data-goal-deposit="${idx}" data-amount="500">+ ₹500</button>
            <button type="button" class="btn-chip-deposit" data-goal-custom="${idx}">+ Custom</button>
          </div>
        </div>
      `;
      goalsContainer.appendChild(card);
    });
  }

  // Deposit or delete goals
  goalsContainer.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-goal-delete]');
    if (delBtn) {
      const idx = parseInt(delBtn.dataset.goalDelete, 10);
      if (confirm(`Delete savings goal "${savingsGoals[idx].title}"?`)) {
        savingsGoals.splice(idx, 1);
        saveGoals();
        renderGoals();
      }
      return;
    }

    const depositBtn = e.target.closest('[data-goal-deposit]');
    if (depositBtn) {
      const idx = parseInt(depositBtn.dataset.goalDeposit, 10);
      const addAmt = Number(depositBtn.dataset.amount);
      savingsGoals[idx].saved = (Number(savingsGoals[idx].saved) || 0) + addAmt;
      saveGoals();
      renderGoals();
      return;
    }

    const customBtn = e.target.closest('[data-goal-custom]');
    if (customBtn) {
      const idx = parseInt(customBtn.dataset.goalCustom, 10);
      const input = prompt(`Enter amount to add to "${savingsGoals[idx].title}" (₹):`, '250');
      if (input && !isNaN(input) && Number(input) > 0) {
        savingsGoals[idx].saved = (Number(savingsGoals[idx].saved) || 0) + Number(input);
        saveGoals();
        renderGoals();
      }
    }
  });

  // Calculate Compounding
  function calculateSavings() {
    const selectedRadio = document.querySelector('input[name="dailyAmount"]:checked');
    const daily = selectedRadio ? Number(selectedRadio.value) : 20;
    const days = Number(daysInput.value) || 90;

    const principal = daily * days;
    // Compounded interest: 7% annual rate
    const annualRate = 0.07;
    const dailyRate = annualRate / 365;
    const totalCompounded = principal * Math.pow(1 + dailyRate, days);
    const annualEquiv = daily * 365;

    if (resultEl) resultEl.textContent = formatINR(principal);
    if (withInterestEl) withInterestEl.textContent = formatINR(totalCompounded);
    if (annualRateEl) annualRateEl.textContent = `${formatINR(annualEquiv)} / yr`;

    // Dynamic milestone based on saved amount
    if (milestoneTitle && milestoneDesc) {
      if (principal < 1000) {
        milestoneTitle.textContent = 'Weekly Coffee & Snack Independence';
        milestoneDesc.textContent = `Saving ${formatINR(principal)} effortlessly covers small weekly campus expenses and stationary supplies.`;
      } else if (principal < 3000) {
        milestoneTitle.textContent = 'Semester Textbook & Exam Fund';
        milestoneDesc.textContent = `This ${formatINR(principal)} covers essential engineering books, lab supplies, or two verified technical certifications!`;
      } else if (principal < 7000) {
        milestoneTitle.textContent = 'Hackathon & Tech Gear Upgrade';
        milestoneDesc.textContent = `With ${formatINR(principal)} saved, you can fund an interstate hackathon trip, mechanical keyboard, or RAM/SSD upgrade!`;
      } else {
        milestoneTitle.textContent = 'Major Laptop / Hostel Security Cushion';
        milestoneDesc.textContent = `A massive ${formatINR(principal)} accumulated! That is a formidable emergency safety net for any undergraduate student.`;
      }
    }
  }

  // Radio pills visual selection
  if (amountSelector) {
    amountSelector.addEventListener('click', (e) => {
      const pill = e.target.closest('.radio-pill');
      if (!pill) return;
      amountSelector.querySelectorAll('.radio-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        calculateSavings();
      }
    });
  }

  // Preset days buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      daysInput.value = btn.dataset.days;
      calculateSavings();
    });
  });

  daysInput.addEventListener('input', calculateSavings);
  if (calcBtn) calcBtn.addEventListener('click', calculateSavings);

  // New Goal form submit
  if (goalForm) {
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('goalTitle').value.trim();
      const amount = Number(document.getElementById('goalAmount').value);
      const date = document.getElementById('goalDate').value;

      if (!title || !amount || !date) {
        alert('Please complete all goal fields.');
        return;
      }

      savingsGoals.push({
        id: Date.now(),
        title,
        amount,
        saved: 0,
        date
      });
      saveGoals();
      renderGoals();
      goalForm.reset();
    });
  }

  calculateSavings();
  renderGoals();
}

// ==========================================================================
// 4. Section 3: Investment & Virtual Trading
// ==========================================================================
const INVEST_STORAGE_KEY = 'student_money_investment_v2';
const INITIAL_CASH = 10000;

let investmentState = {
  cash: INITIAL_CASH,
  portfolio: {
    'CLOUD': { shares: 3, avgPrice: 850.00 }
  },
  history: []
};

const SIMULATED_STOCKS = [
  { symbol: 'TECH', name: 'TechCorp AI Solutions', price: 620.00, change: 2.4 },
  { symbol: 'SOLAR', name: 'GreenEnergy India', price: 340.50, change: -1.2 },
  { symbol: 'CLOUD', name: 'CampusCloud Enterprise', price: 890.00, change: 3.8 },
  { symbol: 'FINTECH', name: 'NextGen StudentPay', price: 415.20, change: 0.9 },
  { symbol: 'FOOD', name: 'QuickBite Campus Logistics', price: 180.00, change: -0.5 }
];

let portfolioChartInstance = null;
let priceTickInterval = null;

function initInvestSection() {
  const stockTableBody = document.querySelector('#stockTable tbody');
  const portfolioTableBody = document.querySelector('#portfolioTable tbody');
  const emptyPortfolioNotice = document.getElementById('emptyPortfolioNotice');
  const cashAvailableEl = document.getElementById('investCashAvailable');
  const portfolioTotalEl = document.getElementById('portfolioTotal');
  const netWorthEl = document.getElementById('portfolioNetWorth');
  const profitBadgeEl = document.getElementById('investProfitBadge');
  const profitValEl = document.getElementById('investProfitValue');
  const holdingsBadge = document.getElementById('holdingsCountBadge');
  const resetBtn = document.getElementById('resetInvestBalanceBtn');

  // Load from localStorage
  const raw = localStorage.getItem(INVEST_STORAGE_KEY);
  if (raw) {
    try {
      investmentState = JSON.parse(raw);
    } catch (e) {
      console.error(e);
      saveInvestState();
    }
  } else {
    saveInvestState();
  }

  function saveInvestState() {
    localStorage.setItem(INVEST_STORAGE_KEY, JSON.stringify(investmentState));
  }

  function renderStocks() {
    if (!stockTableBody) return;
    stockTableBody.innerHTML = '';

    SIMULATED_STOCKS.forEach(stock => {
      const isUp = stock.change >= 0;
      const chgPill = `
        <span class="price-change-pill ${isUp ? 'up' : 'down'}">
          <i class="fas fa-caret-${isUp ? 'up' : 'down'}"></i>
          ${isUp ? '+' : ''}${stock.change.toFixed(2)}%
        </span>
      `;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="stock-ticker-cell">
            <span class="ticker-sym">${stock.symbol}</span>
            <span class="ticker-name">${stock.name}</span>
          </div>
        </td>
        <td class="stock-price-cell">${formatINR(stock.price)}</td>
        <td>${chgPill}</td>
        <td>
          <input type="number" min="1" max="100" value="1" class="stock-qty-input" data-symbol="${stock.symbol}" />
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-buy-stock" data-buy-symbol="${stock.symbol}">
            <i class="fas fa-shopping-cart"></i> Buy
          </button>
        </td>
      `;
      stockTableBody.appendChild(tr);
    });
  }

  function renderPortfolio() {
    if (!portfolioTableBody) return;
    portfolioTableBody.innerHTML = '';

    let totalHoldingsVal = 0;
    const symbols = Object.keys(investmentState.portfolio || {});

    if (holdingsBadge) {
      holdingsBadge.textContent = `${symbols.length} Companies Held`;
    }

    if (symbols.length === 0) {
      if (emptyPortfolioNotice) emptyPortfolioNotice.classList.remove('hidden');
    } else {
      if (emptyPortfolioNotice) emptyPortfolioNotice.classList.add('hidden');
    }

    symbols.forEach(sym => {
      const holding = investmentState.portfolio[sym];
      const stock = SIMULATED_STOCKS.find(s => s.symbol === sym) || { price: holding.avgPrice };
      const currentVal = holding.shares * stock.price;
      totalHoldingsVal += currentVal;

      const pnl = currentVal - (holding.shares * holding.avgPrice);
      const isProfit = pnl >= 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${sym}</strong>
        </td>
        <td>${holding.shares} shares</td>
        <td>${formatINR(holding.avgPrice)}</td>
        <td>${formatINR(stock.price)}</td>
        <td>
          <strong>${formatINR(currentVal)}</strong>
          <span style="font-size: 0.72rem; color: ${isProfit ? '#15803d' : '#b91c1c'}; margin-left: 6px;">
            (${isProfit ? '+' : ''}${formatINR(pnl)})
          </span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-sell-stock" data-sell-symbol="${sym}">
            <i class="fas fa-hand-holding-usd"></i> Sell All
          </button>
        </td>
      `;
      portfolioTableBody.appendChild(tr);
    });

    const netWorth = investmentState.cash + totalHoldingsVal;
    const totalProfit = netWorth - INITIAL_CASH;
    const profitPct = ((totalProfit / INITIAL_CASH) * 100).toFixed(2);
    const isNetPositive = totalProfit >= 0;

    if (cashAvailableEl) cashAvailableEl.textContent = formatINR(investmentState.cash);
    if (portfolioTotalEl) portfolioTotalEl.textContent = formatINR(totalHoldingsVal);
    if (netWorthEl) netWorthEl.textContent = formatINR(netWorth);
    if (profitValEl) profitValEl.textContent = `${isNetPositive ? '+' : ''}${formatINR(totalProfit)}`;

    if (profitBadgeEl) {
      profitBadgeEl.textContent = `${isNetPositive ? '+' : ''}${profitPct}%`;
      profitBadgeEl.className = `metric-badge ${isNetPositive ? 'green' : 'orange'}`;
    }

    // Record valuation history point
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!investmentState.history) investmentState.history = [];
    investmentState.history.push({ time: timeLabel, value: netWorth });
    if (investmentState.history.length > 15) investmentState.history.shift();

    renderPortfolioChart();
  }

  function renderPortfolioChart() {
    const canvas = document.getElementById('portfolioChart');
    if (!canvas) return;

    const labels = (investmentState.history || []).map(h => h.time);
    const data = (investmentState.history || []).map(h => h.value);

    if (portfolioChartInstance) {
      portfolioChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    portfolioChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Start'],
        datasets: [{
          label: 'Net Worth (₹)',
          data: data.length > 0 ? data : [INITIAL_CASH],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { size: 10 },
              callback: function(v) { return '₹' + v; }
            }
          }
        }
      }
    });
  }

  // Stock table Buy Action
  stockTableBody.addEventListener('click', (e) => {
    const buyBtn = e.target.closest('[data-buy-symbol]');
    if (!buyBtn) return;

    const sym = buyBtn.dataset.buySymbol;
    const stock = SIMULATED_STOCKS.find(s => s.symbol === sym);
    const qtyInput = document.querySelector(`.stock-qty-input[data-symbol="${sym}"]`);
    const qty = parseInt(qtyInput?.value, 10) || 1;

    if (qty <= 0) {
      alert('Please enter a valid share quantity.');
      return;
    }

    const cost = stock.price * qty;
    if (cost > investmentState.cash) {
      alert(`Insufficient virtual cash! Required: ${formatINR(cost)}, Available: ${formatINR(investmentState.cash)}`);
      return;
    }

    // Deduct cash and add to portfolio
    investmentState.cash -= cost;
    if (!investmentState.portfolio) investmentState.portfolio = {};

    if (investmentState.portfolio[sym]) {
      const existing = investmentState.portfolio[sym];
      const totalShares = existing.shares + qty;
      const totalInvested = (existing.shares * existing.avgPrice) + cost;
      existing.shares = totalShares;
      existing.avgPrice = totalInvested / totalShares;
    } else {
      investmentState.portfolio[sym] = {
        shares: qty,
        avgPrice: stock.price
      };
    }

    saveInvestState();
    renderPortfolio();
  });

  // Portfolio table Sell Action
  portfolioTableBody.addEventListener('click', (e) => {
    const sellBtn = e.target.closest('[data-sell-symbol]');
    if (!sellBtn) return;

    const sym = sellBtn.dataset.sellSymbol;
    const holding = investmentState.portfolio[sym];
    if (!holding) return;

    const stock = SIMULATED_STOCKS.find(s => s.symbol === sym) || { price: holding.avgPrice };
    const saleRevenue = holding.shares * stock.price;

    investmentState.cash += saleRevenue;
    delete investmentState.portfolio[sym];

    saveInvestState();
    renderPortfolio();
  });

  // Reset Balance
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset virtual portfolio and cash balance back to initial ₹10,000?')) {
        investmentState = {
          cash: INITIAL_CASH,
          portfolio: {
            'CLOUD': { shares: 3, avgPrice: 850.00 }
          },
          history: []
        };
        saveInvestState();
        renderPortfolio();
      }
    });
  }

  // Simulated ticks every 5 seconds
  if (priceTickInterval) clearInterval(priceTickInterval);
  priceTickInterval = setInterval(() => {
    SIMULATED_STOCKS.forEach(stock => {
      // Fluctuations between -2.5% and +2.8%
      const deltaPct = (Math.random() * 5.3 - 2.5) / 100;
      stock.price = Math.max(10, Math.round((stock.price * (1 + deltaPct)) * 100) / 100);
      stock.change = deltaPct * 100;
    });
    renderStocks();
    renderPortfolio();
  }, 5000);

  renderStocks();
  renderPortfolio();
}

// ==========================================================================
// 5. Section 4: Savings Challenges
// ==========================================================================
const CHALLENGES_STORAGE_KEY = 'student_money_challenges_v2';

const CURATED_CHALLENGES = [
  {
    id: 'ch_tuesday',
    title: 'No-Takeout Tuesday',
    desc: 'Skip ordering food delivery; cook hostel noodles or eat at the college mess.',
    savings: 150,
    icon: 'fas fa-utensils'
  },
  {
    id: 'ch_beverage',
    title: '7-Day Coffee / Tea DIY Swap',
    desc: 'Brew your own chai or coffee in hostel instead of visiting cafes every evening.',
    savings: 350,
    icon: 'fas fa-mug-hot'
  },
  {
    id: 'ch_weekend',
    title: 'Zero-Spend Weekend',
    desc: 'Enjoy free campus club events, library reading, and sports without spending cash.',
    savings: 600,
    icon: 'fas fa-calendar-times'
  },
  {
    id: 'ch_roundup',
    title: 'Daily Micro Round-Up',
    desc: 'Round up every expense to the nearest ₹50 and tuck the change into your piggy bank.',
    savings: 200,
    icon: 'fas fa-coins'
  },
  {
    id: 'ch_subs',
    title: 'Subscription Cleanup Audit',
    desc: 'Cancel unused OTT, gaming, or app trials and stick to campus Wi-Fi & student perks.',
    savings: 400,
    icon: 'fas fa-tv'
  },
  {
    id: 'ch_sprint',
    title: '30-Day Emergency Cushion Sprint',
    desc: 'Set aside ₹50 every single morning before your first lecture without fail.',
    savings: 1500,
    icon: 'fas fa-shield-alt'
  }
];

let challengeState = {
  streak: 5,
  completed: {
    'ch_tuesday': true,
    'ch_beverage': true
  }
};

function initChallengesSection() {
  const challengeList = document.getElementById('challengeList');
  const streakCountEl = document.getElementById('streakCount');
  const completedCountEl = document.getElementById('completedChallengesCount');
  const badgeContainer = document.getElementById('badgeContainer');
  const savingsTotalEl = document.getElementById('challengeSavingsTotal');
  const resetBtn = document.getElementById('resetChallengesBtn');
  const newChallengeForm = document.getElementById('newChallengeForm');
  const addChallengeBtn = document.getElementById('addChallengeBtn');
  const addChallengeCard = document.getElementById('addChallengeCard');

  // Load state
  const raw = localStorage.getItem(CHALLENGES_STORAGE_KEY);
  if (raw) {
    try {
      challengeState = JSON.parse(raw);
    } catch (e) {
      saveChallengeData();
    }
  } else {
    saveChallengeData();
  }

  if (!challengeState.customChallenges) {
    challengeState.customChallenges = [];
  }

  function saveChallengeData() {
    localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challengeState));
  }

  function getAllChallenges() {
    return [...CURATED_CHALLENGES, ...(challengeState.customChallenges || [])];
  }

  function renderChallengesUI() {
    const streak = challengeState.streak || 0;
    const completedMap = challengeState.completed || {};
    const allChallenges = getAllChallenges();
    const completedCount = Object.keys(completedMap).filter(k => completedMap[k]).length;

    if (streakCountEl) streakCountEl.textContent = streak;
    if (completedCountEl) completedCountEl.textContent = completedCount;

    // Calculate total saved through completed challenges
    let totalSaved = 0;
    allChallenges.forEach(c => {
      if (completedMap[c.id]) {
        totalSaved += c.savings;
      }
    });
    if (savingsTotalEl) savingsTotalEl.textContent = formatINR(totalSaved);

    // Badges based on streak milestones
    if (badgeContainer) {
      badgeContainer.innerHTML = '';
      const badges = [];
      if (streak >= 5) badges.push('<span class="unlocked-badge bronze"><i class="fas fa-medal"></i> Bronze Saver</span>');
      if (streak >= 15) badges.push('<span class="unlocked-badge silver"><i class="fas fa-medal"></i> Silver Disciplined</span>');
      if (streak >= 30) badges.push('<span class="unlocked-badge gold"><i class="fas fa-trophy"></i> Gold Champion</span>');

      if (badges.length > 0) {
        badgeContainer.innerHTML = badges.join(' ');
      } else {
        badgeContainer.innerHTML = '<span class="badge-tag">Reach 5-Day Streak to Unlock</span>';
      }
    }

    // Render cards
    if (!challengeList) return;
    challengeList.innerHTML = '';

    allChallenges.forEach(c => {
      const isDone = !!completedMap[c.id];
      const isCustom = c.id && c.id.startsWith('ch_custom_');
      const card = document.createElement('div');
      card.className = `challenge-card ${isDone ? 'completed' : ''}`;
      card.innerHTML = `
        <div>
          <div class="ch-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="ch-icon-wrap"><i class="${c.icon}"></i></div>
              ${isCustom ? '<span class="ch-custom-badge"><i class="fas fa-user-edit"></i> Custom</span>' : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="ch-savings-tag">Saves ~${formatINR(c.savings)}</span>
              ${isCustom ? `
                <button type="button" class="action-icon-btn delete" data-delete-challenge="${c.id}" title="Delete Custom Challenge">
                  <i class="fas fa-trash-alt"></i>
                </button>
              ` : ''}
            </div>
          </div>
          <div class="ch-content" style="margin-top: 12px;">
            <h3>${escapeHtml(c.title)}</h3>
            <p>${escapeHtml(c.desc)}</p>
          </div>
        </div>
        <button type="button" class="btn-challenge-toggle ${isDone ? 'active-complete' : ''}" data-challenge-id="${c.id}">
          <i class="fas fa-${isDone ? 'check-circle' : 'circle'}"></i>
          <span>${isDone ? 'Completed' : 'Complete Challenge'}</span>
        </button>
      `;
      challengeList.appendChild(card);
    });
  }

  // Handle challenge completion and custom challenge deletion
  challengeList.addEventListener('click', (e) => {
    // Delete custom challenge
    const delBtn = e.target.closest('[data-delete-challenge]');
    if (delBtn) {
      const delId = delBtn.dataset.deleteChallenge;
      if (confirm('Delete this custom savings challenge?')) {
        challengeState.customChallenges = (challengeState.customChallenges || []).filter(c => c.id !== delId);
        if (challengeState.completed && challengeState.completed[delId]) {
          delete challengeState.completed[delId];
        }
        saveChallengeData();
        renderChallengesUI();
      }
      return;
    }

    // Toggle challenge completion
    const btn = e.target.closest('[data-challenge-id]');
    if (!btn) return;

    const id = btn.dataset.challengeId;
    if (!challengeState.completed) challengeState.completed = {};

    const currentlyDone = !!challengeState.completed[id];
    if (!currentlyDone) {
      challengeState.completed[id] = true;
      challengeState.streak = (challengeState.streak || 0) + 1;
    } else {
      challengeState.completed[id] = false;
      challengeState.streak = Math.max((challengeState.streak || 0) - 1, 0);
    }

    saveChallengeData();
    renderChallengesUI();
  });

  // Add New Challenge Form Submission
  if (newChallengeForm) {
    newChallengeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('newChallengeTitle');
      const savingsInput = document.getElementById('newChallengeSavings');
      const iconInput = document.getElementById('newChallengeIcon');
      const descInput = document.getElementById('newChallengeDesc');

      const title = titleInput.value.trim();
      const savings = Number(savingsInput.value);
      const icon = iconInput.value;
      const desc = descInput.value.trim();

      if (!title || isNaN(savings) || savings <= 0 || !desc) {
        alert('Please fill out all fields with valid values.');
        return;
      }

      if (!challengeState.customChallenges) {
        challengeState.customChallenges = [];
      }

      const customId = `ch_custom_${Date.now()}`;
      challengeState.customChallenges.push({
        id: customId,
        title,
        savings,
        icon,
        desc
      });

      saveChallengeData();
      renderChallengesUI();
      newChallengeForm.reset();

      // Scroll smoothly to the newly added challenge card
      setTimeout(() => {
        const newCard = challengeList.lastElementChild;
        if (newCard) {
          newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    });
  }

  // Add Challenge button focus & validation
  if (addChallengeBtn && newChallengeForm) {
    addChallengeBtn.addEventListener('click', () => {
      const titleInput = document.getElementById('newChallengeTitle');
      if (titleInput && !titleInput.value.trim()) {
        addChallengeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        titleInput.focus();
      }
    });
  }

  // Reset challenges
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset challenges completion and streak count? (Your custom challenges will be kept)')) {
        challengeState.streak = 0;
        challengeState.completed = {};
        saveChallengeData();
        renderChallengesUI();
      }
    });
  }

  renderChallengesUI();
}

// ==========================================================================
// 6. Navigation & Sidebar Controller
// ==========================================================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.content-section');
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  const sectionTitles = {
    'expense': 'Daily Expense Tracker',
    'savings': 'Small Savings, Big Future',
    'invest': 'Investment & Virtual Trading',
    'challenges': 'Savings Challenges'
  };

  const showSection = (targetSec) => {
    if (!targetSec || !document.getElementById(`${targetSec}-section`)) return;

    // Update sidebar active class
    navItems.forEach(item => {
      const isActive = item.dataset.section === targetSec;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Update breadcrumb
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = sectionTitles[targetSec] || 'Dashboard';
    }

    // Switch active section with a smooth transition.
    sections.forEach(sec => {
      const isTarget = sec.id === `${targetSec}-section`;
      sec.classList.toggle('hidden', !isTarget);
      sec.classList.toggle('active', isTarget);
      sec.setAttribute('aria-hidden', String(!isTarget));
    });

    // If mobile sidebar is open, close it after a selection.
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebarToggle?.setAttribute('aria-expanded', 'false');
    }

    // Re-trigger layout/chart updates if necessary.
    if (targetSec === 'expense') renderCategoryChart();
  };

  navItems.forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-current', item.classList.contains('active') ? 'page' : 'false');
    item.addEventListener('click', () => showSection(item.dataset.section));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showSection(item.dataset.section);
      }
    });
  });

  // Collapsible Money Management Accordion Toggle
  const moneySectionToggle = document.getElementById('moneyManagementSectionToggle');
  const moneyNavMenu = document.getElementById('moneyManagementNavMenu');
  if (moneySectionToggle && moneyNavMenu) {
    const setMenuCollapsed = (isCollapsed) => {
      moneyNavMenu.classList.toggle('collapsed', isCollapsed);
      moneySectionToggle.classList.toggle('collapsed', isCollapsed);
      moneySectionToggle.setAttribute('title', isCollapsed ? 'Expand Money Management' : 'Minimize Money Management');
      moneySectionToggle.setAttribute('aria-expanded', String(!isCollapsed));
    };

    setMenuCollapsed(false);
    moneySectionToggle.addEventListener('click', () => setMenuCollapsed(!moneyNavMenu.classList.contains('collapsed')));
    moneySectionToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setMenuCollapsed(!moneyNavMenu.classList.contains('collapsed'));
      }
    });
  }

  // Sidebar Minimize / Maximize (Collapse Button)
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn && sidebar) {
    const setSidebarCollapsed = (isMin) => {
      sidebar.classList.toggle('collapsed', isMin);
      collapseBtn.setAttribute('title', isMin ? 'Maximize Sidebar' : 'Minimize Sidebar');
      collapseBtn.setAttribute('aria-label', isMin ? 'Maximize Sidebar' : 'Minimize Sidebar');
      collapseBtn.setAttribute('aria-pressed', String(isMin));
      if (isMin) {
        sidebar.style.width = '';
      } else {
        const savedWidth = localStorage.getItem('student_sidebar_width') || '270px';
        sidebar.style.width = savedWidth;
      }
    };

    setSidebarCollapsed(false);
    collapseBtn.addEventListener('click', () => setSidebarCollapsed(!sidebar.classList.contains('collapsed')));
  }

  // Adjustable / Resizable Sidebar Handle
  const resizer = document.getElementById('sidebarResizer');
  if (resizer && sidebar) {
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizer.classList.add('active');
      sidebar.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvt) => {
        if (!isResizing) return;
        const newWidth = Math.min(Math.max(moveEvt.clientX, 180), 450);
        sidebar.style.width = newWidth + 'px';
        if (sidebar.classList.contains('collapsed') && newWidth > 110) {
          sidebar.classList.remove('collapsed');
          collapseBtn?.setAttribute('title', 'Minimize Sidebar');
          collapseBtn?.setAttribute('aria-label', 'Minimize Sidebar');
          collapseBtn?.setAttribute('aria-pressed', 'false');
        }
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        resizer.classList.remove('active');
        sidebar.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        localStorage.setItem('student_sidebar_width', sidebar.style.width);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Restore saved width if available
    const savedWidth = localStorage.getItem('student_sidebar_width');
    if (savedWidth) {
      sidebar.style.width = savedWidth;
    }
  }

  // Mobile sidebar toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.setAttribute('aria-expanded', 'false');
    sidebarToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebarToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 7. Master Initialization
// ==========================================================================
function initApp() {
  if (window.parent !== window) {
    document.body.classList.add('embedded-money');
  }
  initNavigation();
  loadExpenses();
  initExpenseForm();
  refreshExpenseSection();
  initSavingsSection();
  initInvestSection();
  initChallengesSection();
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'campus360:money-section') return;

  const section = event.data.section;
  document.querySelector(`.nav-item[data-section="${section}"]`)?.click();
});

window.addEventListener('DOMContentLoaded', initApp);
