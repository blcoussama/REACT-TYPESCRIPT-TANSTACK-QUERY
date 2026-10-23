import { describe, expect, it } from "vitest"
import type { ForecastData } from "@/api/types"
import { groupByCityDay } from "./forecast"

const TOKYO = 9 * 3600
const unix = (iso: string) => Date.parse(iso) / 1000

function slot(iso: string, temp_min: number, temp_max: number) {
  return {
    dt: unix(iso),
    dt_txt: iso,
    main: { temp: temp_max, feels_like: temp_max, temp_min, temp_max, pressure: 1015, humidity: 60 },
    weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
    wind: { speed: 3, deg: 90 },
  }
}

function forecast(timezone: number, list: ForecastData["list"]): ForecastData {
  return { list, city: { name: "Tokyo", country: "JP", sunrise: 0, sunset: 0, timezone } }
}

describe("groupByCityDay", () => {
  const list = [
    slot("2026-10-23T09:00:00Z", 17, 19), // Oct 23, 18:00 in Tokyo
    slot("2026-10-23T12:00:00Z", 15, 16), // Oct 23, 21:00
    slot("2026-10-23T15:00:00Z", 12, 14), // Oct 24, 00:00
    slot("2026-10-23T21:00:00Z", 10, 13), // Oct 24, 06:00
    slot("2026-10-24T03:00:00Z", 16, 22), // Oct 24, 12:00
  ]

  it("groups 3-hour slots by local day of the city", () => {
    const days = groupByCityDay(forecast(TOKYO, list))

    expect(days).toHaveLength(2)
    expect(days[0]).toMatchObject({ temp_min: 15, temp_max: 19, date: list[0].dt })
    expect(days[1]).toMatchObject({ temp_min: 10, temp_max: 22, date: list[2].dt })
  })

  it("gives a different split in UTC", () => {
    const days = groupByCityDay(forecast(0, list))

    expect(days).toHaveLength(2)
    expect(days[0]).toMatchObject({ temp_min: 10, temp_max: 19 })
    expect(days[1]).toMatchObject({ temp_min: 16, temp_max: 22 })
  })
})
