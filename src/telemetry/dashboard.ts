/**
 * Inline HTML dashboard for telemetry.
 * No framework, no build step, no CDN. Single self-contained page.
 */

import { profileBarCss, profileBarHtml, profileBarJs, themeCss } from "./profileBar"
import { themeHeadHtml } from "./theme"

export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Telemetry · Meridian</title>
${themeHeadHtml}
<style>
  ${themeCss}
  :root {
    --telemetry-total: var(--exchange);
    --telemetry-queue: var(--queue);
    --telemetry-proxy: var(--warning);
    --telemetry-ttfb: var(--ttfb);
    --telemetry-upstream: var(--upstream);
  }

  * { box-sizing: border-box; }
  html { min-width: 0; max-width: 100%; }
  body {
    min-width: 0;
    max-width: 100%;
    margin: 0;
    background: var(--canvas);
    color: var(--text-primary);
    font-family: var(--font-sans);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  button, select, input { font: inherit; }
  button, select, label { -webkit-tap-highlight-color: transparent; }
  button { color: inherit; }
  [hidden] { display: none !important; }

  .telemetry-shell {
    width: min(100%, 1480px);
    min-width: 0;
    margin-inline: auto;
    padding: 32px clamp(20px, 3vw, 44px) 56px;
  }
  .page-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 28px;
  }
  .page-title-group { min-width: 0; }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    color: var(--text-tertiary);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .seam-glyph {
    display: inline-grid;
    grid-template-columns: repeat(2, 18px);
    gap: 6px;
    width: 42px;
    height: 4px;
  }
  .seam-glyph::before,
  .seam-glyph::after {
    height: 4px;
    border-radius: 1px;
    content: "";
  }
  .seam-glyph::before { background: var(--brand); }
  .seam-glyph::after { background: var(--exchange); }
  h1 {
    margin: 0;
    font-size: clamp(30px, 4vw, 44px);
    font-weight: 650;
    letter-spacing: -0.035em;
    line-height: 1.05;
    text-wrap: balance;
  }
  .subtitle {
    max-width: 620px;
    margin: 10px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
    text-wrap: pretty;
  }

  .refresh-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    min-width: 0;
    flex-wrap: wrap;
  }
  .window-field { display: flex; align-items: center; gap: 8px; }
  .field-label {
    color: var(--text-tertiary);
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .control,
  .button,
  .auto-toggle {
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--panel-inset);
  }
  .control {
    min-width: 136px;
    padding: 0 34px 0 12px;
    color: var(--text-primary);
    cursor: pointer;
  }
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: border-color 150ms cubic-bezier(0.23, 1, 0.32, 1),
                background-color 150ms cubic-bezier(0.23, 1, 0.32, 1),
                transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  .button:hover { border-color: var(--line-strong); background: var(--panel-raised); }
  .button:active { transform: scale(0.97); }
  .button:disabled { cursor: wait; opacity: 0.6; }
  .button.subtle { min-height: 44px; background: transparent; color: var(--text-secondary); }
  .button.subtle:hover { color: var(--text-primary); }
  .auto-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
  }
  .auto-toggle input { width: 16px; height: 16px; margin: 0; accent-color: var(--brand); }
  .refresh-indicator {
    flex-basis: 100%;
    min-height: 18px;
    color: var(--text-tertiary);
    font-size: 11px;
    text-align: right;
  }

  :where(button, select, input, summary, [tabindex="0"]):focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }

  .tabs-viewport {
    max-width: 100%;
    margin-bottom: 24px;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid var(--line-soft);
    scrollbar-width: none;
  }
  .tabs-viewport::-webkit-scrollbar { display: none; }
  .tabs { display: flex; width: max-content; min-width: 100%; gap: 4px; }
  .tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 48px;
    padding: 0 16px;
    border: 0;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
  }
  .tab::after {
    position: absolute;
    right: 16px;
    bottom: -1px;
    left: 16px;
    height: 2px;
    background: transparent;
    content: "";
  }
  .tab:hover { color: var(--text-primary); }
  .tab.active { color: var(--text-primary); }
  .tab.active::after { background: var(--brand); }
  .tab-badge {
    min-width: 22px;
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--panel-raised);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    line-height: 18px;
    text-align: center;
  }
  .tab.active .tab-badge { background: color-mix(in srgb, var(--brand) 12%, transparent); color: var(--brand); }
  .tab-panel { min-width: 0; }

  .overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);
    gap: 16px;
    margin-bottom: 16px;
  }
  .overview-lower {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: 16px;
    margin-bottom: 16px;
  }
  .panel {
    min-width: 0;
    border: 1px solid var(--line-soft);
    border-radius: 12px;
    background: var(--panel);
  }
  .pulse-panel { display: flex; flex-direction: column; }
  .pulse-panel .pulse-lead { flex: 1; }
  .panel-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px 0;
  }
  .panel-title { margin: 0; font-size: 15px; font-weight: 650; letter-spacing: -0.01em; }
  .panel-note { margin: 3px 0 0; color: var(--text-tertiary); font-size: 12px; }
  .panel-kicker {
    color: var(--text-tertiary);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .pulse-lead {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 20px 22px;
  }
  .pulse-value {
    display: block;
    font-size: clamp(44px, 6vw, 68px);
    font-weight: 650;
    letter-spacing: -0.055em;
    line-height: 0.9;
    font-variant-numeric: tabular-nums;
  }
  .pulse-label { display: block; margin-top: 10px; color: var(--text-secondary); font-size: 13px; }
  .pulse-rate { color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; font-variant-numeric: tabular-nums; }
  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 28px;
    margin-top: 8px;
    padding: 0 9px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--success) 12%, transparent);
    color: var(--success);
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
  }
  .status-chip::before { width: 6px; height: 6px; border-radius: 50%; background: currentColor; content: ""; }
  .status-chip.error { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
  .metric-lattice {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 1px solid var(--line-soft);
  }
  .metric-cell { min-width: 0; padding: 15px 16px 17px; border-left: 1px solid var(--line-soft); }
  .metric-cell:first-child { border-left: 0; }
  .metric-label {
    display: block;
    overflow: hidden;
    color: var(--text-tertiary);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.06em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .metric-value {
    display: block;
    margin-top: 5px;
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .metric-detail { display: block; margin-top: 2px; color: var(--text-tertiary); font-size: 10px; }

  .capacity-body { padding: 20px; }
  .capacity-list { display: grid; gap: 20px; }
  .capacity-row { --meter-color: var(--success); }
  .capacity-row.warn { --meter-color: var(--warning); }
  .capacity-row.high { --meter-color: var(--danger); }
  .capacity-meta { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .capacity-title { font-size: 12px; font-weight: 650; }
  .capacity-reset { color: var(--text-tertiary); font-size: 10px; white-space: nowrap; }
  .capacity-value { margin-top: 6px; font-size: 26px; font-weight: 650; letter-spacing: -0.035em; font-variant-numeric: tabular-nums; }
  .capacity-value span { color: var(--text-tertiary); font-size: 13px; font-weight: 500; }
  .usage-progress {
    display: block;
    width: 100%;
    height: 7px;
    margin-top: 9px;
    overflow: hidden;
    appearance: none;
    border: 0;
    border-radius: 999px;
    background: var(--panel-inset);
  }
  .usage-progress::-webkit-progress-bar { border-radius: 999px; background: var(--panel-inset); }
  .usage-progress::-webkit-progress-value { border-radius: 999px; background: var(--meter-color); }
  .usage-progress::-moz-progress-bar { border-radius: 999px; background: var(--meter-color); }
  .pace-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line-soft); }
  .pace-label { color: var(--text-secondary); font-size: 11px; }
  .pace-pill {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--success) 12%, transparent);
    color: var(--success);
    font-size: 10px;
    font-weight: 650;
    white-space: nowrap;
  }
  .pace-pill.ahead { background: color-mix(in srgb, var(--warning) 14%, transparent); color: var(--warning); }
  .pace-pill.over { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
  .capacity-footer { display: flex; justify-content: flex-end; padding: 0 20px 16px; }

  .activity-list { margin: 8px 0 0; padding: 0 20px 8px; list-style: none; }
  .activity-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    min-height: 66px;
    border-top: 1px solid var(--line-soft);
  }
  .activity-item:first-child { border-top: 0; }
  .activity-main { min-width: 0; }
  .activity-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .activity-model { overflow: hidden; font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
  .request-status { color: var(--success); font-family: var(--font-mono); font-size: 10px; font-weight: 650; }
  .request-status.error { color: var(--danger); }
  .activity-meta { overflow: hidden; margin-top: 4px; color: var(--text-tertiary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .activity-values { text-align: right; }
  .activity-duration { display: block; font-family: var(--font-mono); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .activity-token { display: block; margin-top: 3px; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 10px; }
  .panel-footer { display: flex; justify-content: flex-end; padding: 4px 20px 16px; }

  .context-body { padding: 24px 20px 20px; }
  .cache-lead { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
  .cache-value { font-size: 38px; font-weight: 650; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums; }
  .cache-caption { margin-top: 7px; color: var(--text-secondary); font-size: 11px; }
  .token-rail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 22px; border-top: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); }
  .token-cell { padding: 13px 0; }
  .token-cell:nth-child(even) { padding-left: 16px; border-left: 1px solid var(--line-soft); }
  .token-cell:nth-child(n + 3) { border-top: 1px solid var(--line-soft); }
  .token-label { display: block; color: var(--text-tertiary); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
  .token-value { display: block; margin-top: 3px; font-family: var(--font-mono); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .mix-list { display: grid; gap: 9px; margin-top: 18px; }
  .mix-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; color: var(--text-secondary); font-size: 11px; }
  .mix-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mix-value { color: var(--text-tertiary); font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
  .lineage-rail { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
  .lineage-tag {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 8px;
    border: 1px solid color-mix(in srgb, var(--tag-color, var(--text-tertiary)) 24%, transparent);
    border-radius: 5px;
    background: color-mix(in srgb, var(--tag-color, var(--text-tertiary)) 8%, transparent);
    color: var(--tag-color, var(--text-secondary));
    font-size: 10px;
    font-weight: 600;
  }
  .lineage-continuation { --tag-color: var(--success); }
  .lineage-compaction { --tag-color: var(--warning); }
  .lineage-undo { --tag-color: var(--exchange); }
  .lineage-diverged { --tag-color: var(--danger); }
  .lineage-new { --tag-color: var(--text-tertiary); }

  .details-panel { margin-bottom: 16px; border: 1px solid var(--line-soft); border-radius: 10px; background: var(--panel); }
  .details-panel summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 52px;
    padding: 0 18px;
    cursor: pointer;
    list-style: none;
    font-size: 13px;
    font-weight: 650;
  }
  .details-panel summary::-webkit-details-marker { display: none; }
  .details-panel summary::after { color: var(--text-tertiary); content: "+"; font-family: var(--font-mono); font-size: 16px; }
  .details-panel[open] summary::after { content: "−"; }
  .details-body { padding: 0 16px 16px; }

  .section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 14px;
  }
  .section-title { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: -0.02em; }
  .section-copy { margin: 4px 0 0; color: var(--text-tertiary); font-size: 12px; }
  .scroll-hint { display: none; color: var(--text-tertiary); font-size: 10px; }
  .legend { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; color: var(--text-tertiary); font-size: 10px; }
  .legend-item { display: inline-flex; align-items: center; gap: 5px; }
  .legend-dot { width: 14px; height: 4px; border-radius: 1px; background: var(--dot-color); }
  .legend-dot.queue { --dot-color: var(--telemetry-queue); }
  .legend-dot.proxy { --dot-color: var(--telemetry-proxy); }
  .legend-dot.ttfb { --dot-color: var(--telemetry-ttfb); }
  .legend-dot.response { --dot-color: var(--telemetry-upstream); }

  .table-region {
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid var(--line-soft);
    border-radius: 10px;
    background: var(--panel);
    overscroll-behavior-inline: contain;
    scrollbar-width: thin;
  }
  table { width: 100%; border-collapse: collapse; color: var(--text-secondary); font-size: 12px; }
  caption { text-align: left; }
  th {
    padding: 11px 12px;
    border-bottom: 1px solid var(--line);
    background: var(--panel-inset);
    color: var(--text-tertiary);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.07em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }
  td { padding: 10px 12px; border-top: 1px solid var(--line-soft); font-variant-numeric: tabular-nums; vertical-align: middle; }
  tbody tr:first-child td { border-top: 0; }
  tbody tr:hover td { background: color-mix(in srgb, var(--brand) 4%, transparent); }
  .percentile-table { min-width: 680px; }
  .requests-table { min-width: 1420px; }
  .logs-table { min-width: 720px; }
  .phase-name { display: inline-flex; align-items: center; gap: 7px; color: var(--text-primary); font-weight: 600; }
  .phase-dot { width: 7px; height: 7px; border-radius: 2px; background: var(--phase-color); }
  .phase-dot.queue { --phase-color: var(--telemetry-queue); }
  .phase-dot.proxy { --phase-color: var(--telemetry-proxy); }
  .phase-dot.ttfb { --phase-color: var(--telemetry-ttfb); }
  .phase-dot.upstream { --phase-color: var(--telemetry-upstream); }
  .phase-dot.total { --phase-color: var(--telemetry-total); }
  .mono { font-family: var(--font-mono); font-size: 11px; font-variant-numeric: tabular-nums; }
  .status-ok { color: var(--success); }
  .status-err { max-width: 220px; color: var(--danger); overflow-wrap: anywhere; }
  .subline { display: block; margin-top: 3px; color: var(--text-tertiary); font-size: 9px; }
  .source-line { color: var(--info); }
  .tool-line { color: var(--exchange); }
  .tool-discovery { color: var(--success); }
  .cache-good { color: var(--success); }
  .cache-partial { color: var(--warning); }
  .cache-low { color: var(--danger); }
  .waterfall { display: flex; align-items: center; width: 240px; height: 16px; overflow: hidden; border-radius: 3px; background: var(--panel-inset); }
  .waterfall-seg { height: 100%; min-width: 2px; }
  .waterfall-seg.queue { background: var(--telemetry-queue); }
  .waterfall-seg.overhead { background: var(--telemetry-proxy); }
  .waterfall-seg.ttfb { background: var(--telemetry-ttfb); }
  .waterfall-seg.response { background: var(--telemetry-upstream); }

  .filter-bar { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
  .log-filter {
    --filter-color: var(--text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 11px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--panel);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .log-filter:hover { border-color: var(--line-strong); color: var(--text-primary); }
  .log-filter.active { border-color: color-mix(in srgb, var(--filter-color) 55%, var(--line)); background: color-mix(in srgb, var(--filter-color) 10%, transparent); color: var(--filter-color); }
  .log-filter .tab-badge { min-width: 20px; line-height: 17px; }
  .filter-session { --filter-color: var(--info); }
  .filter-lineage { --filter-color: var(--exchange); }
  .filter-error { --filter-color: var(--danger); }
  .filter-token { --filter-color: var(--warning); }
  .log-level { color: var(--level-color); }
  .level-info { --level-color: var(--success); }
  .level-warn { --level-color: var(--warning); }
  .level-error { --level-color: var(--danger); }
  .log-category { color: var(--category-color); }
  .category-session { --category-color: var(--info); }
  .category-lineage { --category-color: var(--exchange); }
  .category-error { --category-color: var(--danger); }
  .category-token { --category-color: var(--warning); }
  .category-lifecycle { --category-color: var(--text-tertiary); }
  .log-message { min-width: 360px; overflow-wrap: anywhere; }

  .usage-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 14px; }
  .usage-card { --meter-color: var(--success); min-width: 0; padding: 20px; border: 1px solid var(--line-soft); border-radius: 10px; background: var(--panel); }
  .usage-card.warn { --meter-color: var(--warning); }
  .usage-card.high,
  .usage-card.pace-over { --meter-color: var(--danger); }
  .usage-card.pace-ahead { --meter-color: var(--warning); }
  .usage-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .usage-card-title { color: var(--text-tertiary); font-size: 10px; font-weight: 650; letter-spacing: 0.08em; text-transform: uppercase; }
  .usage-card-reset { color: var(--text-tertiary); font-size: 10px; white-space: nowrap; }
  .usage-card-pct { margin-top: 13px; color: var(--meter-color); font-size: 36px; font-weight: 650; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
  .usage-card-pct span { color: var(--text-tertiary); font-size: 15px; font-weight: 500; }
  .usage-bar { position: relative; height: 8px; margin-top: 15px; border-radius: 999px; background: var(--panel-inset); }
  .usage-bar-fill { height: 100%; max-width: 100%; border-radius: inherit; background: var(--meter-color); }
  .usage-bar-marker { position: absolute; top: -3px; bottom: -3px; width: 2px; border-radius: 1px; background: var(--text-primary); opacity: 0.55; }
  .usage-card-sub { min-height: 18px; margin-top: 11px; color: var(--text-tertiary); font-size: 11px; }
  .usage-card .pace-pill { margin-top: 13px; }
  .usage-note { color: var(--text-tertiary); font-size: 10px; }

  .empty-state {
    display: grid;
    justify-items: center;
    gap: 8px;
    min-height: 220px;
    padding: 52px 20px;
    border: 1px dashed var(--line);
    border-radius: 10px;
    color: var(--text-secondary);
    text-align: center;
  }
  .empty-state.compact { min-height: 0; padding: 28px 20px; border: 0; }
  .empty-title { color: var(--text-primary); font-size: 14px; font-weight: 650; }
  .empty-copy { max-width: 440px; color: var(--text-tertiary); font-size: 12px; text-wrap: pretty; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 940px) {
    .page-head { align-items: start; flex-direction: column; gap: 20px; }
    .refresh-bar { justify-content: flex-start; }
    .refresh-indicator { text-align: left; }
    .overview-grid,
    .overview-lower { grid-template-columns: minmax(0, 1fr); }
    .usage-cards { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .telemetry-shell { padding: 24px 16px 40px; }
    .page-head { margin-bottom: 22px; }
    .subtitle { font-size: 13px; }
    .refresh-bar { display: grid; grid-template-columns: minmax(0, 1fr) auto; width: 100%; }
    .window-field { display: grid; grid-template-columns: auto minmax(0, 1fr); }
    .control { min-width: 0; width: 100%; }
    .auto-toggle { grid-column: 1 / -1; justify-content: center; }
    .refresh-indicator { grid-column: 1 / -1; }
    .tabs-viewport { margin-right: -16px; margin-left: -16px; padding-inline: 8px; }
    .tabs { min-width: max-content; }
    .tab { padding-inline: 12px; }
    .panel-head { padding: 16px 16px 0; }
    .pulse-lead { align-items: start; flex-direction: column; padding: 22px 16px 18px; }
    .metric-lattice { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .metric-cell { border-top: 1px solid var(--line-soft); }
    .metric-cell:nth-child(odd) { border-left: 0; }
    .metric-cell:first-child,
    .metric-cell:nth-child(2) { border-top: 0; }
    .metric-cell:last-child { grid-column: 1 / -1; }
    .capacity-body { padding: 18px 16px; }
    .capacity-footer { padding-inline: 16px; }
    .activity-list { padding-inline: 16px; }
    .activity-item { gap: 10px; }
    .panel-footer { padding-inline: 16px; }
    .context-body { padding: 20px 16px 16px; }
    .section-head { align-items: start; flex-direction: column; gap: 10px; }
    .legend { justify-content: flex-start; }
    .scroll-hint { display: block; }
    .details-body { padding-inline: 10px; }
    .usage-card { padding: 18px 16px; }
    .filter-bar { flex-wrap: nowrap; max-width: 100%; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
    .log-filter { flex: 0 0 auto; }
  }
  @media (prefers-reduced-motion: reduce) {
    .button { transition: none; }
  }
` + profileBarCss + `
</style>
</head>
<body>
` + profileBarHtml + `
<main class="telemetry-shell">
  <header class="page-head">
    <div class="page-title-group">
      <div class="eyebrow"><span class="seam-glyph" aria-hidden="true"></span>Operations instrument</div>
      <h1>Telemetry</h1>
      <p class="subtitle">Capacity, latency, and request flow across the Meridian protocol seam.</p>
    </div>
    <div class="refresh-bar" aria-label="Telemetry controls">
      <label class="window-field" for="window">
        <span class="field-label">Window</span>
        <select class="control" id="window">
          <option value="300000">Last 5 min</option>
          <option value="900000">Last 15 min</option>
          <option value="3600000" selected>Last 1 hour</option>
          <option value="86400000">Last 24 hours</option>
        </select>
      </label>
      <button class="button" id="refreshButton" type="button">Refresh</button>
      <label class="auto-toggle" for="autoRefresh"><input type="checkbox" id="autoRefresh" checked> Auto refresh</label>
      <span class="refresh-indicator" id="lastUpdate" role="status" aria-live="polite"></span>
    </div>
  </header>

  <div id="content" aria-busy="true">
    <div class="empty-state"><div class="empty-title">Loading telemetry</div><div class="empty-copy">Reading recent request and capacity signals.</div></div>
  </div>
</main>

<script>
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
let timer;
let refreshing = false;
let activeTab = 'overview';
let activeLogFilter = 'all';

function esc(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

function ms(value) {
  if (value == null || !isFinite(value)) return '—';
  if (value < 1000) return Math.round(value) + 'ms';
  return (value / 1000).toFixed(1) + 's';
}

function ago(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return seconds + 's ago';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  return Math.floor(seconds / 3600) + 'h ago';
}

function formatTokens(value) {
  const number = Number(value) || 0;
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
  if (number >= 1000) return Math.round(number / 1000) + 'k';
  return String(number);
}

function pctRow(label, phaseClass, phase) {
  return '<tr>'
    + '<td><span class="phase-name"><span class="phase-dot ' + phaseClass + '"></span>' + label + '</span></td>'
    + '<td class="mono">' + ms(phase.p50) + '</td>'
    + '<td class="mono">' + ms(phase.p95) + '</td>'
    + '<td class="mono">' + ms(phase.p99) + '</td>'
    + '<td class="mono">' + ms(phase.min) + '</td>'
    + '<td class="mono">' + ms(phase.max) + '</td>'
    + '<td class="mono">' + ms(phase.avg) + '</td>'
    + '</tr>';
}

function tabButton(tab, label, badge) {
  const selected = activeTab === tab;
  return '<button type="button" class="tab' + (selected ? ' active' : '') + '" role="tab" id="tab-' + tab + '"'
    + ' aria-selected="' + selected + '" aria-controls="panel-' + tab + '" tabindex="' + (selected ? '0' : '-1') + '" data-tab-target="' + tab + '">'
    + label + (badge == null ? '' : '<span class="tab-badge">' + badge + '</span>') + '</button>';
}

function panelStart(tab) {
  const selected = activeTab === tab;
  return '<section id="panel-' + tab + '" class="tab-panel' + (selected ? ' active' : '') + '" role="tabpanel" aria-labelledby="tab-' + tab + '"' + (selected ? '' : ' hidden') + '>';
}

function switchTab(tab) {
  activeTab = tab;
  $$('.tab').forEach(function(button) {
    const selected = button.dataset.tabTarget === tab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  $$('.tab-panel').forEach(function(panel) {
    const selected = panel.id === 'panel-' + tab;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
}

function setLogFilter(filter) {
  activeLogFilter = filter;
  $$('.log-filter').forEach(function(button) {
    const selected = button.dataset.logFilter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $$('.log-row').forEach(function(row) {
    row.hidden = filter !== 'all' && row.dataset.category !== filter;
  });
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  const content = $('#content');
  const button = $('#refreshButton');
  const windowMs = $('#window').value;
  content.setAttribute('aria-busy', 'true');
  button.disabled = true;
  try {
    const results = await Promise.all([
      fetch('/telemetry/summary?window=' + windowMs).then(function(response) { return response.json(); }),
      fetch('/telemetry/requests?limit=50&since=' + (Date.now() - Number(windowMs))).then(function(response) { return response.json(); }),
      fetch('/telemetry/logs?limit=200&since=' + (Date.now() - Number(windowMs))).then(function(response) { return response.json(); }),
      fetch('/v1/usage/quota').then(function(response) { return response.json(); }).catch(function() { return null; }),
    ]);
    render(results[0], results[1], results[2], results[3]);
    $('#lastUpdate').textContent = 'Updated ' + new Date().toLocaleTimeString();
  } catch (error) {
    content.innerHTML = '<div class="empty-state"><div class="empty-title">Telemetry is unavailable</div>'
      + '<div class="empty-copy">The dashboard could not read the latest signals. Existing proxy traffic is unaffected.</div>'
      + '<button class="button" type="button" data-refresh>Try again</button></div>';
    $('#lastUpdate').textContent = 'Update failed';
  } finally {
    content.setAttribute('aria-busy', 'false');
    button.disabled = false;
    refreshing = false;
  }
}

function render(summary, requests, logs, quota) {
  const hasUsage = quota && quota.buckets && quota.buckets.some(function(bucket) { return bucket.utilization != null; });
  if (summary.totalRequests === 0 && (!logs || logs.length === 0) && !hasUsage) {
    $('#content').innerHTML = '<div class="empty-state"><div class="empty-title">No signals in this window</div>'
      + '<div class="empty-copy">Send a request through the proxy, or choose a longer time window, to begin tracing performance.</div></div>';
    return;
  }

  const lineageCounts = {};
  for (const request of requests) {
    const type = request.lineageType || 'unknown';
    lineageCounts[type] = (lineageCounts[type] || 0) + 1;
  }
  const logCounts = { session: 0, lineage: 0, error: 0, token: 0 };
  for (const log of logs) {
    if (logCounts[log.category] !== undefined) logCounts[log.category]++;
  }

  let html = '<div class="tabs-viewport"><div class="tabs" role="tablist" aria-label="Telemetry views">'
    + tabButton('overview', 'Overview')
    + tabButton('requests', 'Requests', requests.length)
    + tabButton('logs', 'Logs', logs.length)
    + tabButton('usage', 'Usage')
    + '</div></div>';

  html += panelStart('overview');
  html += renderOverview(summary, requests, quota, lineageCounts);
  html += '</section>';

  html += panelStart('requests');
  html += renderRequests(requests);
  html += '</section>';

  html += panelStart('logs');
  html += renderLogs(logs, logCounts);
  html += '</section>';

  html += panelStart('usage');
  html += '<div class="section-head"><div><h2 class="section-title">Usage detail</h2><p class="section-copy">Current capacity and weekly consumption pace for the active profile.</p></div></div>';
  html += renderUsage(quota);
  html += '</section>';

  $('#content').innerHTML = html;
}

function renderOverview(summary, requests, quota, lineageCounts) {
  const errorRate = summary.totalRequests > 0 ? (summary.errorCount / summary.totalRequests) * 100 : 0;
  const statusLabel = summary.errorCount > 0 ? errorRate.toFixed(1) + '% error rate' : 'No errors in window';
  const statusClass = summary.errorCount > 0 ? ' error' : '';
  let html = '<div class="overview-grid">'
    + '<section class="panel pulse-panel" aria-labelledby="request-pulse-title">'
    + '<div class="panel-head"><div><div class="panel-kicker">Current window</div><h2 class="panel-title" id="request-pulse-title">Request pulse</h2></div>'
    + '<span class="status-chip' + statusClass + '">' + statusLabel + '</span></div>'
    + '<div class="pulse-lead"><div><span class="pulse-value">' + summary.totalRequests + '</span><span class="pulse-label">requests crossed the seam</span></div>'
    + '<div class="pulse-rate">' + summary.requestsPerMinute.toFixed(1) + ' req/min</div></div>'
    + '<div class="metric-lattice">'
    + metricCell('Median total', ms(summary.totalDuration.p50), 'p95 ' + ms(summary.totalDuration.p95))
    + metricCell('Median TTFB', ms(summary.ttfb.p50), 'p95 ' + ms(summary.ttfb.p95))
    + metricCell('Proxy overhead', ms(summary.proxyOverhead.p50), 'p95 ' + ms(summary.proxyOverhead.p95))
    + metricCell('Queue wait', ms(summary.queueWait.p50), 'p95 ' + ms(summary.queueWait.p95))
    + metricCell('Errors', String(summary.errorCount), errorRate.toFixed(1) + '% of requests')
    + '</div></section>'
    + renderCapacityOverview(quota)
    + '</div>';

  html += '<div class="overview-lower">'
    + renderRecentRequests(requests)
    + renderContextPanel(summary.tokenUsage, summary.byModel, lineageCounts)
    + '</div>';

  html += '<details class="details-panel"><summary>Latency percentiles</summary><div class="details-body">'
    + '<div class="table-region" role="region" aria-label="Latency percentile table" tabindex="0">'
    + '<table class="percentile-table"><caption class="sr-only">Latency percentiles by request phase</caption>'
    + '<thead><tr><th>Phase</th><th>p50</th><th>p95</th><th>p99</th><th>Min</th><th>Max</th><th>Avg</th></tr></thead><tbody>'
    + pctRow('Queue wait', 'queue', summary.queueWait)
    + pctRow('Proxy overhead', 'proxy', summary.proxyOverhead)
    + pctRow('TTFB', 'ttfb', summary.ttfb)
    + pctRow('Upstream', 'upstream', summary.upstreamDuration)
    + pctRow('Total', 'total', summary.totalDuration)
    + '</tbody></table></div></div></details>';
  return html;
}

function metricCell(label, value, detail) {
  return '<div class="metric-cell"><span class="metric-label">' + label + '</span><span class="metric-value">' + value + '</span>'
    + '<span class="metric-detail">' + detail + '</span></div>';
}

function renderCapacityOverview(quota) {
  if (!quota || !quota.buckets) {
    return '<section class="panel" aria-labelledby="capacity-title"><div class="panel-head"><div><div class="panel-kicker">Active profile</div>'
      + '<h2 class="panel-title" id="capacity-title">Capacity</h2><p class="panel-note">Usage data unavailable</p></div></div>'
      + '<div class="empty-state compact"><div class="empty-copy">Capacity will appear when Anthropic reports a quota snapshot.</div></div></section>';
  }
  const buckets = {};
  quota.buckets.forEach(function(bucket) { buckets[bucket.type] = bucket; });
  const session = buckets.five_hour;
  const weekly = buckets.seven_day;
  const hasData = (session && session.utilization != null) || (weekly && weekly.utilization != null);
  if (!hasData) {
    return '<section class="panel" aria-labelledby="capacity-title"><div class="panel-head"><div><div class="panel-kicker">Active profile</div>'
      + '<h2 class="panel-title" id="capacity-title">Capacity</h2><p class="panel-note">No usage recorded yet</p></div></div>'
      + '<div class="empty-state compact"><div class="empty-copy">Usage begins after the first request through Meridian.</div></div></section>';
  }
  const pace = paceInfo(weekly);
  let html = '<section class="panel" aria-labelledby="capacity-title"><div class="panel-head"><div><div class="panel-kicker">Active profile</div>'
    + '<h2 class="panel-title" id="capacity-title">Capacity</h2><p class="panel-note">' + (quota.profile ? esc(quota.profile) : 'Current credentials') + '</p></div></div>'
    + '<div class="capacity-body"><div class="capacity-list">'
    + compactCapacityRow('5-hour window', session)
    + compactCapacityRow('7-day window', weekly)
    + '</div>';
  if (pace) {
    html += '<div class="pace-line"><span class="pace-label">Weekly consumption pace</span><span class="pace-pill ' + pace.pill + '">' + pace.label + '</span></div>';
  }
  html += '</div><div class="capacity-footer"><button class="button subtle" type="button" data-tab-target="usage">View usage detail</button></div></section>';
  return html;
}

function compactCapacityRow(title, bucket) {
  if (!bucket || bucket.utilization == null) {
    return '<div class="capacity-row"><div class="capacity-meta"><span class="capacity-title">' + title + '</span><span class="capacity-reset">No data</span></div>'
      + '<div class="capacity-value">—</div></div>';
  }
  const value = pct(bucket.utilization);
  const cls = classifyUtil(bucket.utilization);
  return '<div class="capacity-row ' + cls + '"><div class="capacity-meta"><span class="capacity-title">' + title + '</span>'
    + '<span class="capacity-reset">' + resetIn(bucket.resetsAt) + '</span></div>'
    + '<div class="capacity-value">' + value + '<span>% used</span></div>'
    + '<progress class="usage-progress" max="100" value="' + Math.min(100, value) + '" aria-label="' + title + ' usage">' + value + '%</progress></div>';
}

function renderRecentRequests(requests) {
  let html = '<section class="panel" aria-labelledby="recent-title"><div class="panel-head"><div><div class="panel-kicker">Live trace</div>'
    + '<h2 class="panel-title" id="recent-title">Recent traffic</h2><p class="panel-note">Newest requests in the selected window</p></div></div>';
  if (!requests.length) {
    html += '<div class="empty-state compact"><div class="empty-copy">No requests in this window.</div></div></section>';
    return html;
  }
  html += '<ol class="activity-list">';
  requests.slice(0, 6).forEach(function(request) {
    const model = request.requestModel || request.model || 'Unknown model';
    const status = request.error ? 'Error' : request.status;
    const tokenTotal = request.inputTokens == null ? null : (Number(request.inputTokens) || 0) + (Number(request.outputTokens) || 0);
    html += '<li class="activity-item"><div class="activity-main"><div class="activity-title"><span class="activity-model">' + esc(model) + '</span>'
      + '<span class="request-status' + (request.error ? ' error' : '') + '">' + esc(status) + '</span></div>'
      + '<div class="activity-meta">' + ago(request.timestamp) + ' · ' + esc(request.adapter || 'default') + ' · ' + esc(request.mode) + '</div></div>'
      + '<div class="activity-values"><span class="activity-duration">' + ms(request.totalDurationMs) + '</span>'
      + '<span class="activity-token">' + (tokenTotal == null ? 'tokens —' : formatTokens(tokenTotal) + ' tokens') + '</span></div></li>';
  });
  html += '</ol><div class="panel-footer"><button class="button subtle" type="button" data-tab-target="requests">Open request trace</button></div></section>';
  return html;
}

function renderContextPanel(tokenUsage, byModel, lineageCounts) {
  let html = '<section class="panel" aria-labelledby="context-title"><div class="panel-head"><div><div class="panel-kicker">Context economy</div>'
    + '<h2 class="panel-title" id="context-title">Tokens and cache</h2></div></div><div class="context-body">';
  if (tokenUsage) {
    html += '<div class="cache-lead"><div><div class="cache-value">' + (tokenUsage.avgCacheHitRate * 100).toFixed(0) + '%</div>'
      + '<div class="cache-caption">average cache hit rate</div></div>'
      + (tokenUsage.cacheMissOnResumeCount > 0 ? '<span class="status-chip error">' + tokenUsage.cacheMissOnResumeCount + ' resume miss' + (tokenUsage.cacheMissOnResumeCount === 1 ? '' : 'es') + '</span>' : '') + '</div>'
      + '<div class="token-rail">'
      + tokenCell('Input', tokenUsage.totalInputTokens)
      + tokenCell('Output', tokenUsage.totalOutputTokens)
      + tokenCell('Cache read', tokenUsage.totalCacheReadTokens)
      + tokenCell('Cache write', tokenUsage.totalCacheCreationTokens)
      + '</div>';
  } else {
    html += '<div class="empty-state compact"><div class="empty-copy">Token metrics have not been recorded in this window.</div></div>';
  }

  const models = Object.entries(byModel || {});
  if (models.length) {
    html += '<div class="mix-list" aria-label="Model mix">';
    models.slice(0, 4).forEach(function(entry) {
      html += '<div class="mix-row"><span class="mix-name">' + esc(entry[0]) + '</span><span class="mix-value">' + entry[1].count + ' req · ' + ms(entry[1].avgTotalMs) + ' avg</span></div>';
    });
    html += '</div>';
  }

  const lineages = Object.entries(lineageCounts);
  if (lineages.length) {
    html += '<div class="lineage-rail" aria-label="Session lineage">';
    lineages.forEach(function(entry) {
      html += '<span class="lineage-tag ' + lineageClass(entry[0]) + '">' + esc(entry[0]) + ' · ' + entry[1] + '</span>';
    });
    html += '</div>';
  }
  html += '</div></section>';
  return html;
}

function tokenCell(label, value) {
  return '<div class="token-cell"><span class="token-label">' + label + '</span><span class="token-value">' + formatTokens(value) + '</span></div>';
}

function lineageClass(type) {
  return ['continuation', 'compaction', 'undo', 'diverged', 'new'].includes(type) ? 'lineage-' + type : '';
}

function renderRequests(requests) {
  let html = '<div class="section-head"><div><h2 class="section-title">Request trace</h2><p class="section-copy">Per-request timing, lineage, tools, tokens, and cache behavior.</p>'
    + '<span class="scroll-hint">Scroll horizontally to inspect every phase.</span></div>'
    + '<div class="legend" aria-label="Waterfall legend">'
    + '<span class="legend-item"><span class="legend-dot queue"></span>Queue</span>'
    + '<span class="legend-item"><span class="legend-dot proxy"></span>Proxy</span>'
    + '<span class="legend-item"><span class="legend-dot ttfb"></span>TTFB</span>'
    + '<span class="legend-item"><span class="legend-dot response"></span>Response</span></div></div>';
  if (!requests.length) {
    return html + '<div class="empty-state"><div class="empty-title">No requests in this window</div><div class="empty-copy">Choose a longer window or send a new request through the proxy.</div></div>';
  }
  html += '<div class="table-region" role="region" aria-label="Detailed request trace table" tabindex="0">'
    + '<table class="requests-table"><caption class="sr-only">Detailed request telemetry</caption><thead><tr><th>Time</th><th>Adapter</th><th>Model</th><th>Mode</th>'
    + '<th>Session</th><th>Status</th><th>Queue</th><th>Proxy</th><th>TTFB</th><th>Total</th><th>Tokens</th><th>Cache</th><th>Waterfall</th></tr></thead><tbody>';

  const maxTotal = Math.max.apply(null, requests.map(function(request) { return request.totalDurationMs; }).concat([1]));
  requests.forEach(function(request) {
    const scale = 240 / maxTotal;
    const queueWidth = Math.max(request.queueWaitMs * scale, 2);
    const overheadWidth = Math.max((request.proxyOverheadMs || 0) * scale, 0);
    const ttfbWidth = Math.max((request.ttfbMs || 0) * scale, 0);
    const responseWidth = Math.max((request.upstreamDurationMs - (request.ttfbMs || 0)) * scale, 2);
    const lineageBadge = request.lineageType
      ? '<span class="lineage-tag ' + lineageClass(request.lineageType) + '">' + esc(request.lineageType) + '</span>'
      : '';
    const sessionShort = request.sdkSessionId ? request.sdkSessionId.slice(0, 8) : '—';
    const messageCount = request.messageCount != null ? request.messageCount : '?';
    const sourceLine = request.requestSource ? '<span class="subline source-line">' + esc(request.requestSource) + '</span>' : '';
    let toolLines = '';
    if (request.hasDeferredTools) {
      const sessionDiscovered = request.sessionDiscoveredCount || 0;
      const loaded = ((request.toolCount || 0) - (request.deferredToolCount || 0)) + sessionDiscovered;
      const deferred = Math.max(0, (request.deferredToolCount || 0) - sessionDiscovered);
      toolLines += '<span class="subline tool-line">loaded=' + loaded + ' deferred=' + deferred + '</span>';
      const discovered = request.discoveredTools || [];
      if (discovered.length) toolLines += '<span class="subline tool-discovery">+' + discovered.map(esc).join(', +') + '</span>';
    }
    const cacheClass = request.cacheHitRate > 0.5 ? 'cache-good' : request.cacheHitRate > 0 ? 'cache-partial' : 'cache-low';
    html += '<tr>'
      + '<td class="mono">' + ago(request.timestamp) + '</td>'
      + '<td>' + esc(request.adapter || '—') + sourceLine + '</td>'
      + '<td>' + esc(request.requestModel || request.model) + '<span class="subline">' + esc(request.model) + '</span></td>'
      + '<td>' + esc(request.mode) + toolLines + '</td>'
      + '<td class="mono">' + esc(sessionShort) + ' ' + lineageBadge + '<span class="subline">' + messageCount + ' msgs</span></td>'
      + '<td class="' + (request.error ? 'status-err' : 'status-ok') + '">' + esc(request.error || request.status) + '</td>'
      + '<td class="mono">' + ms(request.queueWaitMs) + '</td>'
      + '<td class="mono">' + ms(request.proxyOverheadMs) + '</td>'
      + '<td class="mono">' + ms(request.ttfbMs) + '</td>'
      + '<td class="mono">' + ms(request.totalDurationMs) + '</td>'
      + '<td class="mono">' + (request.inputTokens != null ? formatTokens(request.inputTokens) + ' in<span class="subline">' + formatTokens(request.outputTokens) + ' out</span>' : '—') + '</td>'
      + '<td class="mono">' + (request.cacheHitRate != null ? '<span class="' + cacheClass + '">' + Math.round(request.cacheHitRate * 100) + '%</span>' : '—') + '</td>'
      + '<td><div class="waterfall" aria-label="Request phase waterfall">'
      + '<span class="waterfall-seg queue" style="width:' + queueWidth + 'px"></span>'
      + '<span class="waterfall-seg overhead" style="width:' + overheadWidth + 'px"></span>'
      + '<span class="waterfall-seg ttfb" style="width:' + ttfbWidth + 'px"></span>'
      + '<span class="waterfall-seg response" style="width:' + responseWidth + 'px"></span>'
      + '</div></td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function renderLogs(logs, counts) {
  let html = '<div class="section-head"><div><h2 class="section-title">Diagnostic log</h2><p class="section-copy">Session lifecycle, lineage, token, and error events.</p>'
    + '<span class="scroll-hint">Scroll horizontally to inspect full messages.</span></div></div>'
    + '<div class="filter-bar" role="group" aria-label="Filter diagnostic logs">'
    + logFilterButton('all', 'All', logs.length, '')
    + logFilterButton('session', 'Session', counts.session, 'filter-session')
    + logFilterButton('lineage', 'Lineage', counts.lineage, 'filter-lineage')
    + logFilterButton('error', 'Error', counts.error, 'filter-error')
    + logFilterButton('token', 'Token', counts.token, 'filter-token')
    + '</div>';
  if (!logs.length) {
    return html + '<div class="empty-state"><div class="empty-title">No diagnostic logs</div><div class="empty-copy">There are no diagnostic events in the selected time window.</div></div>';
  }
  html += '<div class="table-region" role="region" aria-label="Diagnostic log table" tabindex="0">'
    + '<table class="logs-table"><caption class="sr-only">Diagnostic log events</caption><thead><tr><th>Time</th><th>Level</th><th>Category</th><th>Message</th></tr></thead><tbody>';
  logs.forEach(function(log) {
    const visible = activeLogFilter === 'all' || log.category === activeLogFilter;
    html += '<tr class="log-row" data-category="' + esc(log.category) + '"' + (visible ? '' : ' hidden') + '>'
      + '<td class="mono">' + ago(log.timestamp) + '</td>'
      + '<td><span class="log-level level-' + esc(log.level) + '">' + esc(log.level) + '</span></td>'
      + '<td><span class="log-category category-' + esc(log.category) + '">' + esc(log.category) + '</span></td>'
      + '<td class="mono log-message">' + esc(log.message) + '</td></tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function logFilterButton(filter, label, count, className) {
  const selected = activeLogFilter === filter;
  return '<button type="button" class="log-filter ' + className + (selected ? ' active' : '') + '" data-log-filter="' + filter + '" aria-pressed="' + selected + '">'
    + label + '<span class="tab-badge">' + count + '</span></button>';
}

function classifyUtil(utilization) {
  if (utilization == null || !isFinite(utilization)) return '';
  if (utilization >= 0.85) return 'high';
  if (utilization >= 0.6) return 'warn';
  return '';
}

function resetIn(resetsAt) {
  if (resetsAt == null || !isFinite(resetsAt)) return '';
  const remaining = resetsAt - Date.now();
  if (remaining <= 0) return 'resetting…';
  const minutes = Math.floor(remaining / 60000);
  if (minutes < 60) return 'resets in ' + Math.max(1, minutes) + 'm';
  const hours = Math.floor(minutes / 60);
  const extraMinutes = minutes % 60;
  if (hours < 24) return 'resets in ' + hours + 'h' + (extraMinutes ? ' ' + extraMinutes + 'm' : '');
  const days = Math.floor(hours / 24);
  const extraHours = hours % 24;
  return 'resets in ' + days + 'd' + (extraHours ? ' ' + extraHours + 'h' : '');
}

function pct(utilization) {
  return Math.round(Math.max(0, utilization) * 100);
}

function paceInfo(weekly) {
  if (!weekly || weekly.utilization == null || weekly.resetsAt == null) return null;
  const week = 7 * 86400000;
  const start = weekly.resetsAt - week;
  const elapsed = Math.max(0, Math.min(1, (Date.now() - start) / week));
  const actual = pct(weekly.utilization);
  const expected = Math.round(elapsed * 100);
  const delta = actual - expected;
  const projected = elapsed >= 0.1 ? Math.round((Math.max(0, weekly.utilization) / elapsed) * 100) : null;
  let pill = 'on';
  let label = 'On pace';
  if (delta > 7) { pill = 'ahead'; label = '+' + delta + '% ahead of pace'; }
  else if (delta < -7) { pill = 'under'; label = Math.abs(delta) + '% under pace'; }
  if (projected != null && projected >= 100) { pill = 'over'; label = 'On track to run out'; }
  return { elapsed: elapsed, actual: actual, expected: expected, projected: projected, pill: pill, label: label };
}

function usageCard(title, bucket) {
  if (!bucket || bucket.utilization == null) {
    return '<div class="usage-card"><div class="usage-card-head"><span class="usage-card-title">' + title + '</span></div>'
      + '<div class="usage-card-pct"><span>—</span></div><div class="usage-card-sub">No data yet</div></div>';
  }
  const utilization = bucket.utilization;
  const value = pct(utilization);
  const fill = Math.min(100, value);
  return '<div class="usage-card ' + classifyUtil(utilization) + '">'
    + '<div class="usage-card-head"><span class="usage-card-title">' + title + '</span><span class="usage-card-reset">' + resetIn(bucket.resetsAt) + '</span></div>'
    + '<div class="usage-card-pct">' + value + '<span>%</span></div>'
    + '<div class="usage-bar" role="progressbar" aria-label="' + title + ' usage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + fill + '">'
    + '<div class="usage-bar-fill" style="width:' + fill + '%"></div></div>'
    + '<div class="usage-card-sub">of your ' + title.split('·')[1].trim() + ' allowance used</div></div>';
}

function paceCard(weekly) {
  const pace = paceInfo(weekly);
  if (!pace) {
    return '<div class="usage-card"><div class="usage-card-head"><span class="usage-card-title">Weekly pace</span></div>'
      + '<div class="usage-card-pct"><span>—</span></div><div class="usage-card-sub">Needs weekly usage data</div></div>';
  }
  const projected = pace.projected == null ? '—' : pace.projected + '%';
  return '<div class="usage-card pace-' + pace.pill + '">'
    + '<div class="usage-card-head"><span class="usage-card-title">Weekly pace</span><span class="usage-card-reset">' + Math.round(pace.elapsed * 100) + '% through week</span></div>'
    + '<span class="pace-pill ' + pace.pill + '">' + pace.label + '</span>'
    + '<div class="usage-bar" role="progressbar" aria-label="Weekly usage against even pace" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(100, pace.actual) + '">'
    + '<div class="usage-bar-fill" style="width:' + Math.min(100, pace.actual) + '%"></div>'
    + '<div class="usage-bar-marker" style="left:' + Math.min(100, pace.expected) + '%" title="Expected at even pace"></div></div>'
    + '<div class="usage-card-sub">' + pace.actual + '% used vs ' + pace.expected + '% expected · at this rate ~' + projected + ' by reset</div></div>';
}

function renderUsage(quota) {
  if (!quota || !quota.buckets) {
    return '<div class="empty-state"><div class="empty-title">Usage data unavailable</div><div class="empty-copy">Capacity will appear when Anthropic reports a quota snapshot.</div></div>';
  }
  const buckets = {};
  quota.buckets.forEach(function(bucket) { buckets[bucket.type] = bucket; });
  const session = buckets.five_hour;
  const weekly = buckets.seven_day;
  if ((!session || session.utilization == null) && (!weekly || weekly.utilization == null)) {
    return '<div class="empty-state"><div class="empty-title">No usage data yet</div><div class="empty-copy">Anthropic reports capacity after the first request through Meridian.</div></div>';
  }
  let html = '<div class="usage-cards">' + usageCard('Session · 5h', session) + usageCard('Weekly · 7d', weekly) + paceCard(weekly) + '</div>';
  const asOf = quota.asOf ? new Date(quota.asOf).toLocaleTimeString() : '';
  html += '<div class="usage-note">' + (quota.profile ? 'Profile: ' + esc(quota.profile) + ' · ' : '')
    + 'Reported by Anthropic' + (asOf ? ' · as of ' + asOf : '') + '</div>';
  return html;
}

$('#content').addEventListener('click', function(event) {
  const tabTarget = event.target.closest('[data-tab-target]');
  if (tabTarget) {
    switchTab(tabTarget.dataset.tabTarget);
    const tab = $('#tab-' + tabTarget.dataset.tabTarget);
    if (tabTarget.classList.contains('tab')) tab.focus();
    return;
  }
  const logFilter = event.target.closest('[data-log-filter]');
  if (logFilter) {
    setLogFilter(logFilter.dataset.logFilter);
    return;
  }
  if (event.target.closest('[data-refresh]')) refresh();
});

$('#content').addEventListener('keydown', function(event) {
  const current = event.target.closest('.tab');
  if (!current || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = Array.from($$('.tab'));
  const index = tabs.indexOf(current);
  let next = index;
  if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = tabs.length - 1;
  event.preventDefault();
  tabs[next].click();
  tabs[next].focus();
});

function syncAutoRefresh() {
  clearInterval(timer);
  if ($('#autoRefresh').checked) timer = setInterval(refresh, 5000);
}

$('#refreshButton').addEventListener('click', refresh);
$('#autoRefresh').addEventListener('change', syncAutoRefresh);
$('#window').addEventListener('change', refresh);

refresh();
syncAutoRefresh();
` + profileBarJs + `
</script>
</body>
</html>`
