import type { Options } from "@anthropic-ai/claude-agent-sdk"
import type { WarmQueryPool, WarmQueryPrepareStatus } from "./warmQueryPool"

interface PrewarmPlan {
  key: string
  options: Options
}

export type PrewarmPlanResult =
  | { status: WarmQueryPrepareStatus }
  | { status: "unknown_session" }

/**
 * Keeps the latest startup-safe plan for each known client session.
 *
 * Plans are bounded independently from the warm subprocess pool: the pool may
 * intentionally hold only one process while the plan store remembers how to
 * rewarm any recently active session after its idle handle expires.
 */
export class PrewarmPlanStore {
  private readonly plans = new Map<string, PrewarmPlan>()
  private readonly maxEntries: number
  private readonly pool: WarmQueryPool

  constructor(pool: WarmQueryPool, maxEntries: number) {
    this.pool = pool
    this.maxEntries = Math.max(1, maxEntries)
  }

  register(profileId: string, sessionKey: string, plan: PrewarmPlan): void {
    const planId = JSON.stringify([profileId, sessionKey])
    this.plans.delete(planId)
    this.plans.set(planId, plan)

    while (this.plans.size > this.maxEntries) {
      const oldestKey = this.plans.keys().next().value as string | undefined
      if (!oldestKey) break
      this.plans.delete(oldestKey)
    }
  }

  prepare(profileId: string, sessionKey: string): PrewarmPlanResult {
    if (!this.pool.isEnabled) return { status: "disabled" }

    const planId = JSON.stringify([profileId, sessionKey])
    const plan = this.plans.get(planId)
    if (!plan) return { status: "unknown_session" }

    // Refresh recency on successful lookup.
    this.plans.delete(planId)
    this.plans.set(planId, plan)
    return { status: this.pool.prepare(plan.key, plan.options) }
  }
}

export interface RateLimitDecision {
  allowed: boolean
  retryAfterSeconds: number
}

/** Small process-local fixed-window limiter for the prewarm control endpoint. */
export class FixedWindowRateLimiter {
  private count = 0
  private windowStartedAt: number | undefined

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  consume(now: number = Date.now()): RateLimitDecision {
    if (this.windowStartedAt === undefined || now - this.windowStartedAt >= this.windowMs) {
      this.windowStartedAt = now
      this.count = 0
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((this.windowStartedAt + this.windowMs - now) / 1_000),
    )
    if (this.count >= this.maxRequests) {
      return { allowed: false, retryAfterSeconds }
    }

    this.count++
    return { allowed: true, retryAfterSeconds }
  }
}
