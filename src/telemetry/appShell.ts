import { brandLockupHtml } from "./brand"

const icon = (path: string): string => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="${path}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const navItems = [
  { href: "/", id: "nav-home", label: "Home", icon: icon("M4 10.5 12 4l8 6.5V20H4v-9.5ZM9 20v-6h6v6") },
  { href: "/telemetry", id: "nav-telemetry", label: "Telemetry", icon: icon("M4 19V9m5 10V5m6 14v-7m5 7V3") },
  { href: "/profiles", id: "nav-profiles", label: "Profiles", icon: icon("M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20m6-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7-1a3 3 0 0 0 0-6m3 16v-1.5a3.5 3.5 0 0 0-2.3-3.3") },
  { href: "/plugins", id: "nav-plugins", label: "Plugins", icon: icon("M8 3v4m8-4v4M5 11h14v3a7 7 0 0 1-14 0v-3Zm7 10v-4") },
  { href: "/settings", id: "nav-settings", label: "Settings", icon: icon("M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-2.1 1.1 1.9-2 3.4-2.2-.4a8 8 0 0 1-2.1 1.2l-.8 2.1H9.5l-.8-2.1a8 8 0 0 1-2.1-1.2l-2.2.4-2-3.4 1.1-1.9a8 8 0 0 1 0-2.8L2.4 8.7l2-3.4 2.2.4a8 8 0 0 1 2.1-1.2l.8-2.1h4l.8 2.1a8 8 0 0 1 2.1 1.2l2.2-.4 2 3.4-1.1 1.9a8 8 0 0 1 0 2.8Z") },
]

export const appShellCss = `
  body { padding-left: 224px; }
  .meridian-app-shell, .meridian-app-shell * { box-sizing: border-box; }
  .meridian-app-shell {
    position: fixed; inset: 0 auto 0 0; z-index: 1000;
    width: 224px; min-height: 100vh;
    display: flex; flex-direction: column;
    padding: 22px 16px 16px;
    background: var(--canvas);
    border-right: 1px solid var(--line-soft);
    color: var(--text-primary);
  }
  .meridian-shell-header { display: flex; align-items: center; justify-content: space-between; min-height: 36px; }
  .meridian-shell-brand {
    display: inline-flex; align-items: center; gap: 9px;
    color: var(--text-primary); text-decoration: none;
    min-height: 44px; border-radius: 8px;
  }
  .meridian-shell-brand .meridian-brand-mark { width: 25px; height: 25px; flex: 0 0 auto; }
  .meridian-wordmark { font-size: 20px; font-weight: 650; letter-spacing: -0.025em; }
  .meridian-shell-menu {
    display: none; width: 44px; height: 44px; place-items: center;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--panel); color: var(--text-primary); cursor: pointer;
  }
  .meridian-shell-menu svg { width: 20px; height: 20px; }
  .meridian-shell-drawer { display: flex; flex-direction: column; flex: 1; min-height: 0; }
  .meridian-shell-nav { display: grid; gap: 4px; margin-top: 30px; }
  .meridian-shell-nav a {
    display: flex; align-items: center; gap: 11px;
    min-height: 42px; padding: 0 11px;
    color: var(--text-secondary); text-decoration: none;
    border-radius: 8px; border: 1px solid transparent;
    font-size: 13px; font-weight: 560;
    transition: color 140ms ease, background 140ms ease, border-color 140ms ease;
  }
  .meridian-shell-nav a:hover { color: var(--text-primary); background: var(--panel); border-color: var(--line-soft); }
  .meridian-shell-nav a.active { color: var(--brand-ink); background: var(--brand-soft); }
  .meridian-shell-nav svg { width: 18px; height: 18px; flex: 0 0 auto; }
  .meridian-shell-footer { display: grid; gap: 12px; margin-top: auto; padding-top: 20px; }
  .meridian-shell-profile {
    display: none; gap: 7px; padding: 11px;
    background: var(--panel); border: 1px solid var(--line-soft); border-radius: 10px;
  }
  .meridian-shell-profile.visible { display: grid; }
  .meridian-shell-profile label, .meridian-shell-kicker {
    color: var(--text-tertiary); font: 600 9px/1.2 var(--font-mono);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .meridian-profile-row { display: flex; align-items: center; gap: 6px; }
  .meridian-shell-profile select {
    width: 100%; min-width: 0; min-height: 38px; padding: 7px 28px 7px 9px;
    appearance: none; border: 1px solid var(--line); border-radius: 7px;
    background: var(--panel-inset); color: var(--text-primary);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%238A928A' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    font: 500 11px/1.2 var(--font-mono); cursor: pointer;
  }
  .meridian-profile-type { flex: 0 0 auto; color: var(--text-tertiary); font: 500 9px/1 var(--font-mono); text-transform: uppercase; }
  .meridian-profile-status { min-height: 13px; color: var(--success); font: 500 10px/1.3 var(--font-mono); opacity: 0; }
  .meridian-profile-status.show { opacity: 1; }
  .meridian-shell-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .meridian-shell-health { display: inline-flex; align-items: center; gap: 7px; color: var(--text-tertiary); font: 500 10px/1.3 var(--font-mono); }
  .meridian-health-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-tertiary); }
  .meridian-health-dot.healthy { background: var(--success); }
  .meridian-health-dot.degraded { background: var(--warning); }
  .meridian-health-dot.unhealthy { background: var(--danger); }
  .meridian-theme-toggle {
    display: inline-grid; width: 38px; height: 38px; place-items: center;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--panel); color: var(--text-secondary); cursor: pointer;
  }
  .meridian-theme-toggle:hover { color: var(--text-primary); border-color: var(--line-strong); }
  .meridian-theme-toggle svg { width: 17px; height: 17px; }
  .meridian-theme-mode-icon { display: none; line-height: 0; }
  .meridian-theme-toggle[data-mode="system"] .meridian-theme-light-icon,
  .meridian-theme-toggle[data-mode="light"] .meridian-theme-dark-icon,
  .meridian-theme-toggle[data-mode="dark"] .meridian-theme-system-icon { display: inline-block; }
  .meridian-shell-endpoint { overflow: hidden; color: var(--text-tertiary); font: 500 9px/1.4 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .meridian-shell-overlay { display: none; }
  .meridian-sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }

  @media (max-width: 760px) {
    body { padding-left: 0; padding-top: 64px; }
    .meridian-app-shell {
      inset: 0 0 auto; width: 100%; min-height: 64px; height: 64px;
      padding: 9px 14px; flex-direction: row; align-items: center;
      border-right: 0; border-bottom: 1px solid var(--line-soft);
    }
    .meridian-shell-header { width: 100%; }
    .meridian-shell-menu { display: grid; }
    .meridian-shell-drawer {
      position: fixed; inset: 64px 0 auto; z-index: 1001;
      max-height: calc(100vh - 64px); overflow: auto;
      display: flex; padding: 12px 14px 18px;
      background: var(--canvas); border-bottom: 1px solid var(--line);
      box-shadow: var(--shadow-raised);
      opacity: 0; visibility: hidden; transform: translateY(-8px);
      transition: opacity 150ms ease, transform 150ms ease, visibility 150ms;
    }
    .meridian-app-shell.open .meridian-shell-drawer { opacity: 1; visibility: visible; transform: translateY(0); }
    .meridian-shell-nav { margin-top: 0; }
    .meridian-shell-nav a { min-height: 46px; font-size: 14px; }
    .meridian-shell-footer { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line-soft); }
    .meridian-shell-profile select { min-height: 44px; }
    .meridian-theme-toggle { width: 44px; height: 44px; }
    .meridian-shell-overlay {
      position: fixed; inset: 64px 0 0; z-index: 999;
      background: rgba(7, 9, 7, 0.46); border: 0;
    }
    .meridian-shell-overlay.visible { display: block; }
  }

  @media (prefers-reduced-motion: reduce) {
    .meridian-shell-drawer, .meridian-shell-nav a { transition: none; }
  }
`

const menuIcon = icon("M4 7h16M4 12h16M4 17h16")
const lightThemeIcon = icon("M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z")
const darkThemeIcon = icon("M20 15.4A8 8 0 0 1 8.6 4a8 8 0 1 0 11.4 11.4Z")
const systemThemeIcon = icon("M4 5h16v11H4V5Zm5 15h6m-3-4v4")

export const appShellHtml = `
<aside class="meridian-app-shell" id="meridianAppShell">
  <div class="meridian-shell-header">
    <a class="meridian-shell-brand" href="/" aria-label="Meridian home">${brandLockupHtml}</a>
    <button class="meridian-shell-menu" id="meridianMenuButton" type="button" aria-controls="meridianShellDrawer" aria-expanded="false">
      <span class="meridian-sr-only">Open navigation</span>${menuIcon}
    </button>
  </div>
  <div class="meridian-shell-drawer" id="meridianShellDrawer">
    <nav class="meridian-shell-nav" aria-label="Primary navigation">
      ${navItems.map((item) => `<a href="${item.href}" id="${item.id}">${item.icon}<span>${item.label}</span></a>`).join("\n      ")}
    </nav>
    <div class="meridian-shell-footer">
      <div class="meridian-shell-profile" id="meridianProfileBar">
        <label for="meridianProfileSelect">Active profile</label>
        <div class="meridian-profile-row">
          <select id="meridianProfileSelect" aria-label="Active profile"></select>
          <span class="meridian-profile-type" id="meridianProfileType"></span>
        </div>
        <span class="meridian-profile-status" id="meridianProfileStatus" aria-live="polite">Profile switched</span>
      </div>
      <div class="meridian-shell-meta">
        <span class="meridian-shell-health"><span class="meridian-health-dot" id="meridianHealthDot"></span><span id="meridianHealthText">Checking proxy</span></span>
        <button class="meridian-theme-toggle" id="meridianThemeToggle" type="button" aria-label="Use light theme" title="Use light theme">
          <span class="meridian-theme-mode-icon meridian-theme-light-icon">${lightThemeIcon}</span>
          <span class="meridian-theme-mode-icon meridian-theme-dark-icon">${darkThemeIcon}</span>
          <span class="meridian-theme-mode-icon meridian-theme-system-icon">${systemThemeIcon}</span>
        </button>
      </div>
      <div class="meridian-shell-endpoint" id="meridianShellEndpoint"></div>
    </div>
  </div>
</aside>
<button class="meridian-shell-overlay" id="meridianShellOverlay" type="button" aria-label="Close navigation"></button>
`

export const appShellJs = `
(function() {
  var shell = document.getElementById('meridianAppShell');
  var drawer = document.getElementById('meridianShellDrawer');
  var menuButton = document.getElementById('meridianMenuButton');
  var overlay = document.getElementById('meridianShellOverlay');
  var profileBar = document.getElementById('meridianProfileBar');
  var profileSelect = document.getElementById('meridianProfileSelect');
  var profileType = document.getElementById('meridianProfileType');
  var profileStatus = document.getElementById('meridianProfileStatus');
  var healthDot = document.getElementById('meridianHealthDot');
  var healthText = document.getElementById('meridianHealthText');
  var themeToggle = document.getElementById('meridianThemeToggle');
  var endpoint = document.getElementById('meridianShellEndpoint');
  var statusTimeout;

  function esc(value) {
    var node = document.createElement('div');
    node.textContent = String(value == null ? '' : value);
    return node.innerHTML;
  }

  function closeMenu() {
    shell.classList.remove('open');
    overlay.classList.remove('visible');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', function() {
    var opening = !shell.classList.contains('open');
    shell.classList.toggle('open', opening);
    overlay.classList.toggle('visible', opening);
    menuButton.setAttribute('aria-expanded', opening ? 'true' : 'false');
  });
  overlay.addEventListener('click', closeMenu);
  drawer.addEventListener('click', function(event) {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeMenu();
  });

  var path = location.pathname;
  document.querySelectorAll('.meridian-shell-nav a').forEach(function(link) {
    var href = link.getAttribute('href');
    var active = href === '/' ? path === '/' : path === href || path.indexOf(href + '/') === 0;
    if (active) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  function currentTheme() {
    try { return localStorage.getItem('meridian-theme') || 'system'; }
    catch (error) { return 'system'; }
  }

  function applyTheme(mode) {
    if (mode === 'light' || mode === 'dark') document.documentElement.setAttribute('data-theme', mode);
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('meridian-theme', mode); }
    catch (error) { themeToggle.dataset.storage = 'unavailable'; }
    var next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    var label = next === 'system' ? 'Use system theme' : 'Use ' + next + ' theme';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.dataset.mode = mode;
  }

  applyTheme(currentTheme());
  themeToggle.addEventListener('click', function() {
    var mode = currentTheme();
    applyTheme(mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system');
  });

  endpoint.textContent = location.origin.replace(/^https?:\\/\\//, '');

  function loadHealth() {
    fetch('/health').then(function(response) {
      return response.json();
    }).then(function(data) {
      var status = data.status || 'unknown';
      healthDot.className = 'meridian-health-dot ' + (status === 'healthy' ? 'healthy' : status === 'degraded' ? 'degraded' : 'unhealthy');
      healthText.textContent = status === 'healthy'
        ? 'Proxy online'
        : status === 'degraded'
          ? 'Proxy degraded'
          : data.auth && data.auth.loggedIn === false
            ? 'Login required'
            : 'Proxy unavailable';
      healthText.title = data.error || '';
    }).catch(function(error) {
      healthDot.className = 'meridian-health-dot unhealthy';
      healthText.textContent = 'Proxy unavailable';
      healthText.title = error.message;
    });
  }

  function loadProfiles() {
    fetch('/profiles/list').then(function(response) {
      if (!response.ok) throw new Error('Profile request failed');
      return response.json();
    }).then(function(data) {
      if (!data.profiles || data.profiles.length === 0) {
        profileBar.classList.remove('visible');
        return;
      }
      profileBar.classList.add('visible');
      var current = data.profiles.find(function(profile) { return profile.isActive; });
      profileSelect.innerHTML = data.profiles.map(function(profile) {
        return '<option value="' + esc(profile.id) + '"' + (profile.isActive ? ' selected' : '') + '>' + esc(profile.id) + '</option>';
      }).join('');
      profileType.textContent = current ? current.type : '';
    }).catch(function(error) {
      profileBar.classList.remove('visible');
      profileBar.title = error.message;
    });
  }

  profileSelect.addEventListener('change', function() {
    fetch('/profiles/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: profileSelect.value })
    }).then(function(response) {
      if (!response.ok) throw new Error('Profile switch failed');
      return response.json();
    }).then(function(data) {
      if (!data.success) throw new Error(data.error || 'Profile switch failed');
      profileStatus.textContent = 'Profile switched';
      profileStatus.classList.add('show');
      clearTimeout(statusTimeout);
      statusTimeout = setTimeout(function() { profileStatus.classList.remove('show'); }, 2200);
      loadProfiles();
      document.dispatchEvent(new CustomEvent('meridian:profile-changed', { detail: { profile: profileSelect.value } }));
    }).catch(function(error) {
      profileStatus.textContent = error.message;
      profileStatus.classList.add('show');
    });
  });

  loadHealth();
  loadProfiles();
  document.addEventListener('meridian:auth-changed', function() {
    loadHealth();
    loadProfiles();
  });
  setInterval(loadHealth, 15000);
  setInterval(loadProfiles, 15000);
})();
`
