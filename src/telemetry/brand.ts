/**
 * Protocol Seam brand assets shared by every server-rendered page.
 *
 * The mark shows two routes exchanging lanes across a deliberate gap: the
 * visual shorthand for Meridian's job as a clean protocol bridge.
 */

export const BRAND_NAME = "Meridian"
export const BRAND_TAGLINE = "One subscription. Every agent."

export const brandMarkSvg = `<svg class="meridian-brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M3 6H6.75C8.3 6 9 8.4 10.125 9.75 M13.875 14.25C15 15.6 15.7 18 17.25 18H21" stroke="var(--brand, #1E5EFF)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 18H6.75C8.3 18 9 15.6 10.125 14.25 M13.875 9.75C15 8.4 15.7 6 17.25 6H21" stroke="var(--exchange, #DE5B36)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

export const brandLockupHtml = `${brandMarkSvg}<span class="meridian-wordmark">${BRAND_NAME}</span>`

export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#171B18"/><path d="M3 8h5.4c2 0 2.3 3.5 4.4 5.2m6.4 5.6c2.1 1.7 2.4 5.2 4.4 5.2H29" stroke="#5B82FF" stroke-width="3" stroke-linecap="round"/><path d="M3 24h5.4c2 0 2.3-3.5 4.4-5.2m6.4-5.6c2.1-1.7 2.4-5.2 4.4-5.2H29" stroke="#F07955" stroke-width="3" stroke-linecap="round"/></svg>`

export const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`
