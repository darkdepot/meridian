import { describe, expect, it } from "bun:test"
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  brandLockupHtml,
  brandMarkSvg,
  faviconDataUri,
  faviconSvg,
} from "../telemetry/brand"

describe("Protocol Seam brand", () => {
  it("renders the two-route exchange mark without embedded text", () => {
    expect(brandMarkSvg).toContain('viewBox="0 0 24 24"')
    expect(brandMarkSvg.match(/<path/g)?.length).toBe(2)
    expect(brandMarkSvg).toContain("var(--brand")
    expect(brandMarkSvg).toContain("var(--exchange")
    expect(brandMarkSvg).not.toContain("<text")
  })

  it("builds a reusable title-case lockup", () => {
    expect(BRAND_NAME).toBe("Meridian")
    expect(BRAND_TAGLINE).toBe("One subscription. Every agent.")
    expect(brandLockupHtml).toContain(brandMarkSvg)
    expect(brandLockupHtml).toContain('<span class="meridian-wordmark">Meridian</span>')
  })

  it("provides a self-contained favicon data URI", () => {
    expect(faviconSvg).toContain("#5B82FF")
    expect(faviconSvg).toContain("#F07955")
    expect(faviconDataUri).toStartWith("data:image/svg+xml,")
    expect(decodeURIComponent(faviconDataUri.slice("data:image/svg+xml,".length))).toBe(faviconSvg)
  })
})
