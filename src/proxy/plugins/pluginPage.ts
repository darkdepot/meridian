/**
 * Plugins management page.
 * Shows all discovered plugins with their status, hooks, adapters, and errors.
 * Fetches /plugins/list client-side for live data; supports reload via POST /plugins/reload.
 */

import { profileBarCss, profileBarHtml, profileBarJs, themeCss } from "../../telemetry/profileBar"
import { themeHeadHtml } from "../../telemetry/theme"

export const pluginPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plugins · Meridian</title>
${themeHeadHtml}
<style>
  ${themeCss}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-width: 0; min-height: 100vh; overflow-x: hidden; font-family: var(--font-sans);
    background: var(--canvas); color: var(--text-primary); line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  button { font: inherit; }
  .container { width: min(100%, 1080px); margin: 0 auto; padding: 40px 32px 72px; }
  .page-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px; margin-bottom: 28px; }
  .eyebrow { color: var(--text-tertiary); font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
  .page-header h1 { margin-top: 6px; font-size: 30px; line-height: 1.15; letter-spacing: -.025em; font-weight: 650; text-wrap: balance; }
  .tagline { max-width: 620px; margin-top: 8px; color: var(--text-secondary); font-size: 14px; text-wrap: pretty; }
  .header-actions { display: flex; min-width: 0; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; }
  .reload-btn { min-height: 44px; padding: 0 16px; border: 1px solid var(--line); border-radius: 8px; color: var(--brand); background: var(--panel-inset); font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; transition: color 140ms cubic-bezier(.23,1,.32,1), background-color 140ms cubic-bezier(.23,1,.32,1), border-color 140ms cubic-bezier(.23,1,.32,1), transform 100ms cubic-bezier(.23,1,.32,1); }
  .reload-btn:hover { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 8%, var(--panel-inset)); }
  .reload-btn:active { transform: scale(.97); }
  .reload-btn:disabled { opacity: .55; cursor: default; transform: none; }
  .reload-status { min-height: 20px; color: var(--success); font-size: 11px; opacity: 0; transition: opacity 160ms cubic-bezier(.23,1,.32,1); }
  .reload-status.show { opacity: 1; }
  .reload-status.error { color: var(--danger); }
  button:focus-visible, summary:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

  .hero-panel { margin-bottom: 24px; overflow: hidden; border: 1px solid var(--line-soft); border-radius: 12px; background: var(--panel); }
  .hero-row-top { display: grid; grid-template-columns: 1.25fr repeat(4, minmax(0, 1fr)); }
  .hero-metric { min-width: 0; padding: 18px; }
  .hero-metric + .hero-metric { border-left: 1px solid var(--line-soft); }
  .hero-primary { background: var(--panel-raised); }
  .hero-num { color: var(--text-primary); font-family: var(--font-mono); font-size: 21px; font-weight: 650; line-height: 1.1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .hero-primary .hero-num { color: var(--brand); font-size: 34px; }
  .hero-num.hero-err { color: var(--danger); }
  .hero-sub { margin-left: 4px; color: var(--text-tertiary); font-size: 14px; font-weight: 450; }
  .hero-unit { margin-left: 3px; color: var(--text-tertiary); font-size: 11px; font-weight: 450; }
  .hero-lbl { margin-top: 7px; color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: .09em; text-transform: uppercase; }
  .hero-row-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px 20px; padding: 12px 18px; border-top: 1px solid var(--line-soft); color: var(--text-secondary); font-size: 11px; }
  .hero-status { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
  .status-summary { display: inline-flex; align-items: center; gap: 7px; }
  .status-summary::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--line-strong); }
  .status-summary-active::before { background: var(--success); }
  .status-summary-error::before { background: var(--danger); }
  .hero-status strong { color: var(--text-primary); font-family: var(--font-mono); font-weight: 650; }
  .hero-busiest { min-width: 0; color: var(--text-tertiary); overflow-wrap: anywhere; }
  .hero-busiest strong { color: var(--brand); font-family: var(--font-mono); font-weight: 600; }
  .hero-busiest-count { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }

  .plugin-list { display: grid; gap: 12px; }
  .plugin-card { position: relative; min-width: 0; overflow: hidden; padding: 20px; border: 1px solid var(--line-soft); border-radius: 12px; background: var(--panel); }
  .plugin-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: transparent; }
  .plugin-card.status-active::before { background: var(--brand); }
  .plugin-card.status-error { border-color: color-mix(in srgb, var(--danger) 35%, var(--line-soft)); }
  .plugin-card.status-error::before { background: var(--danger); }
  .plugin-card-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .plugin-name { margin-right: 3px; font-size: 17px; font-weight: 650; letter-spacing: -.01em; overflow-wrap: anywhere; }
  .plugin-version { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
  .status-badge { display: inline-flex; min-height: 24px; align-items: center; gap: 7px; padding: 3px 8px; border: 1px solid var(--line-soft); border-radius: 6px; color: var(--text-tertiary); background: var(--panel-inset); font-size: 10px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
  .status-badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .badge-active { color: var(--success); border-color: color-mix(in srgb, var(--success) 30%, var(--line-soft)); }
  .badge-error { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 30%, var(--line-soft)); }
  .plugin-description { max-width: 720px; margin-bottom: 14px; color: var(--text-secondary); font-size: 12px; text-wrap: pretty; }
  .plugin-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .meta-item { min-width: 0; padding: 10px 12px; border-radius: 8px; background: var(--panel-inset); }
  .meta-label { display: block; margin-bottom: 3px; color: var(--text-tertiary); font-size: 9px; font-weight: 650; letter-spacing: .09em; text-transform: uppercase; }
  .meta-value { display: block; min-width: 0; color: var(--text-secondary); font-family: var(--font-mono); font-size: 10px; overflow-wrap: anywhere; }

  .plugin-stats { margin-top: 12px; overflow: hidden; border-top: 1px solid var(--line-soft); }
  .plugin-stats summary { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; color: var(--text-secondary); font-size: 11px; font-weight: 600; list-style: none; }
  .plugin-stats summary::-webkit-details-marker { display: none; }
  .plugin-stats summary::after { content: "+"; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 16px; }
  .plugin-stats[open] summary::after { content: "−"; }
  .stats-summary-meta { margin-left: auto; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; font-weight: 450; }
  .stats-content { padding-bottom: 2px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; }
  .stat-cell { min-width: 0; padding: 10px 12px; border: 1px solid var(--line-soft); border-radius: 8px; background: var(--panel-inset); }
  .stat-num { color: var(--text-primary); font-family: var(--font-mono); font-size: 17px; font-weight: 650; line-height: 1.2; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .stat-num.stat-err, .hook-err { color: var(--danger); }
  .stat-unit { margin-left: 2px; color: var(--text-tertiary); font-size: 10px; font-weight: 450; }
  .stat-lbl { margin-top: 4px; color: var(--text-tertiary); font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .stats-breakdown { display: flex; flex-wrap: wrap; gap: 6px; }
  .hook-pill { max-width: 100%; padding: 5px 8px; border-radius: 6px; color: var(--text-tertiary); background: var(--panel-inset); font-family: var(--font-mono); font-size: 10px; overflow-wrap: anywhere; }
  .hook-pill strong { color: var(--text-primary); font-weight: 650; }
  .plugin-stats-empty { margin-top: 12px; padding: 10px 12px; border-radius: 8px; color: var(--text-tertiary); background: var(--panel-inset); font-size: 11px; }
  .plugin-error-box { margin-top: 12px; padding: 11px 12px; border-left: 2px solid var(--danger); background: color-mix(in srgb, var(--danger) 8%, var(--panel)); color: var(--danger); font-family: var(--font-mono); font-size: 10px; overflow-wrap: anywhere; }

  .empty-state { padding: 52px 24px; border: 1px solid var(--line-soft); border-radius: 12px; color: var(--text-secondary); background: var(--panel); text-align: center; }
  .empty-state h2 { margin-bottom: 8px; color: var(--text-primary); font-size: 18px; font-weight: 650; }
  .empty-state p { font-size: 12px; line-height: 1.7; }
  .empty-state code { padding: 2px 6px; border-radius: 4px; color: var(--brand); background: var(--panel-inset); font-family: var(--font-mono); font-size: 11px; overflow-wrap: anywhere; }
  .loading-state { padding: 48px 20px; color: var(--text-secondary); text-align: center; font-size: 13px; }

  @media (max-width: 820px) {
    .hero-row-top { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero-primary { grid-column: 1 / -1; }
    .hero-metric:nth-child(2), .hero-metric:nth-child(4) { border-left: 0; }
    .hero-metric { border-top: 1px solid var(--line-soft); }
    .hero-primary { border-top: 0; }
  }
  @media (max-width: 620px) {
    .container { padding: 28px 20px 56px; }
    .page-header { grid-template-columns: 1fr; gap: 16px; }
    .header-actions { justify-content: flex-start; }
    .plugin-meta { grid-template-columns: 1fr; }
  }
  @media (max-width: 420px) {
    .container { padding-right: 16px; padding-left: 16px; }
    .page-header h1 { font-size: 26px; }
    .header-actions { display: grid; grid-template-columns: 1fr; width: 100%; }
    .reload-btn { width: 100%; }
    .plugin-card { padding: 16px; }
    .hero-metric { padding: 15px; }
    .hero-num { font-size: 18px; }
    .hero-primary .hero-num { font-size: 30px; }
    .hero-row-bottom { align-items: flex-start; }
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .reload-btn, .reload-status { transition-duration: 0ms; }
  }
` + profileBarCss + `
</style>
</head>
<body>
` + profileBarHtml + `
<main class="container">
  <header class="page-header">
    <div>
      <div class="eyebrow">Extension runtime</div>
      <h1>Plugins</h1>
      <p class="tagline">Inspect the request and response transforms currently loaded into Meridian.</p>
    </div>
    <div class="header-actions">
      <button class="reload-btn" id="reloadBtn" type="button" onclick="reloadPlugins()">Reload plugins</button>
      <span class="reload-status" id="reloadStatus" role="status" aria-live="polite"></span>
    </div>
  </header>

  <div id="content"><div class="loading-state">Loading plugins…</div></div>
</main>

<script>
function esc(s) {
  if (s == null) return '';
  var d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function escAttr(s) {
  return esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var expandedPlugins = Object.create(null);

async function loadPlugins() {
  try {
    var res = await fetch('/plugins/list');
    if (!res.ok) throw new Error('Could not load plugins');
    var data = await res.json();
    render(data.plugins || []);
  } catch {
    document.getElementById('content').innerHTML =
      '<div class="empty-state"><h2>Could not load plugins</h2><p>Check that Meridian is running, then try reloading.</p></div>';
  }
}

async function reloadPlugins() {
  var btn = document.getElementById('reloadBtn');
  var status = document.getElementById('reloadStatus');
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = 'Reloading…';
  status.className = 'reload-status';
  status.textContent = '';
  try {
    var res = await fetch('/plugins/reload', { method: 'POST' });
    var data = await res.json();
    if (data.success) {
      status.textContent = 'Reloaded';
      status.className = 'reload-status show';
    } else {
      status.textContent = data.error || 'Reload failed';
      status.className = 'reload-status show error';
    }
    await loadPlugins();
  } catch {
    status.textContent = 'Reload failed';
    status.className = 'reload-status show error';
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = 'Reload plugins';
    setTimeout(function() { status.className = 'reload-status'; }, 3000);
  }
}

function render(plugins) {
  if (!plugins.length) {
    document.getElementById('content').innerHTML =
      '<div class="empty-state">'
      + '<h2>No plugins found</h2>'
      + '<p>Place <code>.ts</code> or <code>.js</code> files in <code>~/.config/meridian/plugins/</code>, then reload.</p>'
      + '</div>';
    return;
  }

  var active = plugins.filter(function(p) { return p.status === 'active'; }).length;
  var disabled = plugins.filter(function(p) { return p.status === 'disabled'; }).length;
  var errors = plugins.filter(function(p) { return p.status === 'error'; }).length;

  var totalCalls = 0, totalErrors = 0, totalMs = 0, lastSeen = 0;
  var busiestName = null, busiestCount = 0;
  for (var i = 0; i < plugins.length; i++) {
    var p = plugins[i];
    if (p.status !== 'active' || !p.stats) continue;
    var pluginCalls = 0, pluginErrors = 0, pluginMs = 0;
    var hookNames = Object.keys(p.stats.hooks || {});
    for (var j = 0; j < hookNames.length; j++) {
      var h = p.stats.hooks[hookNames[j]];
      pluginCalls += h.invocations || 0;
      pluginErrors += h.errors || 0;
      pluginMs += h.totalMs || 0;
    }
    totalCalls += pluginCalls;
    totalErrors += pluginErrors;
    totalMs += pluginMs;
    if (p.stats.lastInvokedAt && p.stats.lastInvokedAt > lastSeen) lastSeen = p.stats.lastInvokedAt;
    if (pluginCalls > busiestCount) {
      busiestCount = pluginCalls;
      busiestName = p.name;
    }
  }
  var aggAvg = totalCalls > 0 ? (totalMs / totalCalls).toFixed(2) : '0.00';

  var html = '<section class="hero-panel" aria-label="Plugin runtime overview">';
  html += '<div class="hero-row-top">';
  html += '<div class="hero-metric hero-primary">'
    + '<div class="hero-num">' + active + '<span class="hero-sub">/ ' + plugins.length + '</span></div>'
    + '<div class="hero-lbl">Active plugins</div></div>';
  html += '<div class="hero-metric"><div class="hero-num">' + totalCalls.toLocaleString() + '</div><div class="hero-lbl">Invocations</div></div>';
  html += '<div class="hero-metric"><div class="hero-num ' + (totalErrors > 0 ? 'hero-err' : '') + '">' + totalErrors.toLocaleString() + '</div><div class="hero-lbl">Errors</div></div>';
  html += '<div class="hero-metric"><div class="hero-num">' + aggAvg + '<span class="hero-unit">ms</span></div><div class="hero-lbl">Avg latency</div></div>';
  html += '<div class="hero-metric"><div class="hero-num">' + (lastSeen ? formatRelative(lastSeen) : '—') + '</div><div class="hero-lbl">Last request</div></div>';
  html += '</div>';

  html += '<div class="hero-row-bottom"><div class="hero-status">';
  html += '<span class="status-summary status-summary-active"><strong>' + active + '</strong> active</span>';
  if (disabled) html += '<span class="status-summary"><strong>' + disabled + '</strong> disabled</span>';
  if (errors) html += '<span class="status-summary status-summary-error"><strong>' + errors + '</strong> error' + (errors !== 1 ? 's' : '') + '</span>';
  html += '</div>';
  if (busiestName) {
    html += '<div class="hero-busiest">Busiest <strong>' + esc(busiestName) + '</strong> <span class="hero-busiest-count">' + busiestCount.toLocaleString() + ' calls</span></div>';
  }
  html += '</div></section><div class="plugin-list">';

  for (var k = 0; k < plugins.length; k++) {
    var plugin = plugins[k];
    var statusClass = plugin.status === 'active' ? 'badge-active' : plugin.status === 'error' ? 'badge-error' : 'badge-disabled';
    html += '<article class="plugin-card status-' + esc(plugin.status) + '">';
    html += '<div class="plugin-card-header">';
    html += '<h2 class="plugin-name">' + esc(plugin.name) + '</h2>';
    if (plugin.version) html += '<span class="plugin-version">v' + esc(plugin.version) + '</span>';
    html += '<span class="status-badge ' + statusClass + '">' + esc(plugin.status) + '</span>';
    html += '</div>';

    if (plugin.description) html += '<p class="plugin-description">' + esc(plugin.description) + '</p>';

    html += '<div class="plugin-meta">';
    var hooks = (plugin.hooks && plugin.hooks.length) ? plugin.hooks.join(', ') : '\u2014';
    html += '<div class="meta-item"><span class="meta-label">Hooks</span><span class="meta-value">' + esc(hooks) + '</span></div>';
    var adapters = (plugin.adapters && plugin.adapters.length) ? plugin.adapters.join(', ') : 'All adapters';
    html += '<div class="meta-item"><span class="meta-label">Adapters</span><span class="meta-value">' + esc(adapters) + '</span></div>';
    html += '</div>';

    if (plugin.status === 'active' && plugin.stats) html += renderStats(plugin.stats, plugin.name);
    if (plugin.status === 'error' && plugin.error) html += '<div class="plugin-error-box">' + esc(plugin.error) + '</div>';
    html += '</article>';
  }

  html += '</div>';
  document.getElementById('content').innerHTML = html;
  document.querySelectorAll('.plugin-stats').forEach(function(details) {
    details.addEventListener('toggle', function() {
      expandedPlugins[details.dataset.plugin] = details.open;
    });
  });
}

function renderStats(s, pluginName) {
  var hooks = s.hooks || {};
  var hookNames = Object.keys(hooks);
  if (hookNames.length === 0 && !s.lastInvokedAt && !s.lastError) {
    return '<div class="plugin-stats-empty">No invocations yet. Send a request to see counters.</div>';
  }

  var totalInvocations = 0, totalErrors = 0, totalMs = 0;
  for (var i = 0; i < hookNames.length; i++) {
    var h = hooks[hookNames[i]];
    totalInvocations += h.invocations || 0;
    totalErrors += h.errors || 0;
    totalMs += h.totalMs || 0;
  }

  var hasSavedState = Object.prototype.hasOwnProperty.call(expandedPlugins, pluginName);
  var isOpen = hasSavedState ? expandedPlugins[pluginName] : totalErrors > 0 || Boolean(s.lastError);
  var html = '<details class="plugin-stats" data-plugin="' + escAttr(pluginName) + '"' + (isOpen ? ' open' : '') + '>';
  html += '<summary>Invocation activity <span class="stats-summary-meta">' + totalInvocations.toLocaleString() + ' calls</span></summary>';
  html += '<div class="stats-content"><div class="stats-grid">';
  html += '<div class="stat-cell"><div class="stat-num">' + totalInvocations + '</div><div class="stat-lbl">Calls</div></div>';
  html += '<div class="stat-cell"><div class="stat-num ' + (totalErrors > 0 ? 'stat-err' : '') + '">' + totalErrors + '</div><div class="stat-lbl">Errors</div></div>';
  var avgMs = totalInvocations > 0 ? (totalMs / totalInvocations).toFixed(2) : '0.00';
  html += '<div class="stat-cell"><div class="stat-num">' + avgMs + '<span class="stat-unit">ms</span></div><div class="stat-lbl">Average</div></div>';
  if (s.lastInvokedAt) html += '<div class="stat-cell"><div class="stat-num">' + formatRelative(s.lastInvokedAt) + '</div><div class="stat-lbl">Last seen</div></div>';
  html += '</div>';

  if (hookNames.length > 0) {
    html += '<div class="stats-breakdown">';
    for (var j = 0; j < hookNames.length; j++) {
      var name = hookNames[j];
      var hd = hooks[name];
      html += '<span class="hook-pill">'
        + esc(name) + ': <strong>' + (hd.invocations || 0) + '</strong>'
        + (hd.errors > 0 ? ' <span class="hook-err">(' + hd.errors + ' err)</span>' : '')
        + '</span>';
    }
    html += '</div>';
  }

  if (s.lastError) {
    html += '<div class="plugin-error-box">Last error in <strong>' + esc(s.lastError.hook) + '</strong> '
      + formatRelative(s.lastError.at) + ': ' + esc(s.lastError.message) + '</div>';
  }

  html += '</div></details>';
  return html;
}

function formatRelative(ts) {
  var diffMs = Date.now() - ts;
  if (diffMs < 0) return 'just now';
  var s = Math.floor(diffMs / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return s + 's ago';
  var m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  var h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

setInterval(function() {
  if (document.visibilityState === 'visible') loadPlugins();
}, 3000);

loadPlugins();
` + profileBarJs + `
</script>
</body>
</html>`
