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
  import { AlertTriangle, MapPin, RefreshCw } from "lucide-react"
  const WeatherDashboard = () => {

    const { locationData, getLocation } = useGeoLocation()
    const { coordinates, error:locationError, isLoading:locationLoading } = locationData

    const weatherQuery = useWeatherQuery(coordinates)
    console.log(weatherQuery);
    const forecastQuery = useForecastQuery(coordinates)
    console.log(forecastQuery);
    const locationQuery = useReverseQuery(coordinates)
    console.log(locationQuery);

    const handleRefresh = () => {
      getLocation()
      if(coordinates) {
        weatherQuery.refetch()
        forecastQuery.refetch()
        locationQuery.refetch()
      }
    }

    if(locationLoading) {
      return <WeatherSkeleton />
    }

    if(locationError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{locationError}</p>
            <Button variant="outline" onClick={getLocation} className="w-fit">
              <MapPin className="mr-2 h-4 w-4" />
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if(!coordinates) {
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
      );
    }

    const locationname = locationQuery.data?.[0]

    if(weatherQuery.error || forecastQuery.error) {
      return <WeatherErrorAlert error={weatherQuery.error ?? forecastQuery.error} onRetry={handleRefresh} />
    }

    if(!weatherQuery.data || !forecastQuery.data) {
      return <WeatherSkeleton />
    }

    return (
      <div className="space-y-4 w-full">
        
        {/* Favorite Cities */}
          <FavoriteCities />

        <div className="flex items-center justify-between px-4">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">My Location</h1>
          <Button variant={"outline"} size={"icon"} onClick={handleRefresh} disabled={ weatherQuery.isFetching || forecastQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${weatherQuery.isFetching?"animate-spin":""}`} />
          </Button>
        </div>
        {/* Current and Hourly Weather */}
        <div className="grid gap-6">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* current weather */}
            <CurrentWeather data={weatherQuery.data} locationName={locationname} />
            {/* hourly temperature */}
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