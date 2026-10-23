import { afterEach, describe, expect, it } from "vitest"
import { cityDateKey, formatCityDay, formatCityHour, formatCityTime } from "./time"

// Offsets returned by OpenWeather (seconds from UTC) in October.
const NEW_YORK = -4 * 3600 // EDT
const TOKYO = 9 * 3600
const KATHMANDU = 5 * 3600 + 45 * 60
const UTC = 0

const unix = (iso: string) => Date.parse(iso) / 1000

describe("formatCityTime", () => {
  const noonUtc = unix("2026-10-23T12:00:00Z")

  it("formats the time in the city's timezone", () => {
    expect(formatCityTime(noonUtc, UTC)).toBe("12:00 PM")
    expect(formatCityTime(noonUtc, NEW_YORK)).toBe("8:00 AM")
    expect(formatCityTime(noonUtc, TOKYO)).toBe("9:00 PM")
  })

  it("handles offsets that are not whole hours", () => {
    expect(formatCityTime(noonUtc, KATHMANDU)).toBe("5:45 PM")
  })

  it("only uses ASCII spaces (no narrow no-break space before AM/PM)", () => {
    expect(formatCityTime(noonUtc, TOKYO)).not.toMatch(/[\u202f\u00a0]/)
  })

  describe("does not depend on the browser timezone", () => {
    const originalTz = process.env.TZ

    afterEach(() => {
      process.env.TZ = originalTz
    })

    it.each(["Africa/Casablanca", "Pacific/Auckland", "America/Los_Angeles"])(
      "same result with TZ=%s",
      (tz) => {
        process.env.TZ = tz
        // New York sunrise, Oct 23 2026 (11:17 UTC).
        expect(formatCityTime(unix("2026-10-23T11:17:00Z"), NEW_YORK)).toBe("7:17 AM")
      }
    )
  })
})

describe("formatCityHour", () => {
  it("formats the chart axis in city time", () => {
    expect(formatCityHour(unix("2026-10-23T00:00:00Z"), UTC)).toBe("12 AM")
    expect(formatCityHour(unix("2026-10-23T00:00:00Z"), TOKYO)).toBe("9 AM")
    expect(formatCityHour(unix("2026-10-23T00:00:00Z"), NEW_YORK)).toBe("8 PM")
  })
})

describe("formatCityDay and cityDateKey", () => {
  // 22:00 UTC on Friday Oct 23 is already Saturday morning in Tokyo.
  const lateFriday = unix("2026-10-23T22:00:00Z")

  it("uses the local date of the city", () => {
    expect(formatCityDay(lateFriday, NEW_YORK)).toBe("Fri, Oct 23")
    expect(formatCityDay(lateFriday, TOKYO)).toBe("Sat, Oct 24")
    expect(cityDateKey(lateFriday, NEW_YORK)).toBe("2026-10-23")
    expect(cityDateKey(lateFriday, TOKYO)).toBe("2026-10-24")
  })

  it("rolls back to the previous day west of UTC", () => {
    expect(cityDateKey(unix("2026-10-24T02:00:00Z"), NEW_YORK)).toBe("2026-10-23")
  })
})
