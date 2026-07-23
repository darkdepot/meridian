import { describe, expect, test } from "bun:test"
import type { Options, Query, WarmQuery } from "@anthropic-ai/claude-agent-sdk"
import { createWarmQueryKey, WarmQueryPool } from "../proxy/warmQueryPool"

function fakeQuery(): Query {
  return {} as Query
}

function fakeWarm(onQuery?: () => void): WarmQuery & { closeCalls: number } {
  return {
    closeCalls: 0,
    query() {
      onQuery?.()
      return fakeQuery()
    },
    close() {
      this.closeCalls++
    },
    async [Symbol.asyncDispose]() {
      this.close()
    },
  }
}

function hookOptions(callback: (...args: any[]) => Promise<any>): Options {
  return {
    hooks: {
      PreToolUse: [{ matcher: "", hooks: [callback] }],
    },
  }
}

describe("WarmQueryPool", () => {
  test("uses the next request's hook callback with the prewarmed process", async () => {
    let startupOptions: Options | undefined
    const warm = fakeWarm()
    let templateCalled = false
    let runtimeCalled = false
    const templateHook = async () => {
      templateCalled = true
      return {}
    }
    const runtimeHook = async () => {
      runtimeCalled = true
      return {}
    }
    const pool = new WarmQueryPool({
      enabled: true,
      start: async (params) => {
        startupOptions = params?.options
        return warm
      },
    })

    pool.prepare("same-session", hookOptions(templateHook))
    const result = await pool.take("same-session", hookOptions(runtimeHook), "hello")

    expect(result).toBeDefined()
    const bridgedHook = startupOptions?.hooks?.PreToolUse?.[0]?.hooks[0]
    expect(bridgedHook).toBeDefined()
    await expect(bridgedHook!({} as any, undefined, { signal: new AbortController().signal }))
      .resolves.toEqual({})
    expect(runtimeCalled).toBe(true)
    expect(templateCalled).toBe(false)
    pool.closeAll()
  })

  test("consumes each prepared query at most once", async () => {
    let queryCalls = 0
    const pool = new WarmQueryPool({
      enabled: true,
      start: async () => fakeWarm(() => queryCalls++),
    })

    pool.prepare("one-shot", {})
    expect(await pool.take("one-shot", {}, "first")).toBeDefined()
    expect(await pool.take("one-shot", {}, "second")).toBeUndefined()
    expect(queryCalls).toBe(1)
    pool.closeAll()
  })

  test("never waits for an unfinished speculative startup on the request path", async () => {
    let resolveWarm!: (warm: WarmQuery) => void
    const warm = fakeWarm()
    const pool = new WarmQueryPool({
      enabled: true,
      start: () => new Promise((resolve) => {
        resolveWarm = resolve
      }),
    })

    pool.prepare("still-starting", {})
    const startedAt = performance.now()
    const result = await pool.take("still-starting", {}, "hello")

    expect(result).toBeUndefined()
    expect(performance.now() - startedAt).toBeLessThan(50)
    resolveWarm(warm)
    await Promise.resolve()
    await Promise.resolve()
    expect(warm.closeCalls).toBeGreaterThan(0)
    pool.closeAll()
  })

  test("fails closed when the next request's hook shape differs", async () => {
    const warm = fakeWarm()
    const pool = new WarmQueryPool({
      enabled: true,
      start: async () => warm,
    })

    pool.prepare("shape", hookOptions(async () => ({})))
    const result = await pool.take("shape", {}, "hello")

    expect(result).toBeUndefined()
    await Promise.resolve()
    expect(warm.closeCalls).toBeGreaterThan(0)
    pool.closeAll()
  })

  test("forwards request aborts to the prewarmed subprocess", async () => {
    let startupOptions: Options | undefined
    const pool = new WarmQueryPool({
      enabled: true,
      start: async (params) => {
        startupOptions = params?.options
        return fakeWarm()
      },
    })
    const requestAbort = new AbortController()

    pool.prepare("abort", {})
    expect(await pool.take("abort", { abortController: requestAbort }, "hello")).toBeDefined()
    requestAbort.abort("client disconnected")

    expect(startupOptions?.abortController?.signal.aborted).toBe(true)
    pool.closeAll()
  })

  test("bounds the number of idle subprocesses", async () => {
    const first = fakeWarm()
    const second = fakeWarm()
    const warms = [first, second]
    const pool = new WarmQueryPool({
      enabled: true,
      maxEntries: 1,
      start: async () => warms.shift()!,
    })

    pool.prepare("first", {})
    pool.prepare("second", {})
    await Promise.resolve()

    expect(pool.size).toBe(1)
    expect(first.closeCalls).toBeGreaterThan(0)
    pool.closeAll()
  })

  test("discards idle handles when dynamically disabled", async () => {
    let enabled = true
    const warm = fakeWarm()
    const pool = new WarmQueryPool({
      enabled: () => enabled,
      start: async () => warm,
    })

    pool.prepare("stale-after-disable", {})
    await Promise.resolve()
    expect(pool.size).toBe(1)

    enabled = false
    expect(pool.prepare("disabled", {})).toBe("disabled")
    await Bun.sleep(0)
    expect(pool.size).toBe(0)
    expect(warm.closeCalls).toBeGreaterThan(0)

    enabled = true
    expect(await pool.take("stale-after-disable", {}, "next turn")).toBeUndefined()
  })

  test("does not take a handle disabled during its startup microtask", async () => {
    let enabled = true
    let resolveWarm!: (warm: WarmQuery) => void
    const warm = fakeWarm()
    const pool = new WarmQueryPool({
      enabled: () => enabled,
      start: () => new Promise((resolve) => {
        resolveWarm = resolve
      }),
    })

    pool.prepare("disable-race", {})
    const take = pool.take("disable-race", {}, "next turn")
    enabled = false
    resolveWarm(warm)

    expect(await take).toBeUndefined()
    await Bun.sleep(0)
    expect(warm.closeCalls).toBeGreaterThan(0)
  })

  test("discards and closes an unused query after its TTL", async () => {
    const events: Array<{ event: string; details: Record<string, unknown> }> = []
    const warm = fakeWarm()
    const pool = new WarmQueryPool({
      enabled: true,
      ttlMs: 1_000,
      start: async () => warm,
      onEvent: (event, details) => events.push({ event, details }),
    })

    pool.prepare("expires", {})
    await Bun.sleep(1_100)

    expect(pool.size).toBe(0)
    expect(warm.closeCalls).toBeGreaterThan(0)
    expect(events).toContainEqual({
      event: "discarded",
      details: { key: "expires", reason: "ttl", size: 0 },
    })
  })

  test("hashes warm keys without retaining raw prompt context", () => {
    const a = createWarmQueryKey({ model: "sonnet", system: "private context" })
    const b = createWarmQueryKey({ model: "sonnet", system: "private context" })
    const changed = createWarmQueryKey({ model: "sonnet", system: "changed" })

    expect(a).toBe(b)
    expect(a).not.toBe(changed)
    expect(a).not.toContain("private")
  })
})
