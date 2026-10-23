import type { ForecastData, WeatherCondition } from "@/api/types"
import { cityDateKey } from "./time"

export interface DailyForecast {
  date: number
  temp_min: number
  temp_max: number
  humidity: number
  wind: number
  weather: WeatherCondition
}

/**
 * Groups the 3-hour forecast slots by local day of the city and keeps the
 * min/max temperature of each day. The first group is "today" (city time).
 */
export function groupByCityDay(data: ForecastData): DailyForecast[] {
  const days = new Map<string, DailyForecast>()

  for (const slot of data.list) {
    const key = cityDateKey(slot.dt, data.city.timezone)
    const day = days.get(key)

    if (!day) {
      days.set(key, {
        date: slot.dt,
        temp_min: slot.main.temp_min,
        temp_max: slot.main.temp_max,
        humidity: slot.main.humidity,
        wind: slot.wind.speed,
        weather: slot.weather[0],
      })
    } else {
      day.temp_min = Math.min(day.temp_min, slot.main.temp_min)
      day.temp_max = Math.max(day.temp_max, slot.main.temp_max)
    }
  }

  return [...days.values()]
}
