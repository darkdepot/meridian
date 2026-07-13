/**
 * Profile management page.
 * Shows all configured profiles, their auth status, and setup instructions.
 */

import { profileBarCss, profileBarHtml, profileBarJs, themeCss } from "./profileBar"
import { themeHeadHtml } from "./theme"
import { WINDOW_LABELS } from "./profileUsage"

export const profilePageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Profiles · Meridian</title>
${themeHeadHtml}
<style>
  ${themeCss}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-width: 0; min-height: 100vh; overflow-x: hidden;
    font-family: var(--font-sans); background: var(--canvas); color: var(--text-primary);
    line-height: 1.5; -webkit-font-smoothing: antialiased;
  }
  button, input, select { font: inherit; }
  button, summary, select { -webkit-tap-highlight-color: transparent; }
  .container { width: min(100%, 1080px); margin: 0 auto; padding: 40px 32px 64px; }
  .page-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: end; margin-bottom: 32px; }
  .eyebrow, .section-title { color: var(--text-tertiary); font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin-top: 6px; font-size: 30px; line-height: 1.15; letter-spacing: -.025em; font-weight: 650; text-wrap: balance; }
  .subtitle { max-width: 620px; margin-top: 8px; color: var(--text-secondary); font-size: 14px; text-wrap: pretty; }
  .header-note { max-width: 240px; color: var(--text-tertiary); font-size: 12px; text-align: right; }
  .section { margin-bottom: 32px; }
  .section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
  .section-count { color: var(--text-tertiary); font-family: var(--font-mono); font-size: 11px; }

  .profile-list { display: grid; gap: 12px; }
  .profile-card {
    position: relative; min-width: 0; overflow: hidden; padding: 20px;
    background: var(--panel); border: 1px solid var(--line-soft); border-radius: 12px;
    transition: border-color 160ms cubic-bezier(.23,1,.32,1), background-color 160ms cubic-bezier(.23,1,.32,1);
  }
  .profile-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: transparent; }
  .profile-card.active { border-color: var(--line-strong); }
  .profile-card.active::before { background: var(--brand); }
  .profile-card-header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .profile-name { margin-right: 4px; font-size: 17px; font-weight: 650; letter-spacing: -.01em; overflow-wrap: anywhere; }
  .profile-badge, .status-badge {
    display: inline-flex; align-items: center; min-height: 24px; padding: 3px 8px;
    border: 1px solid var(--line-soft); border-radius: 6px; color: var(--text-tertiary);
    background: var(--panel-inset); font-size: 10px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase;
  }
  .badge-active { border-color: color-mix(in srgb, var(--brand) 30%, var(--line-soft)); color: var(--brand); background: color-mix(in srgb, var(--brand) 10%, var(--panel)); }
  .status-authenticated { color: var(--success); }
  .status-authenticated::before, .status-attention::before { content: ""; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: currentColor; }
  .status-attention { color: var(--warning); }
  .profile-body { display: grid; grid-template-columns: minmax(190px, .72fr) minmax(0, 1.6fr); gap: 24px; align-items: start; }
  .profile-body-single { grid-template-columns: 1fr; }
  .profile-details { display: grid; grid-template-columns: minmax(72px, auto) minmax(0, 1fr); gap: 8px 16px; font-size: 12px; }
  .detail-label { color: var(--text-tertiary); }
  .detail-value { min-width: 0; color: var(--text-secondary); font-family: var(--font-mono); overflow-wrap: anywhere; }
  .status-ok { color: var(--success); }
  .status-err { color: var(--danger); }
  .profile-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .switch-btn, .copy-btn {
    min-height: 44px; border-radius: 8px; cursor: pointer;
    transition: color 140ms cubic-bezier(.23,1,.32,1), border-color 140ms cubic-bezier(.23,1,.32,1), background-color 140ms cubic-bezier(.23,1,.32,1), transform 100ms cubic-bezier(.23,1,.32,1);
  }
  .switch-btn { padding: 0 16px; color: var(--brand); background: var(--panel-inset); border: 1px solid var(--line); font-size: 12px; font-weight: 600; }
  .switch-btn:hover { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 8%, var(--panel-inset)); }
  .switch-btn:active, .copy-btn:active { transform: scale(.97); }
  .switch-btn:disabled { opacity: .55; cursor: default; transform: none; }
  .switch-btn.current { color: var(--text-tertiary); border-color: var(--line-soft); }
  button:focus-visible, summary:focus-visible, select:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

  .auth-warning { margin-top: 14px; padding: 10px 12px; border-left: 2px solid var(--warning); background: color-mix(in srgb, var(--warning) 8%, var(--panel)); color: var(--text-secondary); font-size: 12px; }
  .auth-warning strong { color: var(--warning); }
  .login-command { display: flex; min-width: 0; align-items: stretch; gap: 6px; margin-top: 14px; }
  .command-label { align-self: center; color: var(--text-tertiary); font-size: 11px; }
  .copy-cmd, .mono, code { font-family: var(--font-mono); }
  .copy-cmd { min-width: 0; overflow: hidden; padding: 12px; border: 1px solid var(--line-soft); border-radius: 8px; background: var(--panel-inset); color: var(--text-secondary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .copy-btn { display: inline-grid; place-items: center; flex: 0 0 44px; width: 44px; color: var(--text-secondary); background: var(--panel-inset); border: 1px solid var(--line-soft); }
  .copy-btn:hover { border-color: var(--brand); color: var(--brand); }
  .copy-btn.copied { color: var(--success); border-color: var(--success); }

  .usage-section { min-width: 0; padding-left: 24px; border-left: 1px solid var(--line-soft); }
  .usage-section-title { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; }
  .usage-as-of { color: var(--text-tertiary); font-size: 10px; font-weight: 400; letter-spacing: 0; text-transform: none; }
  .usage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr)); gap: 8px; }
  .usage-card, .usage-extra { min-width: 0; padding: 11px 12px; border: 1px solid var(--line-soft); border-radius: 8px; background: var(--panel-inset); }
  .usage-row, .usage-extra-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .usage-row { margin-bottom: 8px; }
  .usage-label { min-width: 0; color: var(--text-secondary); font-size: 11px; font-weight: 550; overflow-wrap: anywhere; }
  .usage-pct { color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; }
  .usage-bar { height: 4px; margin-bottom: 6px; overflow: hidden; border-radius: 2px; background: var(--line); }
  .usage-fill { height: 100%; background: var(--success); transition: width 240ms cubic-bezier(.23,1,.32,1); }
  .usage-card.status-warn .usage-pct, .usage-extra.status-warn .usage-pct { color: var(--warning); }
  .usage-card.status-warn .usage-fill, .usage-extra.status-warn .usage-fill { background: var(--warning); }
  .usage-card.status-high .usage-pct, .usage-extra.status-high .usage-pct { color: var(--danger); }
  .usage-card.status-high .usage-fill, .usage-extra.status-high .usage-fill { background: var(--danger); }
  .usage-reset { color: var(--text-tertiary); font-size: 10px; }
  .usage-extra { margin-top: 8px; }
  .usage-empty { padding: 10px 0; color: var(--text-tertiary); font-size: 11px; }
  .usage-empty code { padding: 2px 5px; border-radius: 4px; background: var(--panel-inset); color: var(--text-secondary); }

  .empty-state { padding: 48px 24px; text-align: center; color: var(--text-secondary); background: var(--panel); border: 1px solid var(--line-soft); border-radius: 12px; }
  .empty-state h2 { margin-bottom: 8px; color: var(--text-primary); font-size: 18px; }
  .empty-state p { font-size: 13px; }
  .empty-command { display: inline-block; max-width: 100%; margin-top: 12px; padding: 10px 12px; overflow-wrap: anywhere; border-radius: 8px; background: var(--panel-inset); color: var(--brand); font-size: 12px; }

  .guide-wrap { margin-top: 8px; }
  .guide { overflow: hidden; background: var(--panel); border: 1px solid var(--line-soft); border-radius: 12px; }
  .guide summary { display: flex; min-height: 56px; align-items: center; justify-content: space-between; gap: 16px; padding: 0 18px; cursor: pointer; color: var(--text-primary); font-size: 13px; font-weight: 600; list-style: none; }
  .guide summary::-webkit-details-marker { display: none; }
  .guide summary::after { content: "+"; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 18px; font-weight: 400; }
  .guide[open] summary::after { content: "−"; }
  .guide[open] summary { border-bottom: 1px solid var(--line-soft); }
  .guide-content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 20px; }
  .guide-section h3 { margin-bottom: 8px; font-size: 13px; }
  .guide-section p, .guide-section ol, .guide-section .commands { color: var(--text-secondary); font-size: 12px; }
  .guide-section ol { padding-left: 18px; }
  .guide-section li + li { margin-top: 6px; }
  .guide code { padding: 2px 5px; border-radius: 4px; background: var(--panel-inset); color: var(--brand); font-size: 11px; overflow-wrap: anywhere; }
  .guide .warn { grid-column: 1 / -1; padding: 12px 14px; border-left: 2px solid var(--warning); background: color-mix(in srgb, var(--warning) 8%, var(--panel)); color: var(--text-secondary); font-size: 12px; }
  .guide .warn strong { color: var(--warning); }

  @media (max-width: 720px) {
    .container { padding: 28px 20px 48px; }
    .page-header { grid-template-columns: 1fr; gap: 8px; margin-bottom: 24px; }
    .header-note { max-width: none; text-align: left; }
    .profile-body { grid-template-columns: 1fr; gap: 18px; }
    .usage-section { padding: 18px 0 0; border-left: 0; border-top: 1px solid var(--line-soft); }
    .guide-content { grid-template-columns: 1fr; }
    .guide .warn { grid-column: auto; }
  }
  @media (max-width: 420px) {
    .container { padding-right: 16px; padding-left: 16px; }
    h1 { font-size: 26px; }
    .profile-card { padding: 16px; }
    .profile-details { grid-template-columns: 1fr; gap: 2px; }
    .detail-value + .detail-label { margin-top: 8px; }
    .login-command { display: grid; grid-template-columns: minmax(0, 1fr) 44px; }
    .command-label { grid-column: 1 / -1; }
    .switch-btn { width: 100%; }
    .guide-content { padding: 16px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .profile-card, .switch-btn, .copy-btn, .usage-fill { transition-duration: 0ms; }
  }
` + profileBarCss + `
</style>
</head>
<body>
` + profileBarHtml + `
<div class="container">
<header class="page-header">
  <div>
    <div class="eyebrow">Account routing</div>
    <h1>Profiles</h1>
    <p class="subtitle">See authentication and quota headroom for every account, then choose the route Meridian uses by default.</p>
  </div>
  <p class="header-note">Requests can override the active route with the <code>x-meridian-profile</code> header.</p>
</header>

<div id="content"><div class="empty-state"><p>Loading profiles…</p></div></div>

<div class="guide-wrap">
  <details class="guide" id="setupGuide">
    <summary>Profile setup and CLI reference</summary>
    <div class="guide-content">
      <section class="guide-section">
        <h3>Add an account</h3>
        <ol>
          <li>Run <code>meridian profile add &lt;name&gt;</code>.</li>
          <li>Complete the Claude login in your browser.</li>
          <li>Return here to verify authentication and usage.</li>
        </ol>
      </section>
      <section class="guide-section">
        <h3>Switch the route</h3>
        <ol>
          <li>Use a profile action on this page.</li>
          <li>Or run <code>meridian profile switch &lt;name&gt;</code>.</li>
          <li>For one request, send <code>x-meridian-profile: &lt;name&gt;</code>.</li>
        </ol>
      </section>
      <div class="warn">
        <strong>Adding a second account:</strong> Sign out of claude.ai before starting the new login. Claude OAuth reuses the current browser session and may otherwise connect the same account again.
      </div>
      <section class="guide-section">
        <h3>Profile model</h3>
        <p>Each account keeps its credentials in an isolated config directory. Switching changes the default route without moving or combining credentials.</p>
      </section>
      <section class="guide-section">
        <h3>Other commands</h3>
        <div class="commands">
          <code>meridian profile list</code><br>
          <code>meridian profile login &lt;name&gt;</code><br>
          <code>meridian profile remove &lt;name&gt;</code>
        </div>
      </section>
    </div>
  </details>
</div>
</div>

<script>
// Inlined from src/telemetry/profileUsage.ts. The TS source is unit-tested
// (see profile-usage.test.ts) and the labels object is interpolated here so
// the browser script and TS module share their data.
var WINDOW_LABELS = ${JSON.stringify(WINDOW_LABELS)};

function labelForWindow(type) {
  if (WINDOW_LABELS[type]) return WINDOW_LABELS[type];
  return String(type || '').split('_').map(function (p) {
    return p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p;
  }).join(' ');
}

function classifyUtilization(u) {
  if (u == null || !isFinite(u)) return 'ok';
  if (u >= 0.85) return 'high';
  if (u >= 0.6) return 'warn';
  return 'ok';
}

function formatResetCountdown(resetsAt) {
  if (resetsAt == null || !isFinite(resetsAt)) return '';
  var ms = resetsAt - Date.now();
  if (ms <= 0) return 'resetting…';
  var minutes = Math.floor(ms / 60000);
  if (minutes < 60) return 'in ' + Math.max(1, minutes) + 'm';
  var hours = Math.floor(minutes / 60);
  var remMin = minutes % 60;
  if (hours < 24) return remMin > 0 ? 'in ' + hours + 'h ' + remMin + 'm' : 'in ' + hours + 'h';
  var days = Math.floor(hours / 24);
  var remHr = hours % 24;
  return remHr > 0 ? 'in ' + days + 'd ' + remHr + 'h' : 'in ' + days + 'd';
}

function formatExtraUsage(eu) {
  if (!eu || !eu.isEnabled) return null;
  var monthlyLimit = isFinite(eu.monthlyLimit) ? eu.monthlyLimit : 0;
  if (monthlyLimit <= 0) return null;
  var used = isFinite(eu.usedCredits) ? eu.usedCredits : 0;
  var utilization = (eu.utilization != null && isFinite(eu.utilization))
    ? Math.max(0, Math.min(1, eu.utilization))
    : (monthlyLimit > 0 ? Math.max(0, Math.min(1, used / monthlyLimit)) : 0);
  var currency = eu.currency || '';
  return {
    used: (currency + used.toFixed(2)).trim(),
    limit: (currency + monthlyLimit.toFixed(2)).trim(),
    utilizationPct: Math.round(utilization * 100),
    status: classifyUtilization(utilization),
  };
}

// Cache the last seen quota response so the /profiles/list refresh can
// keep showing usage even if a single /v1/usage/quota/all call fails.
var lastQuota = null;

async function refresh() {
  try {
    var [profilesRes, quotaRes] = await Promise.all([
      fetch('/profiles/list'),
      fetch('/v1/usage/quota/all').catch(function () { return null; }),
    ]);
    var profiles = await profilesRes.json();
    var quota = null;
    if (quotaRes && quotaRes.ok) {
      try { quota = await quotaRes.json(); } catch (_) { quota = null; }
    }
    if (quota) lastQuota = quota;
    render(profiles, lastQuota);
  } catch {
    document.getElementById('content').innerHTML = '<div class="empty-state"><h2>Could not load profiles</h2><p>Is Meridian running?</p></div>';
  }
}

function esc(s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }
function escAttr(s) { return esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

function renderUsageSection(profileQuota) {
  // No quota data for this profile yet (cold start or fetch failed) — hide
  // entirely so we don't render an empty box.
  if (!profileQuota) return '';
  // API-key profiles cannot use OAuth usage — silently omit.
  if (profileQuota.error === 'not_oauth') return '';

  var windows = (profileQuota.windows || []).filter(function (w) {
    return typeof w.utilization === 'number';
  });
  var extra = formatExtraUsage(profileQuota.extraUsage);

  if (windows.length === 0 && !extra) {
    if (profileQuota.error === 'no_token') {
      return '<div class="usage-section">'
        + '<div class="usage-section-title">Usage</div>'
        + '<div class="usage-empty">Run <code>claude login</code> to see usage.</div>'
        + '</div>';
    }
    return ''; // nothing fetched yet
  }

  var asOf = profileQuota.fetchedAt
    ? '<span class="usage-as-of">updated ' + timeAgo(profileQuota.fetchedAt) + '</span>'
    : '';

  var cards = windows.map(function (w) {
    var pct = Math.max(0, Math.min(1, w.utilization));
    var pctRound = Math.round(pct * 100);
    var status = classifyUtilization(pct);
    var label = labelForWindow(w.type);
    var reset = formatResetCountdown(w.resetsAt);
    var tip = label + ' — ' + pctRound + '%' + (reset ? ' (resets ' + reset + ')' : '');
    return '<div class="usage-card status-' + esc(status) + '" title="' + esc(tip) + '">'
      + '<div class="usage-row">'
      +   '<span class="usage-label">' + esc(label) + '</span>'
      +   '<span class="usage-pct">' + pctRound + '%</span>'
      + '</div>'
      + '<div class="usage-bar"><div class="usage-fill" style="width:' + (pct * 100).toFixed(1) + '%"></div></div>'
      + (reset ? '<div class="usage-reset">' + esc(reset) + '</div>' : '')
    + '</div>';
  }).join('');

  var extraBlock = '';
  if (extra) {
    extraBlock = '<div class="usage-extra status-' + esc(extra.status) + '">'
      +   '<div class="usage-extra-row">'
      +     '<span class="usage-label">Extra usage</span>'
      +     '<span class="usage-pct">' + extra.utilizationPct + '%</span>'
      +   '</div>'
      +   '<div class="usage-bar"><div class="usage-fill" style="width:' + extra.utilizationPct + '%"></div></div>'
      +   '<div class="usage-extra-row">'
      +     '<span class="usage-reset">' + esc(extra.used) + ' / ' + esc(extra.limit) + '</span>'
      +   '</div>'
      + '</div>';
  }

  return '<div class="usage-section">'
    + '<div class="usage-section-title">Usage' + asOf + '</div>'
    + (cards ? '<div class="usage-grid">' + cards + '</div>' : '')
    + extraBlock
    + '</div>';
}

function render(data, quotaData) {
  const profiles = data.profiles || [];
  const active = data.activeProfile;
  // Build quick lookup: profileId -> per-profile quota entry from
  // /v1/usage/quota/all. Endpoint may be unavailable (older Meridian)
  // or have errored — in that case quotaById is empty and the per-card
  // renderer simply hides its usage section.
  const quotaProfiles = (quotaData && Array.isArray(quotaData.profiles)) ? quotaData.profiles : [];
  const quotaById = {};
  for (var qi = 0; qi < quotaProfiles.length; qi++) {
    quotaById[quotaProfiles[qi].id] = quotaProfiles[qi];
  }

  if (profiles.length === 0) {
    document.getElementById('content').innerHTML = '<div class="empty-state">'
      + '<h2>No profiles configured</h2>'
      + '<p>Add your first account from the terminal, then return here to verify its quota.</p>'
      + '<code class="empty-command">meridian profile add personal</code>'
      + '</div>';
    document.getElementById('setupGuide').open = true;
    return;
  }

  let html = '<section class="section">'
    + '<div class="section-heading"><div class="section-title">Configured profiles</div>'
    + '<span class="section-count">' + profiles.length + ' total</span></div>'
    + '<div class="profile-list">';

  for (const p of profiles) {
    const isActive = p.id === active;
    const usageSection = renderUsageSection(quotaById[p.id]);
    html += '<div class="profile-card' + (isActive ? ' active' : '') + '">';
    html += '<div class="profile-card-header">';
    html += '<span class="profile-name">' + esc(p.id) + '</span>';
    if (isActive) html += '<span class="profile-badge badge-active">Default route</span>';
    html += '<span class="profile-badge badge-type">' + esc(p.type || 'claude-max') + '</span>';
    html += '<span class="status-badge ' + (p.loggedIn ? 'status-authenticated' : 'status-attention') + '">'
      + (p.loggedIn ? 'Authenticated' : 'Login required') + '</span>';
    html += '</div>';

    html += '<div class="profile-body' + (usageSection ? '' : ' profile-body-single') + '">';
    html += '<div class="profile-identity">';
    html += '<div class="profile-details">';
    html += '<span class="detail-label">Status</span>';
    html += '<span class="detail-value ' + (p.loggedIn ? 'status-ok' : 'status-err') + '">'
      + (p.loggedIn ? 'Ready' : 'Not logged in') + '</span>';

    if (p.email) {
      html += '<span class="detail-label">Email</span>';
      html += '<span class="detail-value">' + esc(p.email) + '</span>';
    }
    if (p.subscriptionType) {
      html += '<span class="detail-label">Plan</span>';
      html += '<span class="detail-value">' + esc(p.subscriptionType) + '</span>';
    }
    if (p.lastSuccessAt) {
      html += '<span class="detail-label">Last Verified</span>';
      html += '<span class="detail-value status-ok">' + timeAgo(p.lastSuccessAt) + '</span>';
    }
    if (p.lastCheckedAt && (!p.lastSuccessAt || p.lastCheckedAt !== p.lastSuccessAt)) {
      html += '<span class="detail-label">Last Checked</span>';
      html += '<span class="detail-value">' + timeAgo(p.lastCheckedAt) + '</span>';
    }
    html += '</div>';

    if (!p.loggedIn) {
      html += '<div class="auth-warning"><strong>Re-authentication needed.</strong> Run the login command below for this profile.</div>';
    }

    html += '<div class="login-command">';
    html += '<span class="command-label">Login</span>';
    html += '<code class="copy-cmd">meridian profile login ' + esc(p.id) + '</code>';
    html += '<button class="copy-btn" type="button" data-cmd="meridian profile login ' + escAttr(p.id) + '" onclick="copyCmd(this)" aria-label="Copy login command" title="Copy login command">';
    html += '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25zM5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '<div class="profile-actions">';
    if (!isActive) {
      html += '<button class="switch-btn" type="button" data-profile="' + escAttr(p.id) + '" onclick="switchProfile(this.dataset.profile)">Use as default</button>';
    } else {
      html += '<button class="switch-btn current" type="button" disabled>Current default</button>';
    }
    html += '</div>';
    html += '</div>';
    html += usageSection;
    html += '</div>';
    html += '</div>';
  }

  html += '</div></section>';
  document.getElementById('content').innerHTML = html;
}

function timeAgo(ts) {
  if (!ts) return '\u2014';
  var s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return new Date(ts).toLocaleString();
}

function fallbackCopyCmd(cmd) {
  var field = document.createElement('textarea');
  field.value = cmd || '';
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  var copied = false;
  try { copied = typeof document.execCommand === 'function' && document.execCommand('copy'); }
  catch (error) { field.dataset.error = error.message; }
  field.remove();
  return copied;
}

function finishCopyCmd(btn, copied, error) {
  btn.classList.toggle('copied', copied);
  btn.textContent = copied ? 'OK' : 'Select';
  btn.setAttribute('aria-label', copied ? 'Login command copied' : 'Copy unavailable; select the login command manually');
  btn.title = error && !copied ? error.message : copied ? 'Copied to clipboard' : 'Clipboard access is unavailable';
  setTimeout(function() {
    btn.classList.remove('copied');
    btn.setAttribute('aria-label', 'Copy login command');
    btn.title = 'Copy login command';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25zM5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z"/></svg>';
  }, 1500);
}

function copyCmd(btn) {
  var cmd = btn.getAttribute('data-cmd') || '';
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    finishCopyCmd(btn, fallbackCopyCmd(cmd));
    return;
  }
  navigator.clipboard.writeText(cmd)
    .then(function() { finishCopyCmd(btn, true); })
    .catch(function(error) { finishCopyCmd(btn, fallbackCopyCmd(cmd), error); });
}

async function switchProfile(id) {
  const res = await fetch('/profiles/active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: id })
  });
  const data = await res.json();
  if (data.success) refresh();
}

refresh();
setInterval(refresh, 10000);
` + profileBarJs + `
</script>
</body>
</html>`
