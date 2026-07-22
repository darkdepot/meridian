import { createHash } from "node:crypto"
import * as claudeSdk from "@anthropic-ai/claude-agent-sdk"
import type {
  HookCallback,
  HookCallbackMatcher,
  HookEvent,
  Options,
  Query,
  SDKUserMessage,
  WarmQuery,
} from "@anthropic-ai/claude-agent-sdk"

type Prompt = string | AsyncIterable<SDKUserMessage>
type Hooks = Options["hooks"]
type StartWarmQuery = typeof import("@anthropic-ai/claude-agent-sdk").startup

interface RuntimeBridge {
  hooks: Hooks
  stderr: (line: string) => void
  hookShape: string
  bind(options: Options): boolean
}

interface WarmEntry {
  abortController: AbortController
  bridge: RuntimeBridge
  cancelled: boolean
  createdAt: number
  expiresAt: number
  promise: Promise<WarmQuery>
  ready?: WarmQuery
  timer: ReturnType<typeof setTimeout>
}

export interface WarmQueryPoolOptions {
  enabled: boolean
  maxEntries?: number
  ttlMs?: number
  initializeTimeoutMs?: number
  start?: StartWarmQuery
  onEvent?: (event: string, details: Record<string, unknown>) => void
}

function hookShape(hooks: Hooks): string {
  if (!hooks) return "none"
  const shape = Object.entries(hooks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([event, matchers]) => [
      event,
      (matchers ?? []).map((matcher) => ({
        matcher: matcher.matcher ?? "",
        timeout: matcher.timeout ?? null,
        hooks: matcher.hooks.length,
      })),
    ])
  return JSON.stringify(shape)
}

function createRuntimeBridge(templateHooks: Hooks): RuntimeBridge {
  let activeHooks: Hooks
  let activeStderr: Options["stderr"]
  const expectedShape = hookShape(templateHooks)
  const bridgedHooks: Partial<Record<HookEvent, HookCallbackMatcher[]>> = {}

  for (const [eventName, matchers] of Object.entries(templateHooks ?? {})) {
    const event = eventName as HookEvent
    bridgedHooks[event] = (matchers ?? []).map((matcher, matcherIndex) => ({
      ...(matcher.matcher !== undefined ? { matcher: matcher.matcher } : {}),
      ...(matcher.timeout !== undefined ? { timeout: matcher.timeout } : {}),
      hooks: matcher.hooks.map((_hook, hookIndex): HookCallback =>
        async (input, toolUseId, options) => {
          const callback = activeHooks?.[event]?.[matcherIndex]?.hooks[hookIndex]
          if (!callback) return {}
          return callback(input, toolUseId, options)
        }
      ),
    }))
  }

  return {
    hooks: Object.keys(bridgedHooks).length > 0 ? bridgedHooks : undefined,
    stderr: (line) => activeStderr?.(line),
    hookShape: expectedShape,
    bind(options) {
      if (hookShape(options.hooks) !== expectedShape) return false
      activeHooks = options.hooks
      activeStderr = options.stderr
      return true
    },
  }
}

export function createWarmQueryKey(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex")
}

export class WarmQueryPool {
  private readonly enabled: boolean
  private readonly maxEntries: number
  private readonly ttlMs: number
  private readonly initializeTimeoutMs: number
  private readonly start: StartWarmQuery
  private readonly onEvent: WarmQueryPoolOptions["onEvent"]
  private readonly entries = new Map<string, WarmEntry>()

  constructor(options: WarmQueryPoolOptions) {
    this.enabled = options.enabled
    this.maxEntries = Math.max(1, options.maxEntries ?? 4)
    this.ttlMs = Math.max(1_000, options.ttlMs ?? 120_000)
    this.initializeTimeoutMs = Math.max(1_000, options.initializeTimeoutMs ?? 15_000)
    // Access through the namespace at call time so existing proxy tests that
    // mock only SDK.query can still import the disabled pool safely.
    this.start = options.start ?? ((params) => claudeSdk.startup(params))
    this.onEvent = options.onEvent
  }

  get size(): number {
    return this.entries.size
  }

  prepare(key: string | undefined, options: Options): void {
    if (!this.enabled || !key || this.entries.has(key)) return

    while (this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value as string | undefined
      if (!oldestKey) break
      this.discard(oldestKey, "capacity")
    }

    const abortController = new AbortController()
    const bridge = createRuntimeBridge(options.hooks)
    const createdAt = Date.now()
    const entry = {} as WarmEntry
    const promise = this.start({
      options: {
        ...options,
        abortController,
        hooks: bridge.hooks,
        stderr: bridge.stderr,
      },
      initializeTimeoutMs: this.initializeTimeoutMs,
    }).then((warm) => {
      if (entry.cancelled) warm.close()
      else {
        entry.ready = warm
        this.onEvent?.("ready", { key: key.slice(0, 12), startupMs: Date.now() - createdAt })
      }
      return warm
    }).catch((error) => {
      if (this.entries.get(key) === entry) this.entries.delete(key)
      clearTimeout(entry.timer)
      this.onEvent?.("error", {
        key: key.slice(0, 12),
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    })

    const timer = setTimeout(() => this.discard(key, "ttl"), this.ttlMs)
    timer.unref?.()
    Object.assign(entry, {
      abortController,
      bridge,
      cancelled: false,
      createdAt,
      expiresAt: createdAt + this.ttlMs,
      promise,
      timer,
    })
    this.entries.set(key, entry)
    // A background prewarm failure must not become an unhandled rejection.
    void promise.catch(() => {})
    this.onEvent?.("started", { key: key.slice(0, 12), size: this.entries.size })
  }

  async take(key: string | undefined, options: Options, prompt: Prompt): Promise<Query | undefined> {
    if (!this.enabled || !key) return undefined
    const entry = this.entries.get(key)
    if (!entry) {
      this.onEvent?.("miss", { key: key.slice(0, 12) })
      return undefined
    }

    this.entries.delete(key)
    clearTimeout(entry.timer)
    if (entry.cancelled || entry.expiresAt <= Date.now()) {
      this.closeEntry(entry)
      this.onEvent?.("miss", { key: key.slice(0, 12), reason: "expired" })
      return undefined
    }
    if (!entry.bridge.bind(options)) {
      this.closeEntry(entry)
      this.onEvent?.("miss", { key: key.slice(0, 12), reason: "hook_shape" })
      return undefined
    }
    if (!entry.ready) await Promise.resolve()
    // Never put startup latency back on the request path. If the user sends
    // another turn before initialization completed, discard this speculative
    // process and use the ordinary cold query immediately.
    if (!entry.ready) {
      this.closeEntry(entry)
      this.onEvent?.("miss", { key: key.slice(0, 12), reason: "not_ready" })
      return undefined
    }

    const runtimeAbort = options.abortController?.signal
    if (runtimeAbort?.aborted) {
      entry.abortController.abort(runtimeAbort.reason)
    } else if (runtimeAbort) {
      runtimeAbort.addEventListener(
        "abort",
        () => entry.abortController.abort(runtimeAbort.reason),
        { once: true },
      )
    }

    if (entry.cancelled || entry.abortController.signal.aborted) {
      entry.ready.close()
      return undefined
    }
    this.onEvent?.("hit", {
      key: key.slice(0, 12),
      ageMs: Date.now() - entry.createdAt,
    })
    return entry.ready.query(prompt)
  }

  closeAll(): void {
    for (const key of [...this.entries.keys()]) this.discard(key, "shutdown")
  }

  private discard(key: string, reason: string): void {
    const entry = this.entries.get(key)
    if (!entry) return
    this.entries.delete(key)
    clearTimeout(entry.timer)
    entry.cancelled = true
    entry.abortController.abort(reason)
    void entry.promise.then((warm) => warm.close()).catch(() => {})
    this.onEvent?.("discarded", { key: key.slice(0, 12), reason, size: this.entries.size })
  }

  private closeEntry(entry: WarmEntry): void {
    entry.cancelled = true
    entry.abortController.abort("discarded")
    void entry.promise.then((warm) => warm.close()).catch(() => {})
  }
}
