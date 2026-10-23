import type { Coordinates } from "@/api/types"

interface CityLink {
  name: string
  lat: number
  lon: number
}

/** URL of a city page; the name is encoded ("São Paulo", "Washington, D.C."...). */
export function cityPath({ name, lat, lon }: CityLink): string {
  const query = new URLSearchParams({ lat: String(lat), lon: String(lon) })
  return `/city/${encodeURIComponent(name)}?${query.toString()}`
}

function parseCoordinate(raw: string | null, limit: number): number | null {
  if (raw === null || raw.trim() === "") return null
  const value = Number(raw)
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null
}

/** Reads ?lat=&lon= from a city URL; null when missing, malformed or out of range. */
export function parseCoordinates(params: URLSearchParams): Coordinates | null {
  const lat = parseCoordinate(params.get("lat"), 90)
  const lon = parseCoordinate(params.get("lon"), 180)
  return lat === null || lon === null ? null : { lat, lon }
}
