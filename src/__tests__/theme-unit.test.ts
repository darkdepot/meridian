import { describe, expect, it } from "bun:test"
import { themeCss, themeHeadHtml, themeHeadScript } from "../telemetry/theme"

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

describe("Protocol Seam theme", () => {
  it("includes the approved light and Night Instrument palettes", () => {
    expect(themeCss).toContain("--canvas: #F3EFE6")
    expect(themeCss).toContain("--panel: #FCFAF5")
    expect(themeCss).toContain("--brand: #1E5EFF")
    expect(themeCss).toContain("--exchange: #DE5B36")
    expect(themeCss).toContain(':root[data-theme="dark"]')
    expect(themeCss).toContain("--canvas: #111411")
    expect(themeCss).toContain("--brand: #5B82FF")
    expect(themeCss).toContain("--exchange: #F07955")
  })

  it("keeps legacy page tokens mapped to semantic tokens", () => {
    for (const token of ["--bg", "--surface", "--surface2", "--border", "--text", "--muted", "--accent", "--green", "--yellow", "--red"]) {
      expect(themeCss).toContain(token + ":")
    }
  })

  it("keeps small tertiary metadata at WCAG AA contrast in the light theme", () => {
    for (const surface of ["#F3EFE6", "#FCFAF5", "#ECE7DC"]) {
      expect(contrast("#626A64", surface)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("applies saved theme before paint and embeds the favicon", () => {
    expect(themeHeadScript).toContain("meridian-theme")
    expect(themeHeadScript).toContain("data-theme")
    expect(themeHeadHtml).toContain('rel="icon"')
    expect(themeHeadHtml).toContain('name="theme-color"')
  })
})
