import { faviconDataUri } from "./brand"

/** Semantic Protocol Seam tokens. Light and dark share one hierarchy. */
export const themeCss = `
  :root {
    color-scheme: light;
    --canvas: #F3EFE6;
    --panel: #FCFAF5;
    --panel-raised: #FFFFFF;
    --panel-inset: #ECE7DC;
    --control: #E4DED2;
    --line-soft: #E5DFD3;
    --line: #CEC7B9;
    --line-strong: #A9A194;
    --text-primary: #171A18;
    --text-secondary: #565D57;
    --text-tertiary: #626A64;
    --text-muted: #626A64;
    --brand: #1E5EFF;
    --brand-strong: #174BCB;
    --brand-ink: #174BCB;
    --brand-soft: #E5EBFF;
    --on-brand: #FFFFFF;
    --exchange: #DE5B36;
    --exchange-soft: #F9E7DF;
    --success: #2F7D61;
    --success-ink: #276A51;
    --success-soft: #E2F0E9;
    --warning: #9A6A16;
    --warning-ink: #865A10;
    --warning-soft: #F5ECD5;
    --danger: #B83A4D;
    --danger-ink: #B83A4D;
    --danger-soft: #F8E4E7;
    --info: #315CC6;
    --focus-ring: rgba(30, 94, 255, 0.28);
    --shadow-raised: 0 12px 32px rgba(35, 31, 24, 0.07);
    --font-sans: "Instrument Sans", "Avenir Next", Avenir, "Segoe UI", sans-serif;
    --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;

    /* Backward-compatible aliases used by the server-rendered pages. */
    --bg: var(--canvas);
    --surface: var(--panel);
    --surface2: var(--panel-inset);
    --border: var(--line);
    --text: var(--text-primary);
    --muted: var(--text-tertiary);
    --accent: var(--brand);
    --accent2: var(--exchange);
    --violet: var(--brand);
    --lavender: var(--info);
    --green: var(--success);
    --yellow: var(--warning);
    --red: var(--danger);
    --blue: var(--brand);
    --purple: var(--exchange);
    --queue: var(--warning);
    --ttfb: var(--brand);
    --upstream: var(--success);
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
    --canvas: #111411;
    --panel: #171B18;
    --panel-raised: #1D221E;
    --panel-inset: #0C0F0D;
    --control: #242A25;
    --line-soft: #252B26;
    --line: #303832;
    --line-strong: #475148;
    --text-primary: #F2F0E8;
    --text-secondary: #BEC2B8;
    --text-tertiary: #9AA298;
    --text-muted: #8A928A;
    --brand: #5B82FF;
    --brand-strong: #83A0FF;
    --brand-ink: #83A0FF;
    --brand-soft: #202B4C;
    --on-brand: #FFFFFF;
    --exchange: #F07955;
    --exchange-soft: #3A251E;
    --success: #72C89E;
    --success-ink: #72C89E;
    --success-soft: #183328;
    --warning: #E0B95E;
    --warning-ink: #E0B95E;
    --warning-soft: #332B19;
    --danger: #EB7185;
    --danger-ink: #EB7185;
    --danger-soft: #3A2027;
    --info: #83A0FF;
    --focus-ring: rgba(91, 130, 255, 0.36);
    --shadow-raised: 0 18px 44px rgba(0, 0, 0, 0.22);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --canvas: #111411;
      --panel: #171B18;
      --panel-raised: #1D221E;
      --panel-inset: #0C0F0D;
      --control: #242A25;
      --line-soft: #252B26;
      --line: #303832;
      --line-strong: #475148;
      --text-primary: #F2F0E8;
      --text-secondary: #BEC2B8;
      --text-tertiary: #9AA298;
      --text-muted: #8A928A;
      --brand: #5B82FF;
      --brand-strong: #83A0FF;
      --brand-ink: #83A0FF;
      --brand-soft: #202B4C;
      --on-brand: #FFFFFF;
      --exchange: #F07955;
      --exchange-soft: #3A251E;
      --success: #72C89E;
      --success-ink: #72C89E;
      --success-soft: #183328;
      --warning: #E0B95E;
      --warning-ink: #E0B95E;
      --warning-soft: #332B19;
      --danger: #EB7185;
      --danger-ink: #EB7185;
      --danger-soft: #3A2027;
      --info: #83A0FF;
      --focus-ring: rgba(91, 130, 255, 0.36);
      --shadow-raised: 0 18px 44px rgba(0, 0, 0, 0.22);
    }
  }

  html { background: var(--canvas); }
  body {
    background: var(--canvas);
    color: var(--text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  button, input, select, textarea { font: inherit; }
  button, a, select, input, textarea { -webkit-tap-highlight-color: transparent; }
  :focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
  ::selection { background: var(--brand-soft); color: var(--text-primary); }
`

export const themeHeadScript = `<script>(function(){try{var t=localStorage.getItem('meridian-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(error){document.documentElement.removeAttribute('data-theme')}})();</script>`

export const themeHeadHtml = `${themeHeadScript}
<meta name="theme-color" content="#111411" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F3EFE6" media="(prefers-color-scheme: light)">
<link rel="icon" href="${faviconDataUri}">`
