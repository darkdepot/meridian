/**
 * Compatibility facade for the shared Protocol Seam application shell.
 * Existing pages retain the profileBar imports while receiving the complete
 * navigation, profile control, health indicator, and theme switcher.
 */
export { themeCss } from "./theme"
export { appShellCss as profileBarCss, appShellHtml as profileBarHtml, appShellJs as profileBarJs } from "./appShell"
