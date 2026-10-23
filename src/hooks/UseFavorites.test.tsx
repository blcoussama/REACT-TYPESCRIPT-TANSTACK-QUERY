import type { ReactNode } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it } from "vitest"
import {
  addFavoriteTo,
  FAVORITES_STORAGE_KEY,
  removeFavoriteFrom,
  useFavorites,
  type FavoriteCity,
} from "./UseFavorites"

const PARIS = { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 }
const TOKYO = { name: "Tokyo", country: "JP", lat: 35.6895, lon: 139.6917 }

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return wrapper
}

function stored(): FavoriteCity[] {
  return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]")
}

describe("favorites helpers", () => {
  it("adds a city once, with a stable id", () => {
    const once = addFavoriteTo([], PARIS, 1000)
    expect(once).toEqual([{ ...PARIS, id: "48.8566-2.3522", addedAt: 1000 }])
    expect(addFavoriteTo(once, PARIS, 2000)).toBe(once)
  })

  it("removes a city by id", () => {
    const list = addFavoriteTo(addFavoriteTo([], PARIS), TOKYO)
    expect(removeFavoriteFrom(list, "48.8566-2.3522").map((c) => c.name)).toEqual(["Tokyo"])
  })
})

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // TanStack Query notifies its observers asynchronously: hence waitFor().
  it("shares one list between every component that uses it", async () => {
    // Two consumers in the same tree, like the star button and the favorites bar.
    const { result } = renderHook(
      () => ({ starButton: useFavorites(), favoritesBar: useFavorites() }),
      { wrapper: createWrapper() }
    )

    act(() => result.current.starButton.addFavorite(PARIS))

    await waitFor(() =>
      expect(result.current.favoritesBar.favorites.map((c) => c.name)).toEqual(["Paris"])
    )
    expect(result.current.favoritesBar.isFavorite(PARIS.lat, PARIS.lon)).toBe(true)

    act(() => result.current.favoritesBar.removeFavorite("48.8566-2.3522"))

    await waitFor(() => expect(result.current.starButton.favorites).toEqual([]))
    expect(result.current.starButton.isFavorite(PARIS.lat, PARIS.lon)).toBe(false)
  })

  it("persists to localStorage and never stores duplicates", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    act(() => {
      result.current.addFavorite(PARIS)
      result.current.addFavorite(TOKYO)
      result.current.addFavorite(PARIS)
    })

    await waitFor(() =>
      expect(result.current.favorites.map((c) => c.name)).toEqual(["Paris", "Tokyo"])
    )
    expect(stored().map((c) => c.name)).toEqual(["Paris", "Tokyo"])
  })

  it("loads the favorites saved by a previous visit", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(addFavoriteTo([], TOKYO)))

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    expect(result.current.favorites.map((c) => c.name)).toEqual(["Tokyo"])
  })

  it.each([
    ["invalid JSON", "{not json"],
    ["not an array", JSON.stringify({ name: "Paris" })],
    ["entries without coordinates", JSON.stringify([{ id: "x", name: "Paris", country: "FR" }])],
  ])("ignores corrupted storage (%s)", (_label, raw) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, raw)

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })

    expect(result.current.favorites).toEqual([])
  })
})
