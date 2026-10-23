import { Card, CardContent } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";
import type { WeatherData, GeoCodingResponse } from "@/api/types";

interface CurrentWeatherProps {
  data: WeatherData;
  locationName?: GeoCodingResponse;
}

export function CurrentWeather({ data, locationName }: CurrentWeatherProps) {
  const {
    weather: [currentWeather],
    main: { temp, feels_like, temp_min, temp_max, humidity },
    wind: { speed },
  } = data;

  // Format temperature
  const formatTemp = (temp: number) => `${Math.round(temp)}°`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {/* The city page already shows the name in its <h1>. */}
            {locationName && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {locationName.name}
                  </h3>
                  {locationName.state && (
                    <span className="text-muted-foreground">
                      , {locationName.state}
                    </span>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">
                  {locationName.country}
                </p>
              </div>
            )}

            <div className="flex items-center justify-start gap-8 md:gap-10 lg:gap-8">
              <p className="text-7xl font-bold tracking-tighter">
                {formatTemp(temp)}
              </p>
              <div className="space-y-1">
                <p className="text-base font-medium text-muted-foreground">
                  Feels like {formatTemp(feels_like)}
                </p>
                <div className="flex gap-2 text-base md:text-xl font-medium">
                  <span className="flex items-center gap-1 text-blue-500">
                    <ArrowDown className="h-10 w-10" />
                    {formatTemp(temp_min)}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <ArrowUp className="h-10 w-10" />
                    {formatTemp(temp_max)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="flex items-center gap-2 mt-6">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">Humidity</p>
                  <p className="text-lg text-muted-foreground">{humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Wind className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-lg font-medium">Wind Speed</p>
                  <p className="text-lg text-muted-foreground">{speed} m/s</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
              <img
                src={`https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`}
                alt={currentWeather.description}
                className="h-full w-full object-contain"
              />
              <div className="absolute bottom-0 text-center">
                <p className="text-2xl font-medium capitalize">
                  {currentWeather.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}