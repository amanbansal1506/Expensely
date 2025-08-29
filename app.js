// Expense Tracker App
// Data Model: { id, type: 'income' | 'expense', date: 'YYYY-MM-DD', description, category, amount: number }

const form = document.getElementById('txn-form');
const typeEl = document.getElementById('type');
const dateEl = document.getElementById('date');
const descEl = document.getElementById('description');
const catEl = document.getElementById('category');
const amtEl = document.getElementById('amount');
const editIdEl = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');

const filterTypeEl = document.getElementById('filter-type');
const filterCatEl = document.getElementById('filter-category');
const searchEl = document.getElementById('search-text');

const tbody = document.getElementById('txn-tbody');
const emptyState = document.getElementById('empty-state');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');

const exportBtn = document.getElementById('export-btn');
const importInput = document.getElementById('import-input');
const clearBtn = document.getElementById('clear-btn');

// Chart
const chartCtx = document.getElementById('expense-chart');
let expenseChart = null;

// Utilities
const currency = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function getStore() {
  try {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  } catch {
    return [];
  }
}
function setStore(data) {
  localStorage.setItem('transactions', JSON.stringify(data));
}

let transactions = getStore();

function validate() {
  const errors = {};
  if (!typeEl.value) errors.type = 'Select type';
  if (!dateEl.value) errors.date = 'Pick a date';
  if (!descEl.value.trim()) errors.description = 'Enter description';
  if (!catEl.value) errors.category = 'Select category';
  const amount = parseFloat(amtEl.value);
  if (isNaN(amount) || amount <= 0) errors.amount = 'Enter amount > 0';

  // Render errors
  ['type','date','description','category','amount'].forEach(key => {
    const span = document.querySelector(`.error[data-for="${key}"]`);
    span.textContent = errors[key] || '';
  });

  return Object.keys(errors).length === 0;
}

function resetForm() {
  form.reset();
  editIdEl.value = '';
  submitBtn.textContent = 'Add Transaction';
}

function upsertTransaction(e) {
  e.preventDefault();
  if (!validate()) return;

  const tx = {
    id: editIdEl.value || uid(),
    type: typeEl.value,
    date: dateEl.value,
    description: descEl.value.trim(),
    category: catEl.value,
    amount: parseFloat(amtEl.value)
  };

  const existingIdx = transactions.findIndex(t => t.id === tx.id);
  if (existingIdx >= 0) {
    transactions[existingIdx] = tx;
  } else {
    transactions.push(tx);
  }
  setStore(transactions);
  resetForm();
  render();
}

function editTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;
  editIdEl.value = tx.id;
  typeEl.value = tx.type;
  dateEl.value = tx.date;
  descEl.value = tx.description;
  catEl.value = tx.category;
  amtEl.value = tx.amount;
  submitBtn.textContent = 'Update Transaction';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  setStore(transactions);
  render();
}

function clearAll() {
  if (!confirm('This will delete all transactions. Continue?')) return;
  transactions = [];
  setStore(transactions);
  render();
}

function filtersApply(list) {
  const typeVal = filterTypeEl.value;
  const catVal = filterCatEl.value;
  const q = searchEl.value.trim().toLowerCase();

  return list.filter(t => {
    if (typeVal !== 'all' && t.type !== typeVal) return false;
    if (catVal !== 'all' && t.category !== catVal) return false;
    if (q && !t.description.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderTable(list) {
  tbody.innerHTML = '';
  if (list.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  list.sort((a,b) => (a.date < b.date ? 1 : -1)); // newest first

  for (const t of list) {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.textContent = t.date;

    const tdType = document.createElement('td');
    tdType.textContent = t.type === 'income' ? 'Income' : 'Expense';

    const tdDesc = document.createElement('td');
    tdDesc.textContent = t.description;

    const tdCat = document.createElement('td');
    tdCat.textContent = t.category;

    const tdAmt = document.createElement('td');
    tdAmt.className = 'right';
    tdAmt.textContent = currency(t.amount * (t.type === 'expense' ? -1 : 1));
    tdAmt.style.color = t.type === 'expense' ? '#f87171' : '#34d399';

    const tdAct = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn';
    editBtn.onclick = () => editTransaction(t.id);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn danger';
    delBtn.onclick = () => deleteTransaction(t.id);
    const wrap = document.createElement('div');
    wrap.className = 'actions-col';
    wrap.append(editBtn, delBtn);
    tdAct.append(wrap);

    tr.append(tdDate, tdType, tdDesc, tdCat, tdAmt, tdAct);
    tbody.appendChild(tr);
  }
}

function renderSummary(list) {
  const income = list.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = list.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const net = income - expense;

  totalIncomeEl.textContent = currency(income);
  totalExpenseEl.textContent = currency(expense);
  netBalanceEl.textContent = currency(net);
  netBalanceEl.style.color = net >= 0 ? '#22c55e' : '#f87171';
}

function renderChart(list) {
  const expenseOnly = list.filter(t => t.type === 'expense');
  const byCat = {};
  for (const t of expenseOnly) {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  }
  const labels = Object.keys(byCat);
  const data = Object.values(byCat);

  if (expenseChart) {
    expenseChart.destroy();
  }
  expenseChart = new Chart(chartCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e5e7eb' } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${currency(ctx.parsed)}` } }
      }
    }
  });
}

function render() {
  const filtered = filtersApply(transactions);
  renderTable(filtered);
  renderSummary(transactions);
  renderChart(transactions);
}

// Export / Import
function exportJSON() {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error('Invalid file');
      // Basic shape validation
      for (const t of data) {
        if (!t.id || !t.type || !t.date || !t.description || !t.category || typeof t.amount !== 'number') {
          throw new Error('Invalid data format');
        }
      }
      transactions = data;
      setStore(transactions);
      render();
    } catch (e) {
      alert('Could not import: ' + e.message);
    }
  };
  reader.readAsText(file);
}

// Wire up events
form.addEventListener('submit', upsertTransaction);
resetBtn.addEventListener('click', resetForm);
[filterTypeEl, filterCatEl].forEach(el => el.addEventListener('change', render));
searchEl.addEventListener('input', render);
exportBtn.addEventListener('click', exportJSON);
importInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) importJSON(file);
});
clearBtn.addEventListener('click', clearAll);

// Initialize default date to today
dateEl.valueAsDate = new Date();

// Initial render
render();
