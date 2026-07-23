import { afterAll, beforeEach, describe, expect, it } from "bun:test"
import type { Query } from "@anthropic-ai/claude-agent-sdk"
import { createProxyServerForTests } from "../proxy/server"
import { PrewarmPlanStore } from "../proxy/prewarm"
import { WarmQueryPool } from "../proxy/warmQueryPool"

const SESSION_KEY = "client-session-prewarm"
let startupCalls: Array<Record<string, unknown>> = []
let warmQueryCalls = 0
let prewarmEvents: Array<{ event: string; details: Record<string, unknown> }> = []

const savedEnv = {
  routing: process.env.MERIDIAN_ROUTING,
}

afterAll(() => {
  if (savedEnv.routing === undefined) delete process.env.MERIDIAN_ROUTING
  else process.env.MERIDIAN_ROUTING = savedEnv.routing
})

function post(
  app: { fetch: (request: Request) => Response | Promise<Response> },
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return app.fetch(new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }))
}

function createTestApp(enabled: boolean, profiles?: Array<{ id: string }>) {
  const pool = new WarmQueryPool({
    enabled,
    onEvent: (event, details) => {
      prewarmEvents.push({ event: `sdk.prewarm.${event}`, details })
    },
    start: async (params) => {
      startupCalls.push(params as unknown as Record<string, unknown>)
      return {
        query() {
          warmQueryCalls++
          return {} as Query
        },
        close() {},
        async [Symbol.asyncDispose]() {},
      }
    },
  })
  const plans = new PrewarmPlanStore(pool, 10)
  const { app } = createProxyServerForTests(
    { port: 0, host: "127.0.0.1", profiles },
    pool,
    plans,
  )
  return { app, plans, pool }
}

describe("POST /v1/prewarm", () => {
  beforeEach(() => {
    delete process.env.MERIDIAN_ROUTING
    startupCalls = []
    warmQueryCalls = 0
    prewarmEvents = []
  })

  it("returns disabled without spawning for a valid body", async () => {
    const { app } = createTestApp(false)

    const response = await post(app, "/v1/prewarm", { sessionKey: "unknown" })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "disabled" })
    expect(startupCalls).toHaveLength(0)
  })

  it("rejects an invalid body", async () => {
    const { app } = createTestApp(false)

    const response = await post(app, "/v1/prewarm", { sessionKey: "   " })

    expect(response.status).toBe(400)
    expect(startupCalls).toHaveLength(0)
  })

  it("requires an explicit profile for non-sticky multi-profile routing", async () => {
    process.env.MERIDIAN_ROUTING = "active"
    const { app } = createTestApp(true, [{ id: "one" }, { id: "two" }])

    const response = await post(app, "/v1/prewarm", { sessionKey: SESSION_KEY })

    expect(response.status).toBe(400)
    expect(startupCalls).toHaveLength(0)
  })

  it("warms a known session, is idempotent, and serves the follow-up from the warm handle", async () => {
    const { app, plans, pool } = createTestApp(true)
    plans.register("default", SESSION_KEY, { key: "warm-key", options: {} })

    const first = await post(app, "/v1/prewarm", { sessionKey: SESSION_KEY })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ status: "warming" })
    expect(startupCalls).toHaveLength(1)
    expect(startupCalls[0]).not.toHaveProperty("prompt")
    expect(warmQueryCalls).toBe(0)

    const repeated = await post(app, "/v1/prewarm", { sessionKey: SESSION_KEY })
    expect(repeated.status).toBe(200)
    expect(await repeated.json()).toEqual({ status: "already_warm" })
    expect(startupCalls).toHaveLength(1)
    await Bun.sleep(0)

    const followUp = await pool.take("warm-key", {}, "next turn")

    expect(followUp).toBeDefined()
    expect(warmQueryCalls).toBe(1)
    expect(prewarmEvents.some(({ event }) => event === "sdk.prewarm.hit")).toBe(true)
  })

  it("does not spawn for an unknown session", async () => {
    const { app } = createTestApp(true)

    const response = await post(app, "/v1/prewarm", { sessionKey: "not-observed" })

    expect(response.status).toBe(404)
    expect(startupCalls).toHaveLength(0)
  })
})
