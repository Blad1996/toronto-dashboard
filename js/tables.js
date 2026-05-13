// ============================================
// TABLE RENDERING WITH PAGINATION
// ============================================

const TABLE_STATE = {
  whatsapp: { data: [], page: 1 },
  email:    { data: [], page: 1 },
};

// Cache for complex lead data (avoids escaping issues in onclick)
const LEAD_CACHE = {};

// ---- WhatsApp Table ----

function renderWhatsAppTable(data, page = 1) {
  TABLE_STATE.whatsapp = { data, page };
  data.forEach(l => { LEAD_CACHE[l.id] = l; });

  const container    = document.getElementById('whatsappTable');
  const paginationEl = document.getElementById('whatsappPagination');

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>No pending WhatsApp messages</p></div>';
    paginationEl.innerHTML = '';
    return;
  }

  const start    = (page - 1) * CONFIG.ITEMS_PER_PAGE;
  const pageData = data.slice(start, start + CONFIG.ITEMS_PER_PAGE);

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Business Name</th>
          <th>Phone</th>
          <th>Score</th>
          <th>Segment</th>
          <th>Channel</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${pageData.map((lead, i) => `
          <tr>
            <td class="row-num">${start + i + 1}</td>
            <td><strong>${esc(lead.name)}</strong></td>
            <td>
              <a href="tel:${esc(lead.phone)}" class="phone-link">${esc(lead.phone)}</a>
              <button class="btn-icon" onclick="copyText('${esc(lead.phone)}')" title="Copy phone">📋</button>
            </td>
            <td><span class="score-badge">${lead.opportunity_score ?? '—'}</span></td>
            <td><span class="segment-badge segment-${lead.segment}">${lead.segment}</span></td>
            <td>${esc(lead.suggested_channel || 'N/A')}</td>
            <td class="actions-cell">
              <button class="btn btn-primary btn-sm" onclick="sendWhatsApp(${lead.id})">💬 Send</button>
              <button class="btn btn-success btn-sm" onclick="markAsContactedById(${lead.id})">✅ Done</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  renderPagination(paginationEl, data.length, page, 'whatsapp');
}

// ---- Email Table ----

function renderEmailTable(data, page = 1) {
  TABLE_STATE.email = { data, page };

  const container    = document.getElementById('emailTable');
  const paginationEl = document.getElementById('emailPagination');

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📧</div><p>No emails sent yet</p></div>';
    paginationEl.innerHTML = '';
    return;
  }

  const start    = (page - 1) * CONFIG.ITEMS_PER_PAGE;
  const pageData = data.slice(start, start + CONFIG.ITEMS_PER_PAGE);

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Business Name</th>
          <th>Email</th>
          <th>Score</th>
          <th>Segment</th>
          <th>Template</th>
          <th>Sent</th>
        </tr>
      </thead>
      <tbody>
        ${pageData.map((lead, i) => `
          <tr>
            <td class="row-num">${start + i + 1}</td>
            <td><strong>${esc(lead.name)}</strong></td>
            <td>${esc(lead.email || 'N/A')}</td>
            <td><span class="score-badge">${lead.opportunity_score ?? '—'}</span></td>
            <td><span class="segment-badge segment-${lead.segment}">${lead.segment}</span></td>
            <td>${esc(lead.email_template_used || 'N/A')}</td>
            <td>${formatDate(lead.email_sent_at)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  renderPagination(paginationEl, data.length, page, 'email');
}

// ---- Pagination ----

function renderPagination(container, total, currentPage, tableType) {
  const totalPages = Math.ceil(total / CONFIG.ITEMS_PER_PAGE);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const fn    = tableType === 'whatsapp' ? 'goToWhatsappPage' : 'goToEmailPage';
  const start = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE + 1;
  const end   = Math.min(currentPage * CONFIG.ITEMS_PER_PAGE, total);

  let html = `<div class="page-info">Showing ${start}–${end} of ${total}</div><div class="page-btns">`;

  if (currentPage > 1)
    html += `<button class="page-btn" onclick="${fn}(${currentPage - 1})">← Prev</button>`;

  const s = Math.max(1, currentPage - 2);
  const e = Math.min(totalPages, s + 4);
  for (let p = s; p <= e; p++)
    html += `<button class="page-btn${p === currentPage ? ' active' : ''}" onclick="${fn}(${p})">${p}</button>`;

  if (currentPage < totalPages)
    html += `<button class="page-btn" onclick="${fn}(${currentPage + 1})">Next →</button>`;

  html += '</div>';
  container.innerHTML = html;
}

function goToWhatsappPage(page) {
  renderWhatsAppTable(TABLE_STATE.whatsapp.data, page);
  document.getElementById('whatsappTable').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToEmailPage(page) {
  renderEmailTable(TABLE_STATE.email.data, page);
  document.getElementById('emailTable').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Helpers ----

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date)) return 'N/A';
  const diffH = Math.floor((Date.now() - date) / 3600000);
  if (diffH < 1)  return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffH < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('✓ Copied to clipboard'));
}

// ---- Lead actions (use LEAD_CACHE) ----

function sendWhatsApp(id) {
  const lead = LEAD_CACHE[id];
  if (!lead) return;
  const phone   = lead.phone.replace(/[^0-9+]/g, '');
  const message = encodeURIComponent(lead.whatsapp_message || '');
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

function markAsContactedById(id) {
  const lead = LEAD_CACHE[id];
  if (!lead) return;
  markAsContacted(id, lead.name);
}
