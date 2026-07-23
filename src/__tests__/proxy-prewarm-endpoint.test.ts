import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test"
import type { Query, SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import {
  blockStop,
  messageDelta,
  messageStart,
  messageStop,
  textBlockStart,
  textDelta,
} from "./helpers"

const SESSION_KEY = "client-session-prewarm"
let coldQueryCalls = 0
let startupCalls: Array<Record<string, unknown>> = []
let warmQueryCalls = 0
let prewarmEvents: Array<{ event: string; details: Record<string, unknown> }> = []

function responseMessages(): SDKMessage[] {
  return [
    messageStart(),
    textBlockStart(0),
    textDelta(0, "ok"),
    blockStop(0),
    messageDelta("end_turn"),
    messageStop(),
  ]
}

function messageStream(): AsyncIterable<SDKMessage> {
  return (async function* () {
    for (const message of responseMessages()) yield message
  })()
}

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: () => {
    coldQueryCalls++
    return messageStream()
  },
  createSdkMcpServer: () => ({ type: "sdk", name: "test", instance: {} }),
  tool: () => ({}),
}))

mock.module("../logger", () => ({
  claudeLog: (event: string, details: Record<string, unknown>) => {
    if (event.startsWith("sdk.prewarm.")) prewarmEvents.push({ event, details })
  },
  withClaudeLogContext: (_ctx: unknown, fn: () => unknown) => fn(),
}))

mock.module("../mcpTools", () => ({
  createOpencodeMcpServer: () => ({ type: "sdk", name: "opencode", instance: {} }),
}))

const {
  clearSessionCache,
  createProxyServerForTests,
} = await import("../proxy/server")
const { WarmQueryPool } = await import("../proxy/warmQueryPool")

const savedEnv = {
  passthrough: process.env.MERIDIAN_PASSTHROUGH,
  routing: process.env.MERIDIAN_ROUTING,
  sessionDir: process.env.MERIDIAN_SESSION_DIR,
}

afterAll(() => {
  if (savedEnv.passthrough === undefined) delete process.env.MERIDIAN_PASSTHROUGH
  else process.env.MERIDIAN_PASSTHROUGH = savedEnv.passthrough
  if (savedEnv.routing === undefined) delete process.env.MERIDIAN_ROUTING
  else process.env.MERIDIAN_ROUTING = savedEnv.routing
  if (savedEnv.sessionDir === undefined) delete process.env.MERIDIAN_SESSION_DIR
  else process.env.MERIDIAN_SESSION_DIR = savedEnv.sessionDir
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
          return messageStream() as Query
        },
        close() {},
        async [Symbol.asyncDispose]() {},
      }
    },
  })
  const { app } = createProxyServerForTests(
    { port: 0, host: "127.0.0.1", profiles },
    pool,
  )
  return { app, pool }
}

async function establishSession(
  app: { fetch: (request: Request) => Response | Promise<Response> },
) {
  const response = await post(app, "/v1/messages", {
    model: "sonnet",
    stream: true,
    messages: [{ role: "user", content: "hello" }],
  }, { "x-opencode-session": SESSION_KEY })
  expect(response.status).toBe(200)
  await response.text()
}

describe("POST /v1/prewarm", () => {
  beforeEach(() => {
    process.env.MERIDIAN_PASSTHROUGH = "1"
    delete process.env.MERIDIAN_ROUTING
    process.env.MERIDIAN_SESSION_DIR = "/private/tmp/zeni106-prewarm-test-sessions"
    coldQueryCalls = 0
    startupCalls = []
    warmQueryCalls = 0
    prewarmEvents = []
    clearSessionCache()
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
    const { app, pool } = createTestApp(true)
    await establishSession(app)
    expect(coldQueryCalls).toBe(1)
    expect(startupCalls).toHaveLength(1)

    // Simulate an idle-handle discard while retaining the bounded session plan.
    pool.closeAll()
    startupCalls = []
    prewarmEvents = []
    const first = await post(app, "/v1/prewarm", { sessionKey: SESSION_KEY })
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual({ status: "warming" })
    expect(startupCalls).toHaveLength(1)
    expect(startupCalls[0]).not.toHaveProperty("prompt")
    expect(coldQueryCalls).toBe(1)

    const repeated = await post(app, "/v1/prewarm", { sessionKey: SESSION_KEY })
    expect(repeated.status).toBe(200)
    expect(await repeated.json()).toEqual({ status: "already_warm" })
    expect(startupCalls).toHaveLength(1)
    await Bun.sleep(0)

    const followUp = await post(app, "/v1/messages", {
      model: "sonnet",
      stream: true,
      messages: [
        { role: "user", content: "hello" },
        { role: "assistant", content: "ok" },
        { role: "user", content: "again" },
      ],
    }, { "x-opencode-session": SESSION_KEY })
    expect(followUp.status).toBe(200)
    await followUp.text()

    expect(warmQueryCalls).toBe(1)
    expect(coldQueryCalls).toBe(1)
    expect(prewarmEvents.some(({ event }) => event === "sdk.prewarm.hit")).toBe(true)
  })

  it("does not spawn for an unknown session", async () => {
    const { app } = createTestApp(true)

    const response = await post(app, "/v1/prewarm", { sessionKey: "not-observed" })

    expect(response.status).toBe(404)
    expect(startupCalls).toHaveLength(0)
  })
})
