import { describe, expect, it } from "vitest"
import { cityPath, parseCoordinates } from "./routes"

describe("cityPath", () => {
  it("encodes the city name", () => {
    expect(cityPath({ name: "São Paulo", lat: -23.55, lon: -46.63 })).toBe(
      "/city/S%C3%A3o%20Paulo?lat=-23.55&lon=-46.63"
    )
  })

  it("keeps reserved URL characters inside the path segment", () => {
    const path = cityPath({ name: "What? City #1/2", lat: 1, lon: 2 })
    const url = new URL(path, "https://example.test")

    expect(url.pathname).toBe("/city/What%3F%20City%20%231%2F2")
    expect(decodeURIComponent(url.pathname.split("/")[2])).toBe("What? City #1/2")
    expect(url.searchParams.get("lat")).toBe("1")
    expect(url.searchParams.get("lon")).toBe("2")
  })
})

describe("parseCoordinates", () => {
  const parse = (query: string) => parseCoordinates(new URLSearchParams(query))

  it("reads valid coordinates", () => {
    expect(parse("lat=40.7128&lon=-74.006")).toEqual({ lat: 40.7128, lon: -74.006 })
    expect(parse("lat=0&lon=0")).toEqual({ lat: 0, lon: 0 })
  })

  it.each([
    ["missing", ""],
    ["lon missing", "lat=40.7"],
    ["empty values", "lat=&lon="],
    ["not a number", "lat=abc&lon=2"],
    ["trailing garbage", "lat=40.7abc&lon=2"],
    ["latitude out of range", "lat=91&lon=0"],
    ["longitude out of range", "lat=0&lon=-181"],
  ])("returns null when %s", (_label, query) => {
    expect(parse(query)).toBeNull()
  })
})
