import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { BROWSER_SESSION_COOKIE_NAME, BROWSER_SESSION_MAX_AGE_SECONDS } from "../proxy/auth"
import { createProxyServer } from "../proxy/server"

const TEST_KEY = "browser-unlock-test-key"
const originalKey = process.env.MERIDIAN_API_KEY

function createTestApp() {
  return createProxyServer({ port: 0, host: "127.0.0.1", silent: true }).app
}

function cookiePair(setCookie: string): string {
  const pair = setCookie.split(";", 1)[0]
  if (!pair) throw new Error("Browser unlock response did not contain a cookie pair")
  return pair
}

beforeEach(() => {
  process.env.MERIDIAN_API_KEY = TEST_KEY
})

afterEach(() => {
  if (originalKey === undefined) delete process.env.MERIDIAN_API_KEY
  else process.env.MERIDIAN_API_KEY = originalKey
})

describe("POST /auth/browser", () => {
  it("rejects missing and invalid API-key credentials", async () => {
    const app = createTestApp()

    const missing = await app.fetch(new Request("http://localhost/auth/browser", {
      method: "POST",
    }))
    const invalid = await app.fetch(new Request("http://localhost/auth/browser", {
      method: "POST",
      headers: { "x-api-key": "not-the-key" },
    }))

    expect(missing.status).toBe(401)
    expect(invalid.status).toBe(401)
    expect(missing.headers.get("set-cookie")).toBeNull()
    expect(invalid.headers.get("set-cookie")).toBeNull()
  })

  it("sets a bounded, HTTP-only session cookie after a valid HTTPS unlock", async () => {
    const app = createTestApp()
    const response = await app.fetch(new Request("https://localhost/auth/browser", {
      method: "POST",
      headers: { authorization: `Bearer ${TEST_KEY}` },
    }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
    expect(response.headers.get("cache-control")).toBe("no-store")

    const setCookie = response.headers.get("set-cookie")
    expect(setCookie).not.toBeNull()
    if (!setCookie) throw new Error("Browser unlock response did not set a cookie")
    expect(setCookie).toContain(`${BROWSER_SESSION_COOKIE_NAME}=`)
    expect(setCookie).toContain("Path=/")
    expect(setCookie).toContain("HttpOnly")
    expect(setCookie).toContain("SameSite=Strict")
    expect(setCookie).toContain(`Max-Age=${BROWSER_SESSION_MAX_AGE_SECONDS}`)
    expect(setCookie).toContain("Secure")
    expect(setCookie).not.toContain(TEST_KEY)

    const repeat = await app.fetch(new Request("https://localhost/auth/browser", {
      method: "POST",
      headers: { "x-api-key": TEST_KEY },
    }))
    const repeatedSetCookie = repeat.headers.get("set-cookie")
    if (!repeatedSetCookie) throw new Error("Repeated browser unlock did not set a cookie")
    expect(cookiePair(repeatedSetCookie)).toBe(cookiePair(setCookie))
  })

  it("authenticates a later protected request with the issued cookie", async () => {
    const app = createTestApp()
    const unlock = await app.fetch(new Request("http://localhost/auth/browser", {
      method: "POST",
      headers: { "x-api-key": TEST_KEY },
    }))
    const setCookie = unlock.headers.get("set-cookie")
    if (!setCookie) throw new Error("Browser unlock response did not set a cookie")
    expect(setCookie).not.toContain("Secure")

    const protectedResponse = await app.fetch(new Request("http://localhost/metrics", {
      headers: { cookie: cookiePair(setCookie) },
    }))

    expect(protectedResponse.status).toBe(200)
  })

  it("rejects an invalid browser-session cookie", async () => {
    const app = createTestApp()
    const response = await app.fetch(new Request("http://localhost/metrics", {
      headers: { cookie: `${BROWSER_SESSION_COOKIE_NAME}=invalid-session` },
    }))

    expect(response.status).toBe(401)
  })

  it("invalidates an issued cookie when the API key rotates", async () => {
    const app = createTestApp()
    const unlock = await app.fetch(new Request("http://localhost/auth/browser", {
      method: "POST",
      headers: { "x-api-key": TEST_KEY },
    }))
    const setCookie = unlock.headers.get("set-cookie")
    if (!setCookie) throw new Error("Browser unlock response did not set a cookie")

    process.env.MERIDIAN_API_KEY = "rotated-browser-unlock-key"
    const response = await app.fetch(new Request("http://localhost/metrics", {
      headers: { cookie: cookiePair(setCookie) },
    }))

    expect(response.status).toBe(401)
  })

  it("succeeds without setting a cookie when API-key auth is disabled", async () => {
    delete process.env.MERIDIAN_API_KEY
    const app = createTestApp()
    const response = await app.fetch(new Request("http://localhost/auth/browser", {
      method: "POST",
    }))

    expect(response.status).toBe(200)
    expect(response.headers.get("set-cookie")).toBeNull()
    expect(await response.json()).toEqual({ success: true })
  })
})
