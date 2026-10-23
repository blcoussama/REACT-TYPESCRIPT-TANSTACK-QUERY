import { API_CONFIG } from "./config"
import type { Coordinates, ForecastData, GeoCodingResponse, WeatherData } from "./types"

/** Thrown before any request when VITE_OPENWEATHER_API_KEY is not configured. */
export class MissingApiKeyError extends Error {
    constructor() {
        super(
            "OpenWeather API key is missing. Add VITE_OPENWEATHER_API_KEY to a .env.local file at the project root, then restart the dev server."
        )
        this.name = "MissingApiKeyError"
    }
}

/** Non-2xx response from OpenWeather, with a readable message for the most common cases. */
export class WeatherApiError extends Error {
    readonly status: number

    constructor(status: number, statusText = "") {
        super(WeatherApiError.describe(status, statusText))
        this.name = "WeatherApiError"
        this.status = status
    }

    private static describe(status: number, statusText: string) {
        if (status === 401) {
            return "OpenWeather rejected the API key (401). Check VITE_OPENWEATHER_API_KEY: a new key can take a few hours to be activated."
        }
        if (status === 429) {
            return "Too many requests sent to OpenWeather (429). Please try again in a minute."
        }
        return `Weather API error: ${status}${statusText ? ` ${statusText}` : ""}`
    }
}

type QueryParams = Record<string, string | number>

/** Builds an OpenWeather URL: the key and every parameter are URL-encoded. */
export function buildUrl(endpoint: string, params: QueryParams, apiKey: string | undefined): string {
    const key = apiKey?.trim()
    if (!key) {
        throw new MissingApiKeyError()
    }

    const searchParams = new URLSearchParams({ appid: key })
    for (const [name, value] of Object.entries(params)) {
        searchParams.set(name, String(value))
    }

    return `${endpoint}?${searchParams.toString()}`
}

export class WeatherAPI {
    private readonly apiKey: string | undefined

    constructor(apiKey: string | undefined = API_CONFIG.API_KEY) {
        this.apiKey = apiKey
    }

    private createUrl(endpoint: string, params: QueryParams) {
        return buildUrl(endpoint, params, this.apiKey)
    }

    private async fetchData<T>(url: string): Promise<T> {
        const res = await fetch(url)
        if (!res.ok) {
            throw new WeatherApiError(res.status, res.statusText)
        }

        return res.json() as Promise<T>
    }

    async getCurrentWeather({ lat, lon }: Coordinates): Promise<WeatherData> {
        const url = this.createUrl(`${API_CONFIG.BASE_URL}/weather`, {
            lat,
            lon,
            units: API_CONFIG.DEFAULT_PARAMS.units,
        })

        return this.fetchData<WeatherData>(url)
    }

    async getForecast({ lat, lon }: Coordinates): Promise<ForecastData> {
        const url = this.createUrl(`${API_CONFIG.BASE_URL}/forecast`, {
            lat,
            lon,
            units: API_CONFIG.DEFAULT_PARAMS.units,
        })

        return this.fetchData<ForecastData>(url)
    }

    async reverseGeoCode({ lat, lon }: Coordinates): Promise<GeoCodingResponse[]> {
        const url = this.createUrl(`${API_CONFIG.GEO}/reverse`, {
            lat,
            lon,
            limit: 1,
        })

        return this.fetchData<GeoCodingResponse[]>(url)
    }

    async searchLocations(query: string): Promise<GeoCodingResponse[]> {
        const url = this.createUrl(`${API_CONFIG.GEO}/direct`, {
            q: query,
            limit: 5,
        })

        return this.fetchData<GeoCodingResponse[]>(url)
    }
}

export const weatherAPI = new WeatherAPI()
