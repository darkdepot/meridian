/**
 * Optional API key authentication middleware.
 *
 * When MERIDIAN_API_KEY is set, requests to protected routes must include
 * a matching key via `x-api-key` header, `Authorization: Bearer` header, or
 * a browser-session cookie issued by POST /auth/browser. When unset, all
 * routes are open (default behavior, backward compatible).
 *
 * Uses constant-time comparison to prevent timing attacks.
 */

import { createHmac, timingSafeEqual } from "node:crypto"
import type { Context, Next } from "hono"

export const BROWSER_SESSION_COOKIE_NAME = "meridian_session"
export const BROWSER_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60

const BROWSER_SESSION_HMAC_CONTEXT = "meridian/browser-session/v1"

function getConfiguredKey(): string | undefined {
  return process.env.MERIDIAN_API_KEY || undefined
}

/**
 * Whether API key authentication is enabled.
 * True when MERIDIAN_API_KEY is set to a non-empty value.
 */
export function authEnabled(): boolean {
  return Boolean(getConfiguredKey())
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Hashes both values to ensure equal-length comparison regardless of input.
 */
function safeCompare(a: string, b: string): boolean {
  const hashA = createHmac("sha256", "meridian").update(a).digest()
  const hashB = createHmac("sha256", "meridian").update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

/**
 * Derive a stable browser credential without exposing or storing the API key.
 * Rotating MERIDIAN_API_KEY changes the expected token immediately.
 */
function browserSessionToken(key: string): string {
  return createHmac("sha256", key)
    .update(BROWSER_SESSION_HMAC_CONTEXT)
    .digest("base64url")
}

function extractCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined

  const prefix = `${name}=`
  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim()
    if (cookie.startsWith(prefix)) return cookie.slice(prefix.length)
  }

  return undefined
}

function hasValidBrowserSession(c: Context, key: string): boolean {
  const provided = extractCookie(c.req.header("cookie"), BROWSER_SESSION_COOKIE_NAME)
  if (!provided) return false
  return safeCompare(provided, browserSessionToken(key))
}

/**
 * Build the short-lived browser session cookie for an authenticated unlock.
 * Returns undefined when API-key authentication is disabled.
 */
export function createBrowserSessionCookie(requestUrl: string): string | undefined {
  const key = getConfiguredKey()
  if (!key) return undefined

  const attributes = [
    `${BROWSER_SESSION_COOKIE_NAME}=${browserSessionToken(key)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${BROWSER_SESSION_MAX_AGE_SECONDS}`,
  ]

  if (new URL(requestUrl).protocol === "https:") attributes.push("Secure")
  return attributes.join("; ")
}

/**
 * Extract the API key from the request.
 * Checks x-api-key header first, then Authorization: Bearer.
 */
function extractKey(c: Context): string | undefined {
  const apiKey = c.req.header("x-api-key")
  if (apiKey) return apiKey

  const auth = c.req.header("authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice(7)

  return undefined
}

/**
 * Hono middleware that rejects requests without a valid API key or browser
 * session. Both credential forms are compared in constant time.
 * No-op when MERIDIAN_API_KEY is not set.
 */
export async function requireAuth(c: Context, next: Next) {
  const key = getConfiguredKey()
  if (!key) return next()

  const provided = extractKey(c)
  const validKey = provided ? safeCompare(provided, key) : false
  const validBrowserSession = hasValidBrowserSession(c, key)
  if (!validKey && !validBrowserSession) {
    return c.json({
      type: "error",
      error: {
        type: "authentication_error",
        message: "Invalid or missing API key",
      },
    }, 401)
  }

  return next()
}
