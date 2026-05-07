/**
 * Tests for the Amp agent adapter.
 */
import { describe, it, expect } from "bun:test"
import { ampAdapter } from "../proxy/adapters/amp"

describe("ampAdapter — identity", () => {
  it("has name 'amp'", () => {
    expect(ampAdapter.name).toBe("amp")
  })

  it("getMcpServerName returns 'amp'", () => {
    expect(ampAdapter.getMcpServerName()).toBe("amp")
  })
})

describe("ampAdapter.getSessionId", () => {
  it("reads x-amp-thread-id header", () => {
    const ctx = {
      req: {
        header: (name: string) =>
          name === "x-amp-thread-id" ? "T-019d01b5-f70d-73ea-9445-f6d358f7213e" : undefined,
      },
    }
    expect(ampAdapter.getSessionId(ctx as any)).toBe("T-019d01b5-f70d-73ea-9445-f6d358f7213e")
  })

  it("returns undefined when header is absent", () => {
    const ctx = { req: { header: () => undefined } }
    expect(ampAdapter.getSessionId(ctx as any)).toBeUndefined()
  })

  it("does not fall back to other agents' headers", () => {
    const ctx = {
      req: {
        header: (name: string) =>
          name === "x-opencode-session" ? "sess-abc" : undefined,
      },
    }
    expect(ampAdapter.getSessionId(ctx as any)).toBeUndefined()
  })
})
