export const API_CONFIG = {
  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO: "https://api.openweathermap.org/geo/1.0",
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
  DEFAULT_PARAMS: {
    units: "metric",
  },
} as const

/**
 * City shown when the browser cannot give the user's position
 * (permission denied, unavailable or timeout).
 */
export const FALLBACK_LOCATION = {
  name: "London",
  country: "GB",
  lat: 51.5073,
  lon: -0.1276,
} as const
