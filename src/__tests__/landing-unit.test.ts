import { describe, expect, it } from "bun:test"
import { landingHtml } from "../telemetry/landing"

describe("Protocol Seam home dashboard", () => {
  it("prioritizes profile allowance and daily operating signals", () => {
    expect(landingHtml).toContain("Usage by profile")
    expect(landingHtml).toContain("Requests · 24h")
    expect(landingHtml).toContain("Recent activity")
    expect(landingHtml).toContain("Runtime")
    expect(landingHtml).toContain("Models")
    expect(landingHtml).toContain("Plugins")
  })

  it("loads each dashboard source independently", () => {
    expect(landingHtml).toContain("Promise.allSettled")
    expect(landingHtml).toContain("/v1/usage/quota/all")
    expect(landingHtml).toContain("/profiles/list")
    expect(landingHtml).toContain("/telemetry/summary?window=86400000")
    expect(landingHtml).toContain("/telemetry/requests?limit=7")
    expect(landingHtml).toContain("/plugins/list")
  })

  it("offers a secure browser-session unlock for API-key deployments", () => {
    expect(landingHtml).toContain("Unlock this browser session")
    expect(landingHtml).toContain("/auth/browser")
    expect(landingHtml).toContain("x-api-key")
    expect(landingHtml).toContain("HttpOnly session cookie")
    expect(landingHtml).not.toContain("localStorage.setItem('meridian-api-key")
  })

  it("supports profile switching without leaving home", () => {
    expect(landingHtml).toContain("Make active")
    expect(landingHtml).toContain("/profiles/active")
    expect(landingHtml).toContain("data-profile")
  })

  it("ships the responsive application shell and theme metadata", () => {
    expect(landingHtml).toContain("meridian-app-shell")
    expect(landingHtml).toContain("meridian-theme")
    expect(landingHtml).toContain('rel="icon"')
    expect(landingHtml).toContain("@media (max-width: 760px)")
  })

  it("falls back safely when the Clipboard API is unavailable", () => {
    expect(landingHtml).toContain("if (!navigator.clipboard")
    expect(landingHtml).toContain("fallbackCopy")
    expect(landingHtml).toContain("document.execCommand('copy')")
  })
})
