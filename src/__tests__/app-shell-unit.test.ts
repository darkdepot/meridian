import { describe, expect, it } from "bun:test"
import { appShellCss, appShellHtml, appShellJs } from "../telemetry/appShell"
import { dashboardHtml } from "../telemetry/dashboard"
import { landingHtml } from "../telemetry/landing"
import { profilePageHtml } from "../telemetry/profilePage"
import { settingsPageHtml } from "../telemetry/settingsPage"
import { pluginPageHtml } from "../proxy/plugins/pluginPage"

describe("Protocol Seam application shell", () => {
  it("provides persistent navigation for every management page", () => {
    for (const href of ["/", "/telemetry", "/profiles", "/plugins", "/settings"]) {
      expect(appShellHtml).toContain(`href="${href}"`)
    }
    expect(appShellHtml).toContain('aria-label="Primary navigation"')
    expect(appShellHtml).toContain("meridianProfileSelect")
    expect(appShellHtml).toContain("meridianThemeToggle")
  })

  it("has a responsive drawer and accessible touch targets", () => {
    expect(appShellCss).toContain("@media (max-width: 760px)")
    expect(appShellCss).toContain("min-height: 44px")
    expect(appShellHtml).toContain('aria-expanded="false"')
    expect(appShellHtml).toContain('aria-controls="meridianShellDrawer"')
  })

  it("handles navigation, profiles, health, and theme state", () => {
    expect(appShellJs).toContain("aria-current")
    expect(appShellJs).toContain("/profiles/list")
    expect(appShellJs).toContain("/profiles/active")
    expect(appShellJs).toContain("/health")
    expect(appShellJs).toContain("meridian-theme")
    expect(appShellJs).toContain("meridian:profile-changed")
    expect(appShellJs).toContain("meridian:auth-changed")
  })

  it("does not silently swallow request failures", () => {
    expect(appShellJs).not.toContain("catch(function() {})")
    expect(appShellJs).toContain("Proxy unavailable")
    expect(appShellJs).toContain("Profile switch failed")
  })

  it("is integrated with theme metadata on every product surface", () => {
    for (const page of [landingHtml, dashboardHtml, profilePageHtml, settingsPageHtml, pluginPageHtml]) {
      expect(page).toContain("meridian-app-shell")
      expect(page).toContain("meridian-theme")
      expect(page).toContain('rel="icon"')
      expect(page).toContain("meridian-theme-toggle")
    }
  })
})
