import { describe, expect, test } from "bun:test"
import type { Query, WarmQuery } from "@anthropic-ai/claude-agent-sdk"
import { FixedWindowRateLimiter, PrewarmPlanStore } from "../proxy/prewarm"
import { WarmQueryPool } from "../proxy/warmQueryPool"

function fakeWarm(): WarmQuery {
  return {
    query() {
      return {} as Query
    },
    close() {},
    async [Symbol.asyncDispose]() {},
  }
}

describe("PrewarmPlanStore", () => {
  test("reports disabled before looking up a session", () => {
    const pool = new WarmQueryPool({ enabled: false, start: async () => fakeWarm() })
    const plans = new PrewarmPlanStore(pool, 2)

    expect(plans.prepare("default", "unknown")).toEqual({ status: "disabled" })
  })

  test("prepares a known session idempotently and rejects an unknown session", () => {
    const pool = new WarmQueryPool({ enabled: true, start: async () => fakeWarm() })
    const plans = new PrewarmPlanStore(pool, 2)
    plans.register("default", "known", { key: "warm-key", options: {} })

    expect(plans.prepare("default", "known")).toEqual({ status: "warming" })
    expect(plans.prepare("default", "known")).toEqual({ status: "already_warm" })
    expect(plans.prepare("default", "unknown")).toEqual({ status: "unknown_session" })
    pool.closeAll()
  })

  test("keeps profile and session identifiers collision-free", () => {
    const pool = new WarmQueryPool({ enabled: true, start: async () => fakeWarm() })
    const plans = new PrewarmPlanStore(pool, 2)
    plans.register("default", "team:abc", { key: "default-key", options: {} })
    plans.register("team", "abc", { key: "team-key", options: {} })

    expect(plans.prepare("default", "team:abc")).toEqual({ status: "warming" })
    expect(plans.prepare("team", "abc")).toEqual({ status: "warming" })
    expect(pool.size).toBe(2)
    pool.closeAll()
  })

  test("bounds remembered plans", () => {
    const pool = new WarmQueryPool({ enabled: true, start: async () => fakeWarm() })
    const plans = new PrewarmPlanStore(pool, 1)
    plans.register("default", "old", { key: "old-key", options: {} })
    plans.register("default", "new", { key: "new-key", options: {} })

    expect(plans.prepare("default", "old")).toEqual({ status: "unknown_session" })
    expect(plans.prepare("default", "new")).toEqual({ status: "warming" })
    pool.closeAll()
  })
})

describe("FixedWindowRateLimiter", () => {
  test("rejects requests over the limit and resets in the next window", () => {
    const limiter = new FixedWindowRateLimiter(2, 60_000)

    expect(limiter.consume(1_000).allowed).toBe(true)
    expect(limiter.consume(2_000).allowed).toBe(true)
    expect(limiter.consume(3_000)).toEqual({ allowed: false, retryAfterSeconds: 58 })
    expect(limiter.consume(61_000).allowed).toBe(true)
  })
})
