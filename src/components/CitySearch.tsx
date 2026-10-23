import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Search, Loader2, Clock, Star, XCircle } from "lucide-react"
import { MIN_SEARCH_LENGTH, useLocationSearch } from "@/hooks/UseWeather"
import { useSearchHistory } from "@/hooks/UseSearchHistory"
import { useDebouncedValue } from "@/hooks/UseDebounce"
import { useFavorites } from "@/hooks/UseFavorites"
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import { cityPath } from "@/lib/routes"

/** Wait this long after the last keystroke before calling the geocoding API. */
const SEARCH_DEBOUNCE_MS = 350

interface CityOption {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

function CityLabel({ city }: { city: CityOption }) {
  return (
    <>
      <span>{city.name}</span>
      {city.state && (
        <span className="text-sm text-muted-foreground">, {city.state}</span>
      )}
      <span className="text-sm text-muted-foreground">, {city.country}</span>
    </>
  )
}

export function CitySearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const trimmedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS)

  const {
    data: locations = [],
    isFetching,
    error: searchError,
  } = useLocationSearch(debouncedQuery)
  const { favorites } = useFavorites()
  const { history, clearHistory, addToHistory } = useSearchHistory()

  const canSearch = trimmedQuery.length >= MIN_SEARCH_LENGTH
  // Visible while the user is still typing (debounce) and while the request runs.
  const isSearching = canSearch && (trimmedQuery !== debouncedQuery || isFetching)
  const showNoResults =
    canSearch && !isSearching && !searchError && locations.length === 0

  // API results are already filtered by OpenWeather; favorites and history are
  // filtered here by name (cmdk's own fuzzy filter is disabled).
  const matchesQuery = (name: string) =>
    !trimmedQuery || name.toLowerCase().includes(trimmedQuery.toLowerCase())
  const visibleFavorites = favorites.filter((city) => matchesQuery(city.name))
  const visibleHistory = history.filter((item) => matchesQuery(item.name))

  const handleSelect = (city: CityOption) => {
    addToHistory.mutate({
      query: trimmedQuery || city.name,
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.country,
      state: city.state,
    })

    setOpen(false)
    setQuery("")
    navigate(cityPath(city))
  }

  return (
    <>
      <Button
        variant="outline"
        className="hidden md:flex justify-start text-muted-foreground w-64 text-base"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-6 w-6" />
        Search cities...
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden [&_svg]:size-6"
        onClick={() => setOpen(true)}
        aria-label="Search cities"
      >
        <Search aria-hidden="true" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shouldFilter={false}
        title="Search cities"
        description="Type at least three letters to search a city, or pick a favorite or a recent search."
      >
        <CommandInput
          placeholder="Search cities..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {/* Search Results */}
          {isSearching && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Searching cities...
            </div>
          )}
          {searchError && !isSearching && (
            <p role="alert" className="px-4 py-6 text-center text-sm text-destructive">
              {getErrorMessage(searchError)}
            </p>
          )}
          {showNoResults && (
            <p className="py-6 text-center text-sm">No cities found.</p>
          )}
          {!isSearching && locations.length > 0 && (
            <CommandGroup heading="Suggestions">
              {locations.map((location) => (
                <CommandItem
                  key={`${location.lat}-${location.lon}`}
                  value={`suggestion-${location.lat}-${location.lon}`}
                  onSelect={() => handleSelect(location)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <CityLabel city={location} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Favorites Section */}
          {visibleFavorites.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Favorites">
                {visibleFavorites.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={`favorite-${city.id}`}
                    onSelect={() => handleSelect(city)}
                  >
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <CityLabel city={city} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Search History Section */}
          {visibleHistory.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between px-2 my-2">
                  <p className="text-xs text-muted-foreground">Recent Searches</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearHistory.mutate()}
                  >
                    <XCircle className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
                {visibleHistory.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`history-${item.id}`}
                    onSelect={() => handleSelect(item)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CityLabel city={item} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {format(item.searchedAt, "MMM d, h:mm a")}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
