import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface FavoriteCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  addedAt: number;
}

export type NewFavorite = Omit<FavoriteCity, "id" | "addedAt">;

export const FAVORITES_STORAGE_KEY = "favorites";
const FAVORITES_QUERY_KEY = ["favorites"] as const;

export function favoriteId(lat: number, lon: number): string {
  return `${lat}-${lon}`;
}

function isFavoriteCity(value: unknown): value is FavoriteCity {
  if (typeof value !== "object" || value === null) return false;
  const city = value as Record<string, unknown>;
  return (
    typeof city.id === "string" &&
    typeof city.name === "string" &&
    typeof city.country === "string" &&
    Number.isFinite(city.lat) &&
    Number.isFinite(city.lon)
  );
}

/** Favorites saved in localStorage; corrupted or foreign data is ignored. */
export function readFavorites(): FavoriteCity[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isFavoriteCity) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: FavoriteCity[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage full or disabled (private mode): the list still lives in memory.
  }
}

export function addFavoriteTo(
  favorites: FavoriteCity[],
  city: NewFavorite,
  now: number = Date.now()
): FavoriteCity[] {
  const id = favoriteId(city.lat, city.lon);
  if (favorites.some((fav) => fav.id === id)) return favorites;
  return [...favorites, { ...city, id, addedAt: now }];
}

export function removeFavoriteFrom(favorites: FavoriteCity[], id: string): FavoriteCity[] {
  return favorites.filter((fav) => fav.id !== id);
}

/**
 * Single source of truth for favorite cities: one TanStack Query cache entry,
 * persisted to localStorage. Every component calling useFavorites() (search
 * dialog, favorites bar, star button) reads and updates the same list.
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: readFavorites,
    initialData: readFavorites,
    staleTime: Infinity, // localStorage only changes through this hook
  });

  const update = useCallback(
    (change: (current: FavoriteCity[]) => FavoriteCity[]) => {
      const current =
        queryClient.getQueryData<FavoriteCity[]>(FAVORITES_QUERY_KEY) ?? readFavorites();
      const next = change(current);
      writeFavorites(next);
      queryClient.setQueryData(FAVORITES_QUERY_KEY, next);
    },
    [queryClient]
  );

  const addFavorite = useCallback(
    (city: NewFavorite) => update((current) => addFavoriteTo(current, city)),
    [update]
  );

  const removeFavorite = useCallback(
    (id: string) => update((current) => removeFavoriteFrom(current, id)),
    [update]
  );

  const isFavorite = useCallback(
    (lat: number, lon: number) => favorites.some((fav) => fav.id === favoriteId(lat, lon)),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
