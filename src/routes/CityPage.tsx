import { Link, useParams, useSearchParams } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { parseCoordinates } from "@/lib/routes";
import { useForecastQuery, useWeatherQuery } from "@/hooks/UseWeather";
import WeatherSkeleton from "@/components/LoadingSkeleton";
import { FavoriteButton } from "@/components/FavouritesButton";
import { CurrentWeather } from "@/components/CurrentWeather";
import { HourlyTemperature } from "@/components/HourlyTemperature";
import { WeatherDetails } from "@/components/WeatherDetails";
import { WeatherForecast } from "@/components/WeatherForecast";
import { WeatherErrorAlert } from "@/components/WeatherErrorAlert";


export function CityPage() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  // null when ?lat=&lon= are missing or invalid: no request is sent then.
  const coordinates = parseCoordinates(searchParams);

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);

  if (!coordinates) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <MapPinOff className="h-5 w-5" />
        <AlertTitle className="text-xl">Invalid city link</AlertTitle>
        <AlertDescription className="flex flex-col gap-4 text-base">
          <p>
            The latitude and longitude of this city are missing or invalid.
            Search the city again from the search bar.
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link to="/">Back to the dashboard</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <WeatherErrorAlert
        error={weatherQuery.error ?? forecastQuery.error}
        onRetry={() => {
          weatherQuery.refetch();
          forecastQuery.refetch();
        }}
      />
    );
  }

  if (!weatherQuery.data || !forecastQuery.data || !params.cityName) {
    return <WeatherSkeleton />;
  }

  return (
    <div className="space-y-4 md:w-full">
      <div className="flex items-center justify-between mx-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {params.cityName}, {weatherQuery.data.sys.country}
        </h1>
        <div className="flex gap-2">
          <FavoriteButton
            data={{ ...weatherQuery.data, name: params.cityName }}
          />
        </div>
      </div>

      <div className="grid gap-6">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* current weather */}
            <CurrentWeather data={weatherQuery.data} />
            {/* hourly temperature */}
            <HourlyTemperature data={forecastQuery.data} />
          </div>
          
          <div className="grid gap-6 xl:grid-cols-2 items-start">
            <WeatherDetails data={weatherQuery.data} />
            <WeatherForecast data={forecastQuery.data} />
          </div>
        </div>
    
    </div>
  );
}