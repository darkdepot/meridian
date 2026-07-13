/**
 * Meridian operating overview.
 *
 * The home page intentionally answers the daily questions first: which
 * profile is active, how much allowance remains, whether traffic is healthy,
 * and what happened most recently. Deeper telemetry stays one click away.
 */

import { WINDOW_LABELS } from "./profileUsage"
import { profileBarCss, profileBarHtml, profileBarJs, themeCss } from "./profileBar"
import { themeHeadHtml } from "./theme"

const windowLabelsJson = JSON.stringify(WINDOW_LABELS)

export const landingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Home · Meridian</title>
${themeHeadHtml}
<style>
  ${themeCss}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { min-height: 100vh; line-height: 1.5; }
  a { color: inherit; }
  button { color: inherit; }

  .home-main { width: min(1280px, 100%); margin: 0 auto; padding: 38px 36px 64px; }
  .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 26px; }
  .eyebrow, .section-kicker {
    color: var(--text-tertiary); font: 600 10px/1.3 var(--font-mono);
    text-transform: uppercase; letter-spacing: 0.11em;
  }
  .page-header h1 { margin-top: 7px; font-size: clamp(26px, 3vw, 38px); line-height: 1.08; letter-spacing: -0.035em; font-weight: 650; }
  .page-subtitle { max-width: 620px; margin-top: 8px; color: var(--text-secondary); font-size: 14px; }
  .update-meta { display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); font: 500 10px/1.4 var(--font-mono); white-space: nowrap; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-tertiary); }
  .live-dot.healthy { background: var(--success); }
  .live-dot.degraded { background: var(--warning); }
  .live-dot.unhealthy { background: var(--danger); }

  .attention {
    display: none; align-items: flex-start; justify-content: space-between; gap: 18px;
    margin-bottom: 18px; padding: 13px 15px;
    border: 1px solid var(--line); border-left: 3px solid var(--warning); border-radius: 9px;
    background: var(--warning-soft); color: var(--text-primary); font-size: 12px;
  }
  .attention.visible { display: flex; }
  .attention strong { font-weight: 650; }
  .attention-list { display: flex; flex-wrap: wrap; gap: 5px 18px; margin-top: 3px; color: var(--text-secondary); }
  .attention a { color: var(--brand); font-weight: 600; text-decoration: none; white-space: nowrap; }

  .auth-unlock {
    display: none; grid-template-columns: minmax(0, 1fr) minmax(300px, 390px); gap: 24px; align-items: center;
    margin-bottom: 18px; padding: 18px 20px; border-left: 3px solid var(--brand);
  }
  .auth-unlock.visible { display: grid; }
  .auth-unlock h2 { margin-top: 4px; font-size: 16px; font-weight: 650; letter-spacing: -0.015em; }
  .auth-unlock p { max-width: 680px; margin-top: 5px; color: var(--text-secondary); font-size: 11px; }
  .auth-form { display: grid; gap: 7px; }
  .auth-form label { color: var(--text-tertiary); font: 600 9px/1.3 var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; }
  .auth-input-row { display: flex; gap: 8px; }
  .auth-input-row input {
    min-width: 0; min-height: 42px; flex: 1; padding: 9px 11px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--panel-inset); color: var(--text-primary); font: 500 11px/1.4 var(--font-mono);
  }
  .auth-input-row button {
    min-height: 42px; padding: 8px 14px; border: 1px solid var(--brand); border-radius: 8px;
    background: var(--brand); color: var(--on-brand); font-size: 11px; font-weight: 650; cursor: pointer;
  }
  .auth-input-row button:disabled { opacity: 0.6; cursor: progress; }
  .auth-status { min-height: 15px; color: var(--danger); font: 500 9px/1.4 var(--font-mono); }
  .auth-status.success { color: var(--success); }

  .panel {
    background: var(--panel); border: 1px solid var(--line-soft); border-radius: 12px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.02);
  }
  .panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 19px 20px 16px; border-bottom: 1px solid var(--line-soft); }
  .panel-title { margin-top: 4px; font-size: 17px; line-height: 1.3; font-weight: 640; letter-spacing: -0.018em; }
  .panel-note { margin-top: 4px; color: var(--text-tertiary); font-size: 11px; }
  .text-link { color: var(--brand); font-size: 11px; font-weight: 620; text-decoration: none; white-space: nowrap; }
  .text-link:hover { text-decoration: underline; text-underline-offset: 3px; }

  .usage-panel { margin-bottom: 18px; overflow: hidden; }
  .usage-content { min-height: 124px; }
  .usage-row { display: grid; grid-template-columns: minmax(160px, 0.78fr) minmax(360px, 1.6fr) auto; gap: 24px; align-items: center; padding: 17px 20px; border-top: 1px solid var(--line-soft); }
  .usage-row:first-child { border-top: 0; }
  .usage-row.active { box-shadow: inset 3px 0 0 var(--brand); }
  .profile-identity { min-width: 0; }
  .profile-name-line { display: flex; align-items: center; gap: 7px; min-width: 0; }
  .profile-name { overflow: hidden; color: var(--text-primary); font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
  .profile-meta { overflow: hidden; margin-top: 4px; color: var(--text-tertiary); font: 500 10px/1.4 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .chip { display: inline-flex; align-items: center; min-height: 20px; padding: 2px 7px; border-radius: 999px; font: 600 9px/1 var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }
  .chip-active { background: var(--brand-soft); color: var(--brand-ink); }
  .chip-ok { background: var(--success-soft); color: var(--success-ink); }
  .chip-warn { background: var(--warning-soft); color: var(--warning-ink); }
  .chip-error { background: var(--danger-soft); color: var(--danger-ink); }
  .quota-grid { display: grid; grid-template-columns: repeat(2, minmax(130px, 1fr)); gap: 20px; }
  .quota-meter { min-width: 0; }
  .quota-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 7px; }
  .quota-label { color: var(--text-secondary); font-size: 11px; font-weight: 600; }
  .quota-value { color: var(--text-primary); font: 600 11px/1.4 var(--font-mono); }
  .meter-track { height: 6px; overflow: hidden; border-radius: 99px; background: var(--panel-inset); }
  .meter-fill { height: 100%; border-radius: inherit; background: var(--brand); }
  .quota-meter.warn .meter-fill { background: var(--warning); }
  .quota-meter.high .meter-fill { background: var(--danger); }
  .quota-detail { overflow: hidden; margin-top: 6px; color: var(--text-tertiary); font: 500 9px/1.4 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .usage-action {
    min-width: 92px; min-height: 38px; padding: 7px 12px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--panel-raised); color: var(--text-secondary);
    font-size: 11px; font-weight: 620; cursor: pointer;
  }
  .usage-action:hover { color: var(--brand); border-color: var(--brand); }
  .usage-action:disabled { opacity: 0.55; cursor: progress; }
  .usage-row > .chip { justify-self: end; }
  .usage-empty { padding: 30px 20px; color: var(--text-tertiary); font-size: 12px; text-align: center; }
  .usage-empty code { font-family: var(--font-mono); color: var(--text-secondary); }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 18px; overflow: hidden; }
  .kpi { min-width: 0; padding: 17px 19px; border-left: 1px solid var(--line-soft); }
  .kpi:first-child { border-left: 0; }
  .kpi-label { color: var(--text-tertiary); font: 600 9px/1.3 var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; }
  .kpi-value { margin-top: 7px; font: 620 clamp(21px, 2.5vw, 29px)/1 var(--font-sans); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  .kpi-detail { overflow: hidden; margin-top: 7px; color: var(--text-tertiary); font: 500 9px/1.4 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .kpi-value.good { color: var(--success); }
  .kpi-value.warn { color: var(--warning); }
  .kpi-value.bad { color: var(--danger); }

  .dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.72fr); gap: 18px; align-items: start; }
  .activity-panel { overflow: hidden; }
  .activity-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .activity-table th { padding: 10px 14px; background: var(--panel-inset); color: var(--text-tertiary); font: 600 9px/1.3 var(--font-mono); text-align: left; text-transform: uppercase; letter-spacing: 0.06em; }
  .activity-table td { padding: 13px 14px; border-top: 1px solid var(--line-soft); color: var(--text-secondary); font-size: 11px; vertical-align: middle; }
  .activity-table tbody tr:first-child td { border-top: 0; }
  .activity-table tbody tr:hover { background: var(--panel-raised); }
  .request-primary { overflow: hidden; color: var(--text-primary); font-size: 11px; font-weight: 620; text-overflow: ellipsis; white-space: nowrap; }
  .request-secondary { overflow: hidden; margin-top: 2px; color: var(--text-tertiary); font: 500 9px/1.35 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .request-status { display: inline-flex; align-items: center; gap: 6px; color: var(--success); font: 600 10px/1 var(--font-mono); }
  .request-status.error { color: var(--danger); }
  .request-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .numeric { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
  .activity-empty { padding: 42px 20px; color: var(--text-tertiary); font-size: 12px; text-align: center; }

  .side-stack { display: grid; gap: 18px; }
  .side-panel { padding: 18px; }
  .side-panel .panel-title { margin-bottom: 14px; }
  .route-list { display: grid; gap: 0; }
  .route-row { display: grid; grid-template-columns: 78px minmax(0, 1fr); gap: 10px; padding: 9px 0; border-top: 1px solid var(--line-soft); }
  .route-row:first-child { padding-top: 0; border-top: 0; }
  .route-label { color: var(--text-tertiary); font-size: 10px; }
  .route-value { overflow: hidden; color: var(--text-primary); font: 500 10px/1.45 var(--font-mono); text-align: right; text-overflow: ellipsis; white-space: nowrap; }
  .endpoint-box { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 9px; background: var(--panel-inset); border: 1px solid var(--line-soft); border-radius: 8px; }
  .endpoint-box code { min-width: 0; overflow: hidden; color: var(--text-secondary); font: 500 9px/1.4 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  .copy-button { flex: 0 0 auto; min-width: 54px; min-height: 30px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); color: var(--text-secondary); font-size: 9px; font-weight: 620; cursor: pointer; }
  .copy-button:hover { color: var(--brand); border-color: var(--brand); }

  .model-list, .plugin-list { display: grid; gap: 12px; }
  .model-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; }
  .model-name { overflow: hidden; color: var(--text-secondary); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .model-count { color: var(--text-primary); font: 600 9px/1.4 var(--font-mono); }
  .model-track { grid-column: 1 / -1; height: 3px; overflow: hidden; border-radius: 99px; background: var(--panel-inset); }
  .model-fill { height: 100%; border-radius: inherit; background: var(--exchange); }
  .plugin-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .plugin-name { overflow: hidden; color: var(--text-secondary); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .plugin-state { color: var(--text-tertiary); font: 600 9px/1.3 var(--font-mono); text-transform: uppercase; }
  .plugin-state.active { color: var(--success); }
  .plugin-state.error { color: var(--danger); }

  .onboarding { display: none; margin-top: 18px; padding: 20px; }
  .onboarding.visible { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
  .onboarding h2 { font-size: 17px; font-weight: 640; letter-spacing: -0.018em; }
  .onboarding p { margin-top: 5px; color: var(--text-secondary); font-size: 12px; }
  .onboarding-command { display: flex; align-items: center; gap: 8px; max-width: 480px; padding: 9px 10px; background: var(--panel-inset); border: 1px solid var(--line-soft); border-radius: 8px; }
  .onboarding-command code { overflow: hidden; color: var(--brand); font: 500 9px/1.5 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }

  .skeleton { position: relative; overflow: hidden; color: transparent !important; background: var(--panel-inset); border-radius: 5px; }
  .skeleton::after { content: ""; position: absolute; inset: 0; background: var(--line-soft); opacity: 0.36; animation: pulse 1.4s ease-in-out infinite alternate; }
  @keyframes pulse { to { opacity: 0.12; } }

  @media (max-width: 1040px) {
    .home-main { padding-inline: 26px; }
    .usage-row { grid-template-columns: minmax(145px, 0.65fr) minmax(300px, 1.4fr); gap: 18px; }
    .usage-action { grid-column: 1 / -1; justify-self: end; margin-top: -6px; }
    .dashboard-grid { grid-template-columns: 1fr; }
    .side-stack { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 760px) {
    .home-main { padding: 26px 16px 48px; }
    .page-header { align-items: flex-start; flex-direction: column; gap: 12px; }
    .page-subtitle { font-size: 13px; }
    .attention { align-items: stretch; flex-direction: column; }
    .auth-unlock { grid-template-columns: 1fr; gap: 16px; padding: 16px; }
    .auth-input-row { align-items: stretch; flex-direction: column; }
    .auth-input-row input, .auth-input-row button { min-height: 44px; }
    .panel-header { padding: 16px; }
    .usage-row { grid-template-columns: 1fr; gap: 14px; padding: 16px; }
    .usage-action { grid-column: auto; justify-self: stretch; margin-top: 0; min-height: 44px; }
    .usage-row > .chip { justify-self: start; }
    .quota-grid { gap: 14px; }
    .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .kpi:nth-child(3) { border-left: 0; }
    .kpi:nth-child(n+3) { border-top: 1px solid var(--line-soft); }
    .side-stack { grid-template-columns: 1fr; }
    .activity-table, .activity-table tbody { display: block; }
    .activity-table thead { display: none; }
    .activity-table tr { display: grid; grid-template-columns: 1fr auto; gap: 6px 16px; padding: 13px 16px; border-top: 1px solid var(--line-soft); }
    .activity-table tr:first-child { border-top: 0; }
    .activity-table td { display: block; padding: 0; border: 0; }
    .activity-table td:nth-child(1) { grid-column: 1; }
    .activity-table td:nth-child(2) { grid-column: 2; grid-row: 1; text-align: right; }
    .activity-table td:nth-child(3), .activity-table td:nth-child(4), .activity-table td:nth-child(5) { font-size: 9px; }
    .activity-table td:nth-child(5) { text-align: right; }
    .onboarding.visible { grid-template-columns: 1fr; }
  }
  @media (max-width: 420px) {
    .quota-grid { grid-template-columns: 1fr; }
    .kpi { padding: 15px; }
    .activity-table td:nth-child(4) { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .skeleton::after { animation: none; } }

  ${profileBarCss}
</style>
</head>
<body>
${profileBarHtml}
<main class="home-main">
  <header class="page-header">
    <div>
      <div class="eyebrow">Operating overview</div>
      <h1>Meridian at a glance</h1>
      <p class="page-subtitle">Profile allowance, route health, and recent traffic in one working view.</p>
    </div>
    <div class="update-meta" aria-live="polite"><span class="live-dot" id="dashboardStatusDot"></span><span id="dashboardUpdated">Connecting</span></div>
  </header>

  <section class="panel auth-unlock" id="authUnlockPanel" aria-labelledby="authUnlockTitle">
    <div><div class="section-kicker">Protected dashboard</div><h2 id="authUnlockTitle">Unlock this browser session</h2><p>Meridian API-key protection is enabled. Enter the same key once to open live dashboard data and management pages for the next eight hours. The key is exchanged for an HttpOnly session cookie and is not stored in the page.</p></div>
    <form class="auth-form" id="authUnlockForm">
      <label for="authUnlockKey">Meridian API key</label>
      <div class="auth-input-row"><input id="authUnlockKey" type="password" autocomplete="current-password" spellcheck="false" required><button id="authUnlockButton" type="submit">Unlock</button></div>
      <div class="auth-status" id="authUnlockStatus" role="status" aria-live="polite"></div>
    </form>
  </section>

  <section class="attention" id="attentionPanel" aria-live="polite">
    <div><strong>Needs attention</strong><div class="attention-list" id="attentionList"></div></div>
    <a href="/profiles">Review profiles</a>
  </section>

  <section class="panel usage-panel" aria-labelledby="usageTitle">
    <div class="panel-header">
      <div><div class="section-kicker">Allowance</div><h2 class="panel-title" id="usageTitle">Usage by profile</h2><p class="panel-note">Current OAuth windows and reset timing.</p></div>
      <a class="text-link" href="/profiles">Manage profiles</a>
    </div>
    <div class="usage-content" id="usageContent" aria-live="polite"><div class="usage-empty">Loading profile usage…</div></div>
  </section>

  <section class="panel kpi-grid" aria-label="24 hour traffic summary">
    <article class="kpi"><div class="kpi-label">Requests · 24h</div><div class="kpi-value skeleton" id="kpiRequests">000</div><div class="kpi-detail" id="kpiRequestsDetail">Loading traffic</div></article>
    <article class="kpi"><div class="kpi-label">Median response</div><div class="kpi-value skeleton" id="kpiLatency">000ms</div><div class="kpi-detail" id="kpiLatencyDetail">Loading latency</div></article>
    <article class="kpi"><div class="kpi-label">Cache efficiency</div><div class="kpi-value skeleton" id="kpiCache">00%</div><div class="kpi-detail" id="kpiCacheDetail">Loading token cache</div></article>
    <article class="kpi"><div class="kpi-label">Error rate</div><div class="kpi-value skeleton" id="kpiErrors">0.0%</div><div class="kpi-detail" id="kpiErrorsDetail">Loading reliability</div></article>
  </section>

  <div class="dashboard-grid">
    <section class="panel activity-panel" aria-labelledby="activityTitle">
      <div class="panel-header"><div><div class="section-kicker">Traffic</div><h2 class="panel-title" id="activityTitle">Recent activity</h2></div><a class="text-link" href="/telemetry">Open telemetry</a></div>
      <div id="activityContent" aria-live="polite"><div class="activity-empty">Loading recent requests…</div></div>
    </section>

    <aside class="side-stack" aria-label="Runtime details">
      <section class="panel side-panel">
        <div class="section-kicker">Route</div><h2 class="panel-title">Runtime</h2>
        <div class="route-list" id="runtimeContent"><div class="route-row"><span class="route-label">Status</span><span class="route-value">Connecting</span></div></div>
        <div class="endpoint-box"><code id="endpointValue"></code><button class="copy-button" id="copyEndpoint" type="button">Copy</button></div>
      </section>
      <section class="panel side-panel">
        <div class="section-kicker">Distribution</div><h2 class="panel-title">Models</h2>
        <div class="model-list" id="modelContent"><div class="panel-note">Waiting for traffic data.</div></div>
      </section>
      <section class="panel side-panel">
        <div class="section-kicker">Pipeline</div><h2 class="panel-title">Plugins</h2>
        <div class="plugin-list" id="pluginContent"><div class="panel-note">Loading integrations.</div></div>
      </section>
    </aside>
  </div>

  <section class="panel onboarding" id="onboardingPanel">
    <div><div class="section-kicker">First route</div><h2>Send a request through Meridian</h2><p>Your dashboard will populate as soon as an Anthropic-compatible client uses this endpoint.</p></div>
    <div class="onboarding-command"><code id="onboardingCommand"></code><button class="copy-button" id="copyCommand" type="button">Copy</button></div>
  </section>
</main>
<script>
var WINDOW_LABELS = ${windowLabelsJson};
var latestState = { health: null, summary: null, profiles: null, quota: null, requests: null, plugins: null };

function esc(value) {
  var node = document.createElement('div');
  node.textContent = String(value == null ? '' : value);
  return node.innerHTML;
}
function number(value, fallback) { return typeof value === 'number' && isFinite(value) ? value : (fallback == null ? 0 : fallback); }
function formatMs(value) {
  var ms = number(value, 0);
  if (ms <= 0) return '—';
  if (ms < 1000) return Math.round(ms) + 'ms';
  return (ms / 1000).toFixed(ms < 10000 ? 1 : 0) + 's';
}
function formatTokens(value) {
  var amount = number(value, 0);
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return Math.round(amount / 1000) + 'k';
  return String(Math.round(amount));
}
function timeAgo(timestamp) {
  var elapsed = Date.now() - number(timestamp, Date.now());
  if (elapsed < 60000) return 'just now';
  if (elapsed < 3600000) return Math.floor(elapsed / 60000) + 'm ago';
  if (elapsed < 86400000) return Math.floor(elapsed / 3600000) + 'h ago';
  return Math.floor(elapsed / 86400000) + 'd ago';
}
function resetIn(timestamp) {
  if (timestamp == null || !isFinite(timestamp)) return '';
  var remaining = timestamp - Date.now();
  if (remaining <= 0) return 'resetting';
  var minutes = Math.max(1, Math.floor(remaining / 60000));
  if (minutes < 60) return 'resets in ' + minutes + 'm';
  var hours = Math.floor(minutes / 60);
  if (hours < 24) return 'resets in ' + hours + 'h' + (minutes % 60 ? ' ' + (minutes % 60) + 'm' : '');
  return 'resets in ' + Math.floor(hours / 24) + 'd' + (hours % 24 ? ' ' + (hours % 24) + 'h' : '');
}
function labelWindow(type) {
  if (WINDOW_LABELS[type]) return WINDOW_LABELS[type];
  return String(type || 'Window').split('_').map(function(part) { return part ? part.charAt(0).toUpperCase() + part.slice(1) : ''; }).join(' ');
}
function statusForUtilization(value) {
  return value >= 0.85 ? 'high' : value >= 0.6 ? 'warn' : 'ok';
}
function fetchJson(path) {
  return fetch(path).then(function(response) {
    if (!response.ok) {
      var error = new Error(path + ' returned ' + response.status);
      error.status = response.status;
      throw error;
    }
    return response.json();
  });
}
function fetchHealth() {
  return fetch('/health').then(function(response) {
    return response.json().then(function(data) {
      if (!response.ok && !data.status) {
        var error = new Error('/health returned ' + response.status);
        error.status = response.status;
        throw error;
      }
      return data;
    });
  });
}
function settledValue(result) { return result.status === 'fulfilled' ? result.value : null; }

function quotaDetail(windowData) {
  var pct = Math.round(number(windowData.utilization, 0) * 100);
  var reset = resetIn(windowData.resetsAt);
  if (windowData.type === 'seven_day' && windowData.resetsAt) {
    var elapsed = Math.max(0, Math.min(1, (Date.now() - (windowData.resetsAt - 604800000)) / 604800000));
    var delta = pct - Math.round(elapsed * 100);
    var pace = Math.abs(delta) <= 7 ? 'on even pace' : Math.abs(delta) + ' pts ' + (delta > 0 ? 'ahead of' : 'under') + ' pace';
    return pace + (reset ? ' · ' + reset : '');
  }
  return Math.max(0, 100 - pct) + '% headroom' + (reset ? ' · ' + reset : '');
}
function renderQuotaMeter(windowData) {
  if (!windowData || typeof windowData.utilization !== 'number') {
    return '<div class="quota-meter"><div class="quota-head"><span class="quota-label">No window data</span><span class="quota-value">—</span></div><div class="meter-track"></div><div class="quota-detail">Waiting for allowance data</div></div>';
  }
  var utilization = Math.max(0, Math.min(1, windowData.utilization));
  var pct = Math.round(utilization * 100);
  var state = statusForUtilization(utilization);
  return '<div class="quota-meter ' + state + '">'
    + '<div class="quota-head"><span class="quota-label">' + esc(labelWindow(windowData.type)) + '</span><span class="quota-value">' + pct + '%</span></div>'
    + '<div class="meter-track" role="progressbar" aria-label="' + esc(labelWindow(windowData.type)) + ' usage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div class="meter-fill" style="width:' + pct + '%"></div></div>'
    + '<div class="quota-detail">' + esc(quotaDetail(windowData)) + '</div></div>';
}
function renderUsage(quota, profilesData) {
  var host = document.getElementById('usageContent');
  if (!quota && !profilesData) {
    host.innerHTML = '<div class="usage-empty">Profile usage is unavailable. Unlock the dashboard or try again shortly.</div>';
    return;
  }
  var quotaProfiles = quota && Array.isArray(quota.profiles) ? quota.profiles : [];
  var profiles = profilesData && Array.isArray(profilesData.profiles) ? profilesData.profiles : [];
  var profilesById = {};
  profiles.forEach(function(profile) { profilesById[profile.id] = profile; });

  if (quotaProfiles.length === 0 && profiles.length > 0) {
    quotaProfiles = profiles.map(function(profile) { return { id: profile.id, isActive: profile.isActive, type: profile.type, windows: [], error: 'unavailable' }; });
  }
  if (quotaProfiles.length === 0) {
    host.innerHTML = '<div class="usage-empty">No profiles are configured yet. <a class="text-link" href="/profiles">Add a profile</a> to begin.</div>';
    return;
  }

  host.innerHTML = quotaProfiles.map(function(profileQuota) {
    var profile = profilesById[profileQuota.id] || {};
    var windows = Array.isArray(profileQuota.windows) ? profileQuota.windows.filter(function(item) { return typeof item.utilization === 'number'; }) : [];
    var primary = windows.find(function(item) { return item.type === 'five_hour'; }) || windows[0];
    var weekly = windows.find(function(item) { return item.type === 'seven_day'; }) || windows.find(function(item) { return item !== primary; });
    var active = Boolean(profileQuota.isActive || profile.isActive || (profilesData && profilesData.activeProfile === profileQuota.id));
    var authenticated = profile.loggedIn !== false;
    var stateChip = profileQuota.error === 'not_oauth'
      ? '<span class="chip chip-warn">API key</span>'
      : !authenticated || profileQuota.error === 'no_token'
        ? '<span class="chip chip-error">Login needed</span>'
        : '<span class="chip chip-ok">Connected</span>';
    var meters = profileQuota.error === 'not_oauth'
      ? '<div class="usage-empty" style="padding:0;text-align:left;grid-column:1/-1">OAuth allowance is not available for API-key profiles.</div>'
      : profileQuota.error === 'no_token' && windows.length === 0
        ? '<div class="usage-empty" style="padding:0;text-align:left;grid-column:1/-1">Run <code>meridian profile login ' + esc(profileQuota.id) + '</code> to load allowance.</div>'
        : renderQuotaMeter(primary) + renderQuotaMeter(weekly);
    return '<article class="usage-row' + (active ? ' active' : '') + '">'
      + '<div class="profile-identity"><div class="profile-name-line"><span class="profile-name">' + esc(profileQuota.id) + '</span>' + (active ? '<span class="chip chip-active">Active</span>' : stateChip) + '</div>'
      + '<div class="profile-meta">' + esc(profile.email || profile.subscriptionType || profileQuota.type || 'claude-max') + '</div></div>'
      + '<div class="quota-grid">' + meters + '</div>'
      + (active ? '<span class="chip chip-active">Routing now</span>' : '<button class="usage-action" type="button" data-profile="' + esc(profileQuota.id) + '">Make active</button>')
      + '</article>';
  }).join('');
}

function setKpi(id, value, detail, tone) {
  var valueNode = document.getElementById(id);
  valueNode.textContent = value;
  valueNode.className = 'kpi-value' + (tone ? ' ' + tone : '');
  document.getElementById(id + 'Detail').textContent = detail;
}
function renderKpis(summary) {
  if (!summary) {
    setKpi('kpiRequests', '—', 'Traffic data unavailable', '');
    setKpi('kpiLatency', '—', 'Latency data unavailable', '');
    setKpi('kpiCache', '—', 'Cache data unavailable', '');
    setKpi('kpiErrors', '—', 'Reliability data unavailable', '');
    return;
  }
  var requests = number(summary.totalRequests, 0);
  var errors = number(summary.errorCount, 0);
  var errorRate = requests > 0 ? errors / requests : 0;
  var cache = summary.tokenUsage ? number(summary.tokenUsage.avgCacheHitRate, 0) : 0;
  setKpi('kpiRequests', String(requests), formatTokens(summary.tokenUsage && summary.tokenUsage.totalInputTokens) + ' input tokens', '');
  setKpi('kpiLatency', formatMs(summary.totalDuration && summary.totalDuration.p50), 'p95 ' + formatMs(summary.totalDuration && summary.totalDuration.p95), '');
  setKpi('kpiCache', Math.round(cache * 100) + '%', formatTokens(summary.tokenUsage && summary.tokenUsage.totalCacheReadTokens) + ' tokens read from cache', cache >= 0.6 ? 'good' : cache > 0 ? 'warn' : '');
  setKpi('kpiErrors', (errorRate * 100).toFixed(1) + '%', errors + (errors === 1 ? ' failed request' : ' failed requests'), errorRate > 0.05 ? 'bad' : 'good');
}

function renderActivity(requests) {
  var host = document.getElementById('activityContent');
  if (!Array.isArray(requests)) {
    host.innerHTML = '<div class="activity-empty">Recent activity is unavailable.</div>';
    return;
  }
  if (requests.length === 0) {
    host.innerHTML = '<div class="activity-empty">No requests recorded in this window yet.</div>';
    return;
  }
  var rows = requests.slice(0, 7).map(function(request) {
    var failed = Boolean(request.error) || number(request.status, 200) >= 400;
    var tokens = number(request.inputTokens, 0) + number(request.outputTokens, 0);
    var source = request.adapter || request.requestSource || request.mode || 'client';
    return '<tr>'
      + '<td><div class="request-primary">' + esc(request.model || 'unknown model') + '</div><div class="request-secondary">' + esc(source) + ' · ' + esc(request.lineageType || (request.isResume ? 'resume' : 'new')) + '</div></td>'
      + '<td><span class="request-status' + (failed ? ' error' : '') + '">' + (failed ? esc(request.status || 'Error') : esc(request.status || '200')) + '</span></td>'
      + '<td class="numeric">' + esc(formatMs(request.totalDurationMs)) + '</td>'
      + '<td class="numeric">' + esc(tokens ? formatTokens(tokens) : '—') + '</td>'
      + '<td class="numeric">' + esc(timeAgo(request.timestamp)) + '</td>'
      + '</tr>';
  }).join('');
  host.innerHTML = '<table class="activity-table"><thead><tr><th style="width:38%">Request</th><th style="width:15%">Status</th><th style="width:16%">Duration</th><th style="width:14%">Tokens</th><th style="width:17%">When</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function renderRuntime(health, profilesData) {
  var status = health && health.status ? health.status : 'unavailable';
  var active = profilesData && (profilesData.activeProfile || (profilesData.profiles || []).find(function(profile) { return profile.isActive; })?.id);
  var auth = health && health.auth ? health.auth : {};
  var rows = [
    ['Status', status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Unavailable'],
    ['Mode', health && health.mode ? health.mode : '—'],
    ['Profile', active || 'default'],
    ['Account', auth.email || (auth.loggedIn ? 'Authenticated' : 'Not verified')],
  ];
  document.getElementById('runtimeContent').innerHTML = rows.map(function(row) {
    return '<div class="route-row"><span class="route-label">' + esc(row[0]) + '</span><span class="route-value">' + esc(row[1]) + '</span></div>';
  }).join('');
}
function renderModels(summary) {
  var host = document.getElementById('modelContent');
  if (!summary) {
    host.innerHTML = '<div class="panel-note">Model data is unavailable.</div>';
    return;
  }
  var models = summary && summary.byModel ? Object.entries(summary.byModel).sort(function(a, b) { return b[1].count - a[1].count; }).slice(0, 4) : [];
  if (models.length === 0) {
    host.innerHTML = '<div class="panel-note">Model mix appears after the first request.</div>';
    return;
  }
  var total = models.reduce(function(sum, entry) { return sum + number(entry[1].count, 0); }, 0) || 1;
  host.innerHTML = models.map(function(entry) {
    var pct = Math.round(number(entry[1].count, 0) / total * 100);
    return '<div class="model-row"><span class="model-name">' + esc(entry[0]) + '</span><span class="model-count">' + entry[1].count + '</span><div class="model-track"><div class="model-fill" style="width:' + pct + '%"></div></div></div>';
  }).join('');
}
function renderPlugins(pluginData) {
  var host = document.getElementById('pluginContent');
  if (!pluginData) {
    host.innerHTML = '<div class="panel-note">Plugin data is unavailable.</div>';
    return;
  }
  var plugins = pluginData && Array.isArray(pluginData.plugins) ? pluginData.plugins : [];
  if (plugins.length === 0) {
    host.innerHTML = '<div class="panel-note">No optional plugins loaded.</div>';
    return;
  }
  host.innerHTML = plugins.slice(0, 5).map(function(plugin) {
    var state = plugin.status || 'unknown';
    var className = state === 'active' ? 'active' : state === 'error' ? 'error' : '';
    return '<div class="plugin-row"><span class="plugin-name">' + esc(plugin.name) + '</span><span class="plugin-state ' + className + '">' + esc(state) + '</span></div>';
  }).join('') + (plugins.length > 5 ? '<a class="text-link" href="/plugins">+' + (plugins.length - 5) + ' more</a>' : '');
}

function renderAttention(health, summary, profilesData, quota, pluginData) {
  var issues = [];
  if (!health || health.status !== 'healthy') issues.push(!health ? 'Health status could not be loaded' : health.error || 'Proxy reports ' + health.status);
  var profiles = profilesData && Array.isArray(profilesData.profiles) ? profilesData.profiles : [];
  var loginCount = profiles.filter(function(profile) { return profile.loggedIn === false; }).length;
  if (loginCount) issues.push(loginCount + (loginCount === 1 ? ' profile needs login' : ' profiles need login'));
  var quotaProfiles = quota && Array.isArray(quota.profiles) ? quota.profiles : [];
  var highUsage = quotaProfiles.filter(function(profile) { return (profile.windows || []).some(function(windowData) { return number(windowData.utilization, 0) >= 0.85; }); }).length;
  if (highUsage) issues.push(highUsage + (highUsage === 1 ? ' profile is above 85% allowance' : ' profiles are above 85% allowance'));
  var requests = summary ? number(summary.totalRequests, 0) : 0;
  var errorRate = requests > 0 ? number(summary.errorCount, 0) / requests : 0;
  if (requests >= 5 && errorRate > 0.05) issues.push((errorRate * 100).toFixed(1) + '% error rate in the last 24 hours');
  var plugins = pluginData && Array.isArray(pluginData.plugins) ? pluginData.plugins : [];
  var pluginErrors = plugins.filter(function(plugin) { return plugin.status === 'error'; }).length;
  if (pluginErrors) issues.push(pluginErrors + (pluginErrors === 1 ? ' plugin failed to load' : ' plugins failed to load'));
  var panel = document.getElementById('attentionPanel');
  panel.classList.toggle('visible', issues.length > 0);
  document.getElementById('attentionList').innerHTML = issues.map(function(issue) { return '<span>' + esc(issue) + '</span>'; }).join('');
}
function renderOnboarding(summary) {
  var panel = document.getElementById('onboardingPanel');
  panel.classList.toggle('visible', Boolean(summary && number(summary.totalRequests, 0) === 0));
}
function fallbackCopy(value) {
  var field = document.createElement('textarea');
  field.value = value;
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
function showCopyResult(button, copied, error) {
  button.textContent = copied ? 'Copied' : 'Select';
  button.title = error ? error.message : copied ? 'Copied to clipboard' : 'Clipboard access is unavailable';
  setTimeout(function() { button.textContent = 'Copy'; }, 1800);
}
function copyText(value, button) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    showCopyResult(button, fallbackCopy(value));
    return;
  }
  navigator.clipboard.writeText(value)
    .then(function() { showCopyResult(button, true); })
    .catch(function(error) { showCopyResult(button, fallbackCopy(value), error); });
}

async function refresh() {
  var results = await Promise.allSettled([
    fetchHealth(),
    fetchJson('/telemetry/summary?window=86400000'),
    fetchJson('/profiles/list'),
    fetchJson('/v1/usage/quota/all'),
    fetchJson('/telemetry/requests?limit=7&since=' + (Date.now() - 86400000)),
    fetchJson('/plugins/list'),
  ]);
  var locked = results.slice(1).some(function(result) { return result.status === 'rejected' && result.reason && result.reason.status === 401; });
  document.getElementById('authUnlockPanel').classList.toggle('visible', locked);
  latestState = {
    health: settledValue(results[0]), summary: settledValue(results[1]), profiles: settledValue(results[2]),
    quota: settledValue(results[3]), requests: settledValue(results[4]), plugins: settledValue(results[5]),
  };
  renderUsage(latestState.quota, latestState.profiles);
  renderKpis(latestState.summary);
  renderActivity(latestState.requests);
  renderRuntime(latestState.health, latestState.profiles);
  renderModels(latestState.summary);
  renderPlugins(latestState.plugins);
  renderAttention(latestState.health, latestState.summary, latestState.profiles, latestState.quota, latestState.plugins);
  renderOnboarding(latestState.summary);
  var healthStatus = latestState.health && latestState.health.status ? latestState.health.status : 'unhealthy';
  document.getElementById('dashboardStatusDot').className = 'live-dot ' + (healthStatus === 'healthy' ? 'healthy' : healthStatus === 'degraded' ? 'degraded' : 'unhealthy');
  document.getElementById('dashboardUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.getElementById('usageContent').addEventListener('click', function(event) {
  var button = event.target.closest('[data-profile]');
  if (!button) return;
  button.disabled = true;
  button.textContent = 'Switching';
  fetch('/profiles/active', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: button.dataset.profile }) })
    .then(function(response) { if (!response.ok) throw new Error('Profile switch failed'); return response.json(); })
    .then(function(data) { if (!data.success) throw new Error(data.error || 'Profile switch failed'); return refresh(); })
    .catch(function(error) { button.disabled = false; button.textContent = 'Try again'; button.title = error.message; });
});

var endpointUrl = location.origin;
var command = 'ANTHROPIC_API_KEY=x ANTHROPIC_BASE_URL=' + endpointUrl + ' opencode';
document.getElementById('endpointValue').textContent = endpointUrl;
document.getElementById('onboardingCommand').textContent = command;
document.getElementById('copyEndpoint').addEventListener('click', function(event) { copyText(endpointUrl, event.currentTarget); });
document.getElementById('copyCommand').addEventListener('click', function(event) { copyText(command, event.currentTarget); });
document.getElementById('authUnlockForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var keyInput = document.getElementById('authUnlockKey');
  var unlockButton = document.getElementById('authUnlockButton');
  var unlockStatus = document.getElementById('authUnlockStatus');
  var key = keyInput.value.trim();
  if (!key) return;
  unlockButton.disabled = true;
  unlockButton.textContent = 'Checking';
  unlockStatus.classList.remove('success');
  unlockStatus.textContent = 'Verifying API key…';
  fetch('/auth/browser', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json', 'x-api-key': key }
  }).then(function(response) {
    if (!response.ok) throw new Error('That API key was not accepted.');
    return response.json();
  }).then(function() {
    keyInput.value = '';
    unlockStatus.classList.add('success');
    unlockStatus.textContent = 'Browser session unlocked.';
    document.dispatchEvent(new CustomEvent('meridian:auth-changed'));
    return refresh();
  }).catch(function(error) {
    unlockStatus.classList.remove('success');
    unlockStatus.textContent = error.message;
    keyInput.focus();
  }).finally(function() {
    unlockButton.disabled = false;
    unlockButton.textContent = 'Unlock';
  });
});
document.addEventListener('meridian:profile-changed', refresh);

refresh().catch(function(error) {
  document.getElementById('dashboardUpdated').textContent = 'Dashboard unavailable';
  document.getElementById('dashboardUpdated').title = error.message;
});
setInterval(refresh, 15000);
${profileBarJs}
</script>
</body>
</html>`
