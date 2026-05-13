// ============================================
// APP INITIALIZATION & EVENT BINDINGS
// ============================================

// ---- Toast ----

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- Theme ----

const themeToggle = document.getElementById('themeToggle');
const savedTheme  = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  if (filteredLeads.length > 0) updateCharts();
});

// ---- Buttons ----

document.getElementById('applyFilters').addEventListener('click', applyFilters);
document.getElementById('resetFilters').addEventListener('click', resetFilters);
document.getElementById('exportCSV').addEventListener('click', exportToCSV);
document.getElementById('refreshBtn').addEventListener('click', loadDashboard);

// ---- Live search (debounced) ----

let searchTimer;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 350);
});

document.getElementById('whatsappSearch').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(filterWhatsappQueue, 300);
});

// ---- Auto-refresh ----

setInterval(() => { if (currentUser) loadDashboard(); }, CONFIG.REFRESH_INTERVAL);

// ---- Boot ----

checkAuth();
