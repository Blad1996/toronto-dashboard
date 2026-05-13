// ============================================
// CHARTS
// ============================================

function updateCharts() {
  updateSegmentChart();
  updateTimelineChart();
}

function updateSegmentChart() {
  const ctx    = document.getElementById('segmentChart').getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const text   = isDark ? '#f7fafc' : '#2d3748';

  if (window.segmentChart instanceof Chart) window.segmentChart.destroy();

  const counts = {
    premium:  filteredLeads.filter(l => l.segment === 'premium').length,
    standard: filteredLeads.filter(l => l.segment === 'standard').length,
    new:      filteredLeads.filter(l => l.segment === 'new').length,
  };

  window.segmentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Premium', 'Standard', 'New'],
      datasets: [{
        data: [counts.premium, counts.standard, counts.new],
        backgroundColor: ['#fbbf24', '#60a5fa', '#9ca3af'],
        borderWidth: 2,
        borderColor: isDark ? '#2d3748' : '#ffffff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: text, padding: 16, font: { size: 13 } },
        },
        title: {
          display: true,
          text: 'Leads by Segment',
          font: { size: 16, weight: '600' },
          color: text,
          padding: { bottom: 16 },
        },
      },
    },
  });
}

function updateTimelineChart() {
  const ctx    = document.getElementById('timelineChart').getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const text   = isDark ? '#f7fafc' : '#2d3748';
  const grid   = isDark ? '#4a5568' : '#e2e8f0';
  const tick   = isDark ? '#a0aec0' : '#718096';

  if (window.timelineChart instanceof Chart) window.timelineChart.destroy();

  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const byDay = last30.map(date =>
    filteredLeads.filter(l => l.created_at && l.created_at.startsWith(date)).length
  );

  window.timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last30.map(d => {
        const dt = new Date(d + 'T00:00:00');
        return `${dt.getMonth() + 1}/${dt.getDate()}`;
      }),
      datasets: [{
        label: 'Leads Processed',
        data: byDay,
        borderColor: '#4299e1',
        backgroundColor: 'rgba(66,153,225,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Leads Over Time (Last 30 Days)',
          font: { size: 16, weight: '600' },
          color: text,
          padding: { bottom: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: tick, stepSize: 1 },
          grid: { color: grid },
        },
        x: {
          ticks: { color: tick, maxRotation: 45, minRotation: 45 },
          grid: { color: grid },
        },
      },
    },
  });
}
