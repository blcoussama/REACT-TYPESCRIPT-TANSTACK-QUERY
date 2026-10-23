import { afterEach, describe, expect, it, vi } from "vitest"
import { API_CONFIG } from "./config"
import { buildUrl, MissingApiKeyError, WeatherAPI, WeatherApiError } from "./weather"

const KEY = "test-key"

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })
}

describe("API_CONFIG", () => {
  it("uses HTTPS for every endpoint (no mixed content once deployed)", () => {
    expect(API_CONFIG.BASE_URL).toMatch(/^https:\/\//)
    expect(API_CONFIG.GEO).toMatch(/^https:\/\//)
  })
})

describe("buildUrl", () => {
  it("adds the key and encodes every parameter", () => {
    const url = new URL(
      buildUrl(`${API_CONFIG.GEO}/direct`, { q: "São Paulo, BR & co", limit: 5 }, KEY)
    )

    expect(url.origin + url.pathname).toBe("https://api.openweathermap.org/geo/1.0/direct")
    expect(url.searchParams.get("appid")).toBe(KEY)
    expect(url.searchParams.get("q")).toBe("São Paulo, BR & co")
    expect(url.searchParams.get("limit")).toBe("5")
    expect(url.search).toContain("q=S%C3%A3o+Paulo%2C+BR+%26+co")
  })

  it.each([undefined, "", "   "])("refuses to build a URL without key (%j)", (key) => {
    expect(() => buildUrl(`${API_CONFIG.BASE_URL}/weather`, { lat: 1, lon: 2 }, key)).toThrow(
      MissingApiKeyError
    )
  })

  it("never sends appid=undefined", () => {
    expect(() => buildUrl(API_CONFIG.BASE_URL, {}, undefined)).toThrow(/VITE_OPENWEATHER_API_KEY/)
  })
})

describe("WeatherAPI", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("rejects with MissingApiKeyError without calling the network", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    // An empty string is used on purpose: `undefined` would fall back on the .env key.
    const api = new WeatherAPI("")

    await expect(api.searchLocations("Paris")).rejects.toBeInstanceOf(MissingApiKeyError)
    await expect(api.getCurrentWeather({ lat: 1, lon: 2 })).rejects.toBeInstanceOf(
      MissingApiKeyError
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("requests the current weather in metric units", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ name: "Paris" }))
    vi.stubGlobal("fetch", fetchMock)

    const data = await new WeatherAPI(KEY).getCurrentWeather({ lat: 48.8566, lon: 2.3522 })

    expect(data).toEqual({ name: "Paris" })
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.origin + url.pathname).toBe("https://api.openweathermap.org/data/2.5/weather")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      appid: KEY,
      lat: "48.8566",
      lon: "2.3522",
      units: "metric",
    })
  })

  it("builds the forecast and reverse geocoding URLs", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal("fetch", fetchMock)
    const api = new WeatherAPI(KEY)

    await api.getForecast({ lat: -33.87, lon: 151.21 })
    await api.reverseGeoCode({ lat: -33.87, lon: 151.21 })

    const [forecast, reverse] = fetchMock.mock.calls.map(([u]) => new URL(u as string))
    expect(forecast.pathname).toBe("/data/2.5/forecast")
    expect(forecast.searchParams.get("units")).toBe("metric")
    expect(reverse.protocol).toBe("https:")
    expect(reverse.pathname).toBe("/geo/1.0/reverse")
    expect(reverse.searchParams.get("limit")).toBe("1")
  })

  it("explains a rejected key (401)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ cod: 401 }, { status: 401, statusText: "Unauthorized" }))
    )

    const error = await new WeatherAPI("bad-key").searchLocations("Paris").catch((e: unknown) => e)

    expect(error).toBeInstanceOf(WeatherApiError)
    expect((error as WeatherApiError).status).toBe(401)
    expect((error as WeatherApiError).message).toMatch(/API key/)
  })

  it("keeps the status code of other errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })))

    await expect(new WeatherAPI(KEY).getForecast({ lat: 0, lon: 0 })).rejects.toThrow(
      "Weather API error: 503"
    )
  })
})
