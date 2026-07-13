/**
 * SDK Features settings page — per-adapter feature policy UI.
 * No framework, no CDN.
 */

import { profileBarCss, profileBarHtml, profileBarJs, themeCss } from "./profileBar"
import { themeHeadHtml } from "./theme"

export const settingsPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Settings · Meridian</title>
${themeHeadHtml}
<style>
  ${themeCss}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-width: 0; min-height: 100vh; overflow-x: hidden; font-family: var(--font-sans);
    background: var(--canvas); color: var(--text-primary); line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  button, input, select { font: inherit; }
  ${profileBarCss}
  .content { width: min(100%, 1180px); margin: 0 auto; padding: 40px 32px 72px; }
  .page-header { max-width: 760px; margin-bottom: 20px; }
  .heading-line { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
  .eyebrow { color: var(--text-tertiary); font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin-top: 6px; font-size: 30px; line-height: 1.15; letter-spacing: -.025em; font-weight: 650; text-wrap: balance; }
  .experimental-badge {
    display: inline-flex; min-height: 24px; align-items: center; padding: 3px 8px;
    border: 1px solid color-mix(in srgb, var(--warning) 30%, var(--line-soft)); border-radius: 6px;
    color: var(--warning); background: color-mix(in srgb, var(--warning) 8%, var(--panel));
    font-size: 10px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase;
  }
  .subtitle { margin-top: 8px; color: var(--text-secondary); font-size: 14px; text-wrap: pretty; }
  .prompt-note { max-width: 760px; margin-bottom: 28px; overflow: hidden; border: 1px solid var(--line-soft); border-radius: 10px; background: var(--panel); }
  .prompt-note summary { display: flex; min-height: 48px; align-items: center; justify-content: space-between; gap: 16px; padding: 0 14px; cursor: pointer; color: var(--text-secondary); font-size: 12px; font-weight: 600; list-style: none; }
  .prompt-note summary::-webkit-details-marker { display: none; }
  .prompt-note summary::after { content: "+"; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 16px; }
  .prompt-note[open] summary::after { content: "−"; }
  .prompt-note p { padding: 0 14px 14px; color: var(--text-secondary); font-size: 12px; }

  .settings-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 20px; align-items: start; }
  .adapter-nav { display: grid; gap: 4px; padding: 6px; border: 1px solid var(--line-soft); border-radius: 12px; background: var(--panel); }
  .adapter-nav-label { padding: 8px 10px 6px; color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; }
  .adapter-tab {
    position: relative; display: grid; grid-template-columns: 1fr auto; gap: 8px; min-height: 48px;
    align-items: center; width: 100%; padding: 8px 10px; overflow: hidden; border: 1px solid transparent;
    border-radius: 8px; color: var(--text-secondary); background: transparent; text-align: left; cursor: pointer;
    transition: color 140ms cubic-bezier(.23,1,.32,1), background-color 140ms cubic-bezier(.23,1,.32,1), border-color 140ms cubic-bezier(.23,1,.32,1);
  }
  .adapter-tab::before { content: ""; position: absolute; inset: 8px auto 8px 0; width: 2px; border-radius: 1px; background: transparent; }
  .adapter-tab:hover { color: var(--text-primary); background: var(--panel-raised); }
  .adapter-tab[aria-pressed="true"] { color: var(--text-primary); border-color: var(--line-soft); background: var(--panel-raised); }
  .adapter-tab[aria-pressed="true"]::before { background: var(--brand); }
  .adapter-tab-name { min-width: 0; font-size: 12px; font-weight: 550; overflow-wrap: anywhere; }
  .adapter-state { width: 7px; height: 7px; border-radius: 50%; background: var(--line-strong); }
  .adapter-state.active { background: var(--success); }
  .adapter-picker-wrap { display: none; }
  .adapter-picker-label { display: block; margin-bottom: 6px; color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; }
  .adapter-picker { width: 100%; min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; color: var(--text-primary); background: var(--panel-inset); }

  .adapter-panel { min-width: 0; overflow: hidden; border: 1px solid var(--line-soft); border-radius: 12px; background: var(--panel); }
  .adapter-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px; border-bottom: 1px solid var(--line-soft); }
  .adapter-name { font-size: 19px; font-weight: 650; letter-spacing: -.015em; overflow-wrap: anywhere; }
  .adapter-summary { margin-top: 4px; color: var(--text-tertiary); font-size: 12px; }
  .adapter-actions { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  .adapter-badge { display: inline-flex; min-height: 28px; align-items: center; padding: 3px 8px; border: 1px solid var(--line-soft); border-radius: 6px; color: var(--text-tertiary); background: var(--panel-inset); font-size: 10px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
  .badge-active { color: var(--success); border-color: color-mix(in srgb, var(--success) 30%, var(--line-soft)); }
  .reset-btn { min-height: 44px; padding: 0 14px; border: 1px solid var(--line); border-radius: 8px; color: var(--text-secondary); background: var(--panel-inset); font-size: 12px; font-weight: 600; cursor: pointer; transition: color 140ms cubic-bezier(.23,1,.32,1), border-color 140ms cubic-bezier(.23,1,.32,1), transform 100ms cubic-bezier(.23,1,.32,1); }
  .reset-btn:hover { border-color: var(--danger); color: var(--danger); }
  .reset-btn:active { transform: scale(.97); }

  .feature-sections { display: grid; }
  .feature-section { min-width: 0; padding: 20px; border: 0; }
  .feature-section + .feature-section { border-top: 1px solid var(--line-soft); }
  .feature-section-title { display: block; margin-bottom: 12px; color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; }
  .feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .feature-row { display: flex; min-width: 0; min-height: 78px; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 12px; border: 1px solid var(--line-soft); border-radius: 9px; background: var(--panel-inset); }
  .feature-info { min-width: 160px; flex: 1 1 220px; }
  .feature-label { display: block; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; }
  .feature-desc { display: block; margin-top: 3px; color: var(--text-tertiary); font-size: 11px; line-height: 1.45; text-wrap: pretty; }
  .feature-control { flex: 0 1 190px; min-width: 0; }
  .feature-select, .feature-input { width: 100%; min-height: 44px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--text-primary); background: var(--canvas); font-size: 12px; }
  .feature-number { width: 112px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
  .feature-text { min-width: min(190px, 100%); }
  .toggle-control { position: relative; display: block; flex: 0 0 52px; width: 52px; height: 44px; cursor: pointer; }
  .toggle-control input { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
  .toggle-track { position: absolute; top: 11px; right: 0; width: 40px; height: 22px; border-radius: 11px; background: var(--line-strong); transition: background-color 140ms cubic-bezier(.23,1,.32,1); }
  .toggle-track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--text-tertiary); transition: transform 140ms cubic-bezier(.23,1,.32,1), background-color 140ms cubic-bezier(.23,1,.32,1); }
  .toggle-control input:checked + .toggle-track { background: var(--brand); }
  .toggle-control input:checked + .toggle-track::after { transform: translateX(18px); background: var(--panel); }
  .toggle-control input:focus-visible + .toggle-track, button:focus-visible, select:focus-visible, .feature-input:focus-visible, summary:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

  .loading-state { padding: 48px 20px; color: var(--text-secondary); text-align: center; font-size: 13px; }
  .save-indicator { position: fixed; right: 24px; bottom: 24px; z-index: 200; min-height: 44px; display: flex; align-items: center; padding: 0 14px; border: 1px solid var(--line-strong); border-radius: 8px; color: var(--text-primary); background: var(--panel-raised); font-size: 12px; font-weight: 600; opacity: 0; transform: translateY(6px); transition: opacity 160ms cubic-bezier(.23,1,.32,1), transform 160ms cubic-bezier(.23,1,.32,1); pointer-events: none; }
  .save-indicator.visible { opacity: 1; transform: translateY(0); }
  .save-indicator.error { color: var(--danger); border-color: var(--danger); }

  @media (max-width: 860px) {
    .settings-layout { grid-template-columns: 190px minmax(0, 1fr); }
    .feature-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 680px) {
    .content { padding: 28px 20px 56px; }
    .settings-layout { grid-template-columns: 1fr; gap: 12px; }
    .adapter-nav { display: none; }
    .adapter-picker-wrap { display: block; }
    .adapter-header { padding: 16px; }
    .feature-section { padding: 16px; }
  }
  @media (max-width: 420px) {
    .content { padding-right: 16px; padding-left: 16px; }
    h1 { font-size: 26px; }
    .adapter-header { flex-direction: column; }
    .adapter-actions { width: 100%; justify-content: space-between; }
    .feature-row { align-items: flex-start; }
    .feature-control { flex-basis: 100%; width: 100%; }
    .toggle-control { flex-basis: 52px; width: 52px; margin-left: auto; }
    .feature-number { width: 100%; }
    .save-indicator { right: 16px; bottom: 16px; left: 16px; justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .adapter-tab, .reset-btn, .toggle-track, .toggle-track::after, .save-indicator { transition-duration: 0ms; }
  }
</style>
</head>
<body>
${profileBarHtml}
<main class="content">
  <header class="page-header">
    <div class="eyebrow">Adapter policy</div>
    <div class="heading-line">
      <h1>SDK features</h1>
      <span class="experimental-badge">Experimental</span>
    </div>
    <p class="subtitle">Choose an adapter, then tailor the Claude Code capabilities Meridian adds to requests from that client.</p>
  </header>

  <details class="prompt-note">
    <summary>How combined system prompts work</summary>
    <p>For the complete feature set, enable both Claude Code Prompt and Client Prompt. Meridian appends the client-specific instructions after Claude Code's base instructions, so each agent keeps its own behavior and toolchain.</p>
  </details>

  <div class="settings-layout">
    <nav class="adapter-nav" id="adapterNav" aria-label="Adapters">
      <div class="adapter-nav-label">Adapters</div>
    </nav>
    <div class="adapter-picker-wrap">
      <label class="adapter-picker-label" for="adapterPicker">Adapter</label>
      <select class="adapter-picker" id="adapterPicker"></select>
    </div>
    <section class="adapter-panel" id="adapterPanel">
      <div class="loading-state">Loading feature policy…</div>
    </section>
  </div>
</main>

<div class="save-indicator" id="saveIndicator" role="status" aria-live="polite">Saved</div>

<script>
const FEATURES = [
  { key: 'codeSystemPrompt', group: 'prompts', label: 'Claude Code Prompt', desc: 'Include Claude Code tool rules, safety guidance, and coding practices.', type: 'toggle' },
  { key: 'clientSystemPrompt', group: 'prompts', label: 'Client Prompt', desc: 'Include the system prompt sent by the connected agent.', type: 'toggle' },
  { key: 'claudeMd', group: 'prompts', label: 'CLAUDE.md', desc: 'Load no instructions, project instructions, or both user and project instructions.', type: 'select', options: ['off', 'project', 'full'] },
  { key: 'memory', group: 'memory', label: 'Memory', desc: 'Read and write durable memories across sessions.', type: 'toggle' },
  { key: 'dreaming', group: 'memory', label: 'Auto-Dream', desc: 'Consolidate memories in the background.', type: 'toggle' },
  { key: 'sharedMemory', group: 'memory', label: 'Shared Memory', desc: 'Use the main Claude Code memory directory instead of isolated storage.', type: 'toggle' },
  { key: 'thinking', group: 'reasoning', label: 'Thinking', desc: 'Set the extended thinking strategy for this adapter.', type: 'select', options: ['disabled', 'adaptive', 'enabled'] },
  { key: 'thinkingPassthrough', group: 'reasoning', label: 'Thinking Passthrough', desc: 'Forward thinking blocks to the connected client.', type: 'toggle' },
  { key: 'maxBudgetUsd', group: 'reasoning', label: 'Max Budget (USD)', desc: 'Abort a request when its cost reaches this cap. Zero disables the cap.', type: 'number' },
  { key: 'fallbackModel', group: 'reasoning', label: 'Fallback Model', desc: 'Choose the model Meridian tries if the primary model fails.', type: 'select', options: ['', 'sonnet', 'opus', 'haiku', 'sonnet[1m]', 'opus[1m]'] },
  { key: 'sdkDebug', group: 'runtime', label: 'SDK Debug Logging', desc: 'Write verbose SDK diagnostics to proxy stderr.', type: 'toggle' },
  { key: 'additionalDirectories', group: 'runtime', label: 'Additional Directories', desc: 'Add comma-separated paths the agent may access.', type: 'text' },
];

const FEATURE_GROUPS = [
  { key: 'prompts', label: 'Prompts and project context' },
  { key: 'memory', label: 'Memory and continuity' },
  { key: 'reasoning', label: 'Reasoning and limits' },
  { key: 'runtime', label: 'Runtime and access' },
];

const ADAPTER_LABELS = {
  opencode: 'OpenCode',
  openai: 'OpenAI (/v1/chat/completions)',
  crush: 'Crush',
  forgecode: 'ForgeCode',
  pi: 'Pi',
  droid: 'Droid',
  passthrough: 'LiteLLM / Passthrough',
};

let currentConfig = {};
let currentAdapter = Object.keys(ADAPTER_LABELS)[0];
let saveTimer;

function esc(value) {
  const el = document.createElement('div');
  el.textContent = String(value == null ? '' : value);
  return el.innerHTML;
}

function escAttr(value) {
  return esc(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function loadConfig() {
  try {
    const res = await fetch('/settings/api/features');
    if (!res.ok) throw new Error('Could not load feature policy');
    currentConfig = await res.json();
    renderAdapterControls();
    renderPanel();
  } catch {
    document.getElementById('adapterPanel').innerHTML = '<div class="loading-state">Feature policy could not be loaded. Check that Meridian is running.</div>';
  }
}

async function saveFeature(adapter, key, value) {
  try {
    const patch = {};
    patch[key] = value;
    const res = await fetch('/settings/api/features/' + adapter, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Save failed');
    if (!currentConfig[adapter]) currentConfig[adapter] = {};
    currentConfig[adapter][key] = value;
    renderAdapterControls();
    showSaved('Saved', false);
  } catch {
    showSaved('Could not save change', true);
    await loadConfig();
  }
}

async function resetAdapter(adapter) {
  const button = document.getElementById('resetAdapterButton');
  if (button) button.disabled = true;
  try {
    const res = await fetch('/settings/api/features/' + adapter, { method: 'DELETE' });
    if (!res.ok) throw new Error('Reset failed');
    await loadConfig();
    showSaved('Restored defaults', false);
  } catch {
    if (button) button.disabled = false;
    showSaved('Could not restore defaults', true);
  }
}

function showSaved(message, isError) {
  const el = document.getElementById('saveIndicator');
  clearTimeout(saveTimer);
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.add('visible');
  saveTimer = setTimeout(function() { el.classList.remove('visible'); }, 1800);
}

function hasAnyEnabled(features) {
  return features.codeSystemPrompt || !features.clientSystemPrompt || features.claudeMd !== 'off' || features.memory || features.dreaming ||
         features.thinking !== 'disabled' || features.thinkingPassthrough ||
         features.sharedMemory || features.maxBudgetUsd > 0 ||
         features.fallbackModel || features.sdkDebug ||
         features.additionalDirectories;
}

function renderAdapterControls() {
  const nav = document.getElementById('adapterNav');
  nav.innerHTML = '<div class="adapter-nav-label">Adapters</div>';
  const picker = document.getElementById('adapterPicker');
  picker.innerHTML = '';

  for (const entry of Object.entries(ADAPTER_LABELS)) {
    const adapter = entry[0];
    const label = entry[1];
    const active = hasAnyEnabled(currentConfig[adapter] || {});

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'adapter-tab';
    button.setAttribute('aria-pressed', adapter === currentAdapter ? 'true' : 'false');
    button.setAttribute('aria-controls', 'adapterPanel');
    button.dataset.adapter = adapter;

    const name = document.createElement('span');
    name.className = 'adapter-tab-name';
    name.textContent = label;
    const state = document.createElement('span');
    state.className = 'adapter-state' + (active ? ' active' : '');
    state.setAttribute('aria-hidden', 'true');
    button.appendChild(name);
    button.appendChild(state);
    button.addEventListener('click', function() { selectAdapter(adapter); });
    nav.appendChild(button);

    const option = document.createElement('option');
    option.value = adapter;
    option.textContent = label + (active ? ' — active' : ' — defaults');
    option.selected = adapter === currentAdapter;
    picker.appendChild(option);
  }
}

function selectAdapter(adapter) {
  if (!ADAPTER_LABELS[adapter]) return;
  currentAdapter = adapter;
  renderAdapterControls();
  renderPanel();
}

function buildFeatureRow(feat, features, adapter) {
  const id = 'feature-' + adapter + '-' + feat.key;
  const descId = id + '-description';
  const info = '<div class="feature-info">'
    + '<label class="feature-label" for="' + id + '">' + esc(feat.label) + '</label>'
    + '<span class="feature-desc" id="' + descId + '">' + esc(feat.desc) + '</span>'
    + '</div>';
  let control = '';

  if (feat.type === 'toggle') {
    control = '<label class="toggle-control">'
      + '<input class="feature-control-input" id="' + id + '" type="checkbox" data-feature="' + feat.key + '" data-type="toggle" aria-describedby="' + descId + '"' + (features[feat.key] ? ' checked' : '') + '>'
      + '<span class="toggle-track" aria-hidden="true"></span>'
      + '</label>';
  } else if (feat.type === 'select') {
    const options = feat.options.map(function(option) {
      const label = option === '' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1);
      return '<option value="' + escAttr(option) + '"' + (features[feat.key] === option ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');
    control = '<div class="feature-control"><select class="feature-select feature-control-input" id="' + id + '" data-feature="' + feat.key + '" data-type="select" aria-describedby="' + descId + '">' + options + '</select></div>';
  } else if (feat.type === 'number') {
    const value = features[feat.key] == null ? 0 : features[feat.key];
    control = '<div class="feature-control"><input class="feature-input feature-number feature-control-input" id="' + id + '" type="number" min="0" step="0.01" inputmode="decimal" value="' + escAttr(value) + '" data-feature="' + feat.key + '" data-type="number" aria-describedby="' + descId + '"></div>';
  } else {
    const value = features[feat.key] == null ? '' : features[feat.key];
    control = '<div class="feature-control feature-text"><input class="feature-input feature-control-input" id="' + id + '" type="text" value="' + escAttr(value) + '" data-feature="' + feat.key + '" data-type="text" aria-describedby="' + descId + '"></div>';
  }

  return '<div class="feature-row">' + info + control + '</div>';
}

function renderPanel() {
  const adapter = currentAdapter;
  const features = currentConfig[adapter] || {};
  const active = hasAnyEnabled(features);
  let html = '<header class="adapter-header">'
    + '<div><h2 class="adapter-name">' + esc(ADAPTER_LABELS[adapter]) + '</h2>'
    + '<p class="adapter-summary">Feature policy applied to requests received through this adapter.</p></div>'
    + '<div class="adapter-actions">'
    + '<span class="adapter-badge ' + (active ? 'badge-active' : '') + '">' + (active ? 'Active' : 'Defaults') + '</span>'
    + '<button class="reset-btn" type="button" id="resetAdapterButton">Restore defaults</button>'
    + '</div></header><div class="feature-sections">';

  for (const group of FEATURE_GROUPS) {
    const groupFeatures = FEATURES.filter(function(feat) { return feat.group === group.key; });
    html += '<fieldset class="feature-section"><legend class="feature-section-title">' + esc(group.label) + '</legend><div class="feature-grid">';
    for (const feat of groupFeatures) html += buildFeatureRow(feat, features, adapter);
    html += '</div></fieldset>';
  }
  html += '</div>';

  const panel = document.getElementById('adapterPanel');
  panel.innerHTML = html;
  document.getElementById('resetAdapterButton').addEventListener('click', function() { resetAdapter(adapter); });
  panel.querySelectorAll('.feature-control-input').forEach(function(control) {
    control.addEventListener('change', function() {
      let value;
      if (control.dataset.type === 'toggle') value = control.checked;
      else if (control.dataset.type === 'number') value = parseFloat(control.value) || 0;
      else value = control.value;
      saveFeature(adapter, control.dataset.feature, value);
    });
  });
}

document.getElementById('adapterPicker').addEventListener('change', function(event) {
  selectAdapter(event.target.value);
});

document.getElementById('adapterNav').addEventListener('keydown', function(event) {
  if (!event.target.classList.contains('adapter-tab')) return;
  const buttons = Array.from(document.querySelectorAll('.adapter-tab'));
  const index = buttons.indexOf(event.target);
  let next = index;
  if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
  else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = buttons.length - 1;
  else return;
  event.preventDefault();
  selectAdapter(buttons[next].dataset.adapter);
  document.querySelector('.adapter-tab[data-adapter="' + buttons[next].dataset.adapter + '"]').focus();
});

loadConfig();
${profileBarJs}
</script>
</body>
</html>`
