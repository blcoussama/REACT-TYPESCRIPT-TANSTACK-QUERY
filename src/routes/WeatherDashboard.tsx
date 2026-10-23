import { MapPin, RefreshCw } from "lucide-react"
import { FALLBACK_LOCATION } from "@/api/config"
import type { GeoCodingResponse } from "@/api/types"
import { CurrentWeather } from "@/components/CurrentWeather"
import { FavoriteCities } from "@/components/FavoriteCities"
import { HourlyTemperature } from "@/components/HourlyTemperature"
import WeatherSkeleton from "@/components/LoadingSkeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WeatherDetails } from "@/components/WeatherDetails"
import { WeatherErrorAlert } from "@/components/WeatherErrorAlert"
import { WeatherForecast } from "@/components/WeatherForecast"
import { useGeoLocation } from "@/hooks/UseGeoLocation"
import { useForecastQuery, useReverseQuery, useWeatherQuery } from "@/hooks/UseWeather"

const WeatherDashboard = () => {
  const { locationData, getLocation } = useGeoLocation()
  const { coordinates: userCoordinates, error: locationError, isLoading: locationLoading } = locationData

  // Geolocation refused or unavailable: show a default city instead of a blank page.
  const usingFallback = !userCoordinates && !!locationError
  const coordinates =
    userCoordinates ??
    (usingFallback ? { lat: FALLBACK_LOCATION.lat, lon: FALLBACK_LOCATION.lon } : null)

  const weatherQuery = useWeatherQuery(coordinates)
  const forecastQuery = useForecastQuery(coordinates)
  const locationQuery = useReverseQuery(coordinates)

  const handleRefresh = () => {
    getLocation()
    if (coordinates) {
      weatherQuery.refetch()
      forecastQuery.refetch()
      locationQuery.refetch()
    }
  }

  if (locationLoading) {
    return <WeatherSkeleton />
  }

  if (!coordinates) {
    return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertTitle>Location Required</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Please enable location access to see your local weather.</p>
          <Button variant="outline" onClick={getLocation} className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <WeatherErrorAlert
        error={weatherQuery.error ?? forecastQuery.error}
        onRetry={handleRefresh}
      />
    )
  }

  if (!weatherQuery.data || !forecastQuery.data) {
    return <WeatherSkeleton />
  }

  // Reverse geocoding gives the best name; fall back on the weather response.
  const locationName: GeoCodingResponse = locationQuery.data?.[0] ?? {
    name: weatherQuery.data.name,
    country: weatherQuery.data.sys.country,
    lat: coordinates.lat,
    lon: coordinates.lon,
  }

  return (
    <div className="space-y-4 w-full">
      <h1 className="sr-only">Weather dashboard</h1>

      {/* Favorite Cities */}
      <FavoriteCities />

      {usingFallback && (
        <Alert role="status" className="mx-4 w-auto">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Showing {FALLBACK_LOCATION.name} instead of your location</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{locationError} Search any city above, or allow location access and try again.</p>
            <Button variant="outline" size="sm" onClick={getLocation} className="w-fit shrink-0">
              <MapPin className="h-4 w-4" />
              Use my location
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
          {usingFallback ? "Default City" : "My Location"}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={weatherQuery.isFetching || forecastQuery.isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${weatherQuery.isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Current and Hourly Weather */}
      <div className="grid gap-6">
        <div className="flex flex-col xl:flex-row gap-4">
          <CurrentWeather data={weatherQuery.data} locationName={locationName} />
          <HourlyTemperature data={forecastQuery.data} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2 items-start">
          <WeatherDetails data={weatherQuery.data} />
          <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  )
}

export default WeatherDashboard
