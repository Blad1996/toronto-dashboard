// ============================================
// DATA LOADING, FILTERS & ACTIONS
// ============================================

let allLeads            = [];
let filteredLeads       = [];
let allWhatsappQueue    = [];
let filteredWhatsappQueue = [];

async function loadDashboard() {
  try {
    document.getElementById('loading').style.display    = 'block';
    document.getElementById('dashboard').style.display  = 'none';
    document.getElementById('errorBanner').style.display = 'none';

    const [leadsRes, waRes] = await Promise.all([
      supabaseClient.from(CONFIG.LEADS_TABLE)
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseClient.from(CONFIG.WHATSAPP_TABLE)
        .select('*')
        .eq('status', 'pending')
        .order('opportunity_score', { ascending: false }),
    ]);

    if (leadsRes.error) throw leadsRes.error;
    if (waRes.error)    throw waRes.error;

    allLeads             = leadsRes.data || [];
    filteredLeads        = [...allLeads];
    allWhatsappQueue     = waRes.data || [];
    filteredWhatsappQueue = [...allWhatsappQueue];

    renderDashboard();

    document.getElementById('loading').style.display   = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('lastUpdate').textContent  = new Date().toLocaleTimeString();

  } catch (err) {
    console.error('Dashboard load error:', err);
    document.getElementById('loading').style.display = 'none';
    showErrorBanner('Failed to load data: ' + err.message);
  }
}

function renderDashboard() {
  updateKPIs();
  updateCharts();
  renderWhatsAppTable(filteredWhatsappQueue);
  renderEmailTable(filteredLeads.filter(l => l.email_sent));

  document.getElementById('queueCount').textContent = filteredWhatsappQueue.length;
  document.getElementById('emailCount').textContent = filteredLeads.filter(l => l.email_sent).length;
}

function updateKPIs() {
  const total     = filteredLeads.length;
  const emails    = filteredLeads.filter(l => l.email_sent).length;
  const contacted = filteredLeads.filter(l => l.status === 'contacted').length;
  const premium   = filteredLeads.filter(l => l.segment === 'premium').length;
  const rate      = total > 0 ? Math.round((emails / total) * 100) : 0;

  document.getElementById('kpi-total').textContent     = total.toLocaleString();
  document.getElementById('kpi-emails').textContent    = emails.toLocaleString();
  document.getElementById('kpi-whatsapp').textContent  = allWhatsappQueue.length.toLocaleString();
  document.getElementById('kpi-premium').textContent   = premium.toLocaleString();
  document.getElementById('kpi-contacted').textContent = contacted.toLocaleString();
  document.getElementById('kpi-conversion').textContent = rate + '%';
}

function showErrorBanner(message) {
  document.getElementById('errorText').textContent    = message;
  document.getElementById('errorBanner').style.display = 'flex';
}

// ---- Filters ----

function applyFilters() {
  const search  = document.getElementById('searchInput').value.toLowerCase().trim();
  const segment = document.getElementById('segmentFilter').value;
  const status  = document.getElementById('statusFilter').value;
  const from    = document.getElementById('dateFrom').value;
  const to      = document.getElementById('dateTo').value;

  filteredLeads = allLeads.filter(lead => {
    if (search) {
      const match =
        (lead.name    || '').toLowerCase().includes(search) ||
        (lead.email   || '').toLowerCase().includes(search) ||
        (lead.phone   || '').includes(search);
      if (!match) return false;
    }
    if (segment && lead.segment !== segment) return false;
    if (status  && lead.status  !== status)  return false;
    if (from    && lead.created_at < from)   return false;
    if (to      && lead.created_at > to + 'T23:59:59') return false;
    return true;
  });

  renderDashboard();
  showToast(`Filters applied — ${filteredLeads.length} leads found`);
}

function resetFilters() {
  ['searchInput', 'dateFrom', 'dateTo'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['segmentFilter', 'statusFilter'].forEach(id => {
    document.getElementById(id).value = '';
  });

  filteredLeads         = [...allLeads];
  filteredWhatsappQueue = [...allWhatsappQueue];
  renderDashboard();
  showToast('Filters cleared');
}

function filterWhatsappQueue() {
  const search = document.getElementById('whatsappSearch').value.toLowerCase().trim();
  filteredWhatsappQueue = allWhatsappQueue.filter(lead =>
    !search || (lead.name || '').toLowerCase().includes(search)
  );
  renderWhatsAppTable(filteredWhatsappQueue);
  document.getElementById('queueCount').textContent = filteredWhatsappQueue.length;
}

// ---- WhatsApp action ----

async function markAsContacted(id, name) {
  try {
    const { error } = await supabaseClient
      .from(CONFIG.WHATSAPP_TABLE)
      .update({ status: 'contacted', contacted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    showToast(`✓ ${name} marked as contacted`);
    loadDashboard();
  } catch (err) {
    showToast('⚠️ Error: ' + err.message);
  }
}

// ---- CSV Export ----

function exportToCSV() {
  if (filteredLeads.length === 0) { showToast('No data to export'); return; }

  const headers = ['Name', 'Score', 'Segment', 'Phone', 'Email', 'Website', 'Rating', 'Reviews', 'Status', 'Created'];

  const rows = filteredLeads.map(l => [
    l.name          ?? '',
    l.opportunity_score ?? '',
    l.segment       ?? '',
    l.phone         ?? '',
    l.email         ?? '',
    l.website       ?? '',
    l.google_rating ?? '',
    l.reviews_count ?? '',
    l.status        ?? '',
    l.created_at    ?? '',
  ]);

  let csv = headers.join(',') + '\n';
  csv += rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `leads-export-${new Date().toISOString().split('T')[0]}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`✓ Exported ${filteredLeads.length} leads`);
}
