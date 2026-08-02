const STORAGE_KEY = 'storboard.theme';

let currentTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
if (!THEMES[currentTheme]) currentTheme = DEFAULT_THEME;

function formatBytes(b, wholeThreshold) {
  if (b === 0) return '0 B';
  const u = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
  return (b / Math.pow(1024, i)).toFixed(i < wholeThreshold ? 0 : 1) + ' ' + u[i];
}

function formatTime(ts) {
  return new Date(ts * 1000).toLocaleTimeString();
}

function utilLabel(pct) {
  if (pct < 50) return ['Healthy', 'util-low'];
  if (pct < 80) return ['Elevated', 'util-mid'];
  return ['Critical', 'util-high'];
}

function driveIdentity(theme, index) {
  if (theme.genericNaming) {
    return {
      name: `Drive ${index + 1}`,
      subtitle: theme.driveSubtitle,
      icon: theme.driveIcon,
    };
  }
  const pool = theme.names;
  const [name, subtitle, icon] = pool[index % pool.length];
  return { name, subtitle, icon };
}

// ------------------------------------------------------------------ THEME

function applyTheme(id) {
  const theme = THEMES[id];
  if (!theme) return;
  currentTheme = id;
  localStorage.setItem(STORAGE_KEY, id);

  const root = document.documentElement.style;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.setProperty('--' + key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
  }
  root.setProperty('--radius', theme.radius);
  root.setProperty('--font-display', theme.fonts.display);
  root.setProperty('--font-body', theme.fonts.body);

  document.getElementById('headerSymbol').textContent = theme.header.symbol;
  document.getElementById('headerTitle').textContent = theme.header.title;
  document.getElementById('headerSubtitle').innerHTML = theme.header.subtitle;
  document.getElementById('sectionTitleText').textContent = theme.sectionTitle;
  document.getElementById('footerText').textContent = theme.footer;
  document.title = theme.header.title;

  renderBackdrop(theme.background);
  renderThemePanel();
  fetchDisks();
}

function renderThemePanel() {
  const toggle = document.getElementById('themeToggleLabel');
  toggle.textContent = THEMES[currentTheme].label;

  const groups = {};
  for (const id of THEME_ORDER) {
    const t = THEMES[id];
    (groups[t.group] = groups[t.group] || []).push(id);
  }

  const panel = document.getElementById('themePanel');
  panel.innerHTML = Object.entries(groups).map(([group, ids]) => `
    <div class="theme-group-label">${group}</div>
    ${ids.map(id => {
      const t = THEMES[id];
      return `<div class="theme-option${id === currentTheme ? ' active' : ''}" data-theme-id="${id}">
        <span class="swatch" style="background:${t.colors.accent}"></span>
        <span>${t.label}</span>
      </div>`;
    }).join('')}
  `).join('');

  panel.querySelectorAll('.theme-option').forEach(el => {
    el.addEventListener('click', () => {
      applyTheme(el.dataset.themeId);
      closeThemePanel();
    });
  });
}

function closeThemePanel() {
  document.getElementById('themePanel').classList.remove('open');
  document.getElementById('themeToggleBtn').classList.remove('open');
}

// --------------------------------------------------------------- BACKDROP

function renderBackdrop(kind) {
  const c = document.getElementById('backdrop');
  c.innerHTML = '';
  if (kind === 'stars') {
    for (let i = 0; i < 100; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.width = s.style.height = (Math.random() * 2 + 1) + 'px';
      s.style.setProperty('--dur', (Math.random() * 3 + 2) + 's');
      s.style.animationDelay = Math.random() * 5 + 's';
      c.appendChild(s);
    }
    for (let i = 0; i < 2; i++) {
      const ss = document.createElement('div');
      ss.className = 'shooting-star';
      ss.style.top = (Math.random() * 30 + 5) + '%';
      ss.style.animationDelay = (Math.random() * 10 + i * 6) + 's';
      c.appendChild(ss);
    }
  } else if (kind === 'snow') {
    for (let i = 0; i < 40; i++) {
      const f = document.createElement('div');
      f.className = 'snowflake';
      f.textContent = '❄';
      f.style.left = Math.random() * 100 + '%';
      f.style.fontSize = (Math.random() * 10 + 8) + 'px';
      f.style.animationDuration = (Math.random() * 8 + 6) + 's';
      f.style.animationDelay = Math.random() * 8 + 's';
      c.appendChild(f);
    }
  } else if (kind === 'clouds') {
    for (let i = 0; i < 6; i++) {
      const cl = document.createElement('div');
      cl.className = 'cloud';
      cl.textContent = '☁️';
      cl.style.top = (Math.random() * 70 + 5) + '%';
      cl.style.animationDuration = (Math.random() * 40 + 40) + 's';
      cl.style.animationDelay = -(Math.random() * 40) + 's';
      cl.style.fontSize = (Math.random() * 2 + 2) + 'rem';
      c.appendChild(cl);
    }
  } else if (kind === 'halftone') {
    for (let i = 0; i < 60; i++) {
      const d = document.createElement('div');
      d.className = 'halftone-dot';
      const size = Math.random() * 6 + 2;
      d.style.width = d.style.height = size + 'px';
      d.style.left = Math.random() * 100 + '%';
      d.style.top = Math.random() * 100 + '%';
      c.appendChild(d);
    }
  } else if (kind === 'spotlight') {
    for (let i = 0; i < 2; i++) {
      const b = document.createElement('div');
      b.className = 'spotlight-beam';
      b.style.left = (i === 0 ? '10%' : '60%');
      b.style.transform = `rotate(${i === 0 ? -12 : 10}deg)`;
      c.appendChild(b);
    }
  } else if (kind === 'candles') {
    for (let i = 0; i < 14; i++) {
      const fl = document.createElement('div');
      fl.className = 'candle-flame';
      fl.textContent = '\u{1F56F}️';
      fl.style.left = Math.random() * 100 + '%';
      fl.style.top = Math.random() * 100 + '%';
      fl.style.animationDelay = Math.random() * 2 + 's';
      c.appendChild(fl);
    }
  }
}

// ------------------------------------------------------------------ RENDER

function renderOverall(data) {
  const theme = THEMES[currentTheme];
  const section = document.getElementById('overallSection');
  const disks = data.disks || [];
  if (disks.length === 0) { section.innerHTML = ''; return; }

  const total = disks.reduce((s, d) => s + d.total, 0);
  const used = disks.reduce((s, d) => s + d.used, 0);
  const free = disks.reduce((s, d) => s + d.free, 0);
  const pct = total > 0 ? (used / total) * 100 : 0;

  section.innerHTML = `<div class="overall-card">
    <div class="overall-header">
      <div class="overall-title-group">
        <div class="overall-icon">${theme.header.icon}</div>
        <div>
          <div class="overall-title">${theme.overallTitle}</div>
          <div class="overall-subtitle">${formatTime(data.timestamp)}</div>
        </div>
      </div>
      <div class="drive-count-badge">${disks.length} drive${disks.length !== 1 ? 's' : ''} &middot; Watching</div>
    </div>
    <div class="overall-stats">
      <div class="overall-stat">
        <div class="overall-stat-label">Total</div>
        <div class="overall-stat-value total">${formatBytes(total, 3)}</div>
      </div>
      <div class="overall-stat">
        <div class="overall-stat-label">Used</div>
        <div class="overall-stat-value used">${formatBytes(used, 3)}</div>
      </div>
      <div class="overall-stat">
        <div class="overall-stat-label">Free</div>
        <div class="overall-stat-value free">${formatBytes(free, 3)}</div>
      </div>
      <div class="overall-stat">
        <div class="overall-stat-label">Usage</div>
        <div class="overall-stat-value total">${pct.toFixed(1)}%</div>
      </div>
    </div>
    <div class="overall-progress-wrap">
      <div class="overall-progress-label">
        <span>${formatBytes(used, 3)} used</span>
        <span>${formatBytes(free, 3)} free</span>
      </div>
      <div class="overall-progress-container">
        <div class="overall-progress-bar" style="width: ${pct}%"></div>
      </div>
    </div>
  </div>`;
}

function renderDisks(data) {
  const theme = THEMES[currentTheme];
  const grid = document.getElementById('diskGrid');
  renderOverall(data);

  if (!data.disks || data.disks.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">${theme.emptyIcon}</div>${theme.emptyText}</div>`;
    return;
  }

  grid.innerHTML = data.disks.map(d => {
    const pct = d.percent;
    const { name, subtitle, icon } = driveIdentity(theme, d.index);
    const [ul, ulCls] = utilLabel(pct);
    const extraCls = pct >= 80 ? ' disk-card-util-high' : pct >= 50 ? ' disk-card-util-mid' : '';
    return `<div class="disk-card${extraCls}">
      <div class="drive-header">
        <div class="drive-name-row">
          <div class="drive-avatar">${icon}</div>
          <div>
            <div class="drive-name">${name}</div>
            <div class="drive-subtitle">${subtitle}</div>
          </div>
        </div>
      </div>
      <div class="mount-badge">${d.mount}</div>
      <div class="space-stats">
        <div class="stat">
          <div class="stat-label">Total</div>
          <div class="stat-value">${formatBytes(d.total, 2)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Used</div>
          <div class="stat-value used">${formatBytes(d.used, 2)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Free</div>
          <div class="stat-value free">${formatBytes(d.free, 2)}</div>
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${pct}%"></div>
      </div>
      <div class="progress-proportion">
        <span>${pct.toFixed(1)}% used</span>
        <span>${(100 - pct).toFixed(1)}% free</span>
      </div>
      <div class="card-footer">
        <span class="filesystem-type">${d.fstype}</span>
        <span class="util-level ${ulCls}">${ul}</span>
      </div>
    </div>`;
  }).join('');
}

async function fetchDisks() {
  const theme = THEMES[currentTheme];
  try {
    const r = await fetch('/api/disks');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    renderDisks(data);
  } catch (e) {
    document.getElementById('diskGrid').innerHTML =
      `<div class="error-state"><div class="icon">⚠️</div>${theme.errorText}: ${e.message}</div>`;
  }
}

// -------------------------------------------------------------------- INIT

document.getElementById('themeToggleBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('themePanel').classList.toggle('open');
  document.getElementById('themeToggleBtn').classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!document.getElementById('themeSwitcher').contains(e.target)) closeThemePanel();
});

applyTheme(currentTheme);
setInterval(fetchDisks, 3000);
