import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { useWeatherQuery } from "@/hooks/UseWeather"
import { useFavorites } from "@/hooks/UseFavorites"
import { cityPath } from "@/lib/routes"
import { Button } from "./ui/button"

interface FavoriteCityTabletProps {
  id: string;
  name: string;
  lat: number;
  lon: number;
  onRemove: (id: string) => void;
}

function FavoriteCityTablet({ id, name, lat, lon, onRemove }: FavoriteCityTabletProps) {
  const { data: weather, isLoading } = useWeatherQuery({ lat, lon });

  return (
    <div className="relative min-w-[270px]">
      {/* A real link: focusable and activated with Enter, no nested button inside. */}
      <Link
        to={cityPath({ name, lat, lon })}
        className="flex h-full items-center gap-3 rounded-lg border bg-card p-4 pr-8 shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isLoading ? (
          <div className="flex h-8 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading weather for {name}</span>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center gap-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt=""
                className="h-8 w-8"
              />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {weather.sys.country}
                </p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold">
                {Math.round(weather.main.temp)}°
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {weather.weather[0].description}
              </p>
            </div>
          </>
        ) : (
          <p className="font-medium">{name}</p>
        )}
      </Link>

      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${name} from favorites`}
        className="absolute right-1 top-1 h-6 w-6 rounded-full p-0 hover:text-destructive"
        onClick={() => {
          onRemove(id);
          toast.error(`Removed ${name} from Favorites`);
        }}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function FavoriteCities() {
  const { favorites, removeFavorite } = useFavorites();

  if (!favorites.length) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className="text-xl lg:text-2xl font-bold tracking-tight ml-4">
        Favorites
      </h2>
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 pb-2">
          {favorites.map((city) => (
            <FavoriteCityTablet
              key={city.id}
              {...city}
              onRemove={removeFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
