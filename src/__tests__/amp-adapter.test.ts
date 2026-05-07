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
