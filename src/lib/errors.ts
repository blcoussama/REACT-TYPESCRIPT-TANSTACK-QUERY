import { MissingApiKeyError, WeatherApiError } from "@/api/weather"

/** User-facing message for an error thrown by a weather query. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof MissingApiKeyError || error instanceof WeatherApiError) {
    return error.message
  }
  return "Failed to fetch weather data. Check your connection and try again."
}
