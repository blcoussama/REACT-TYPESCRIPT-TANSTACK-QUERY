import { useWeatherQuery } from "@/hooks/UseWeather"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { UseFavorites } from "@/hooks/UseFavorites"
interface FavoriteCityTabletProps {
    id: string;
    name: string;
    lat: number;
    lon: number;
    onRemove: (id: string) => void;
  }
  
  function FavoriteCityTablet({
    id,
    name,
    lat,
    lon,
    onRemove,
  }: FavoriteCityTabletProps) {
    const navigate = useNavigate();
    const { data: weather, isLoading } = useWeatherQuery({ lat, lon });
  
    const handleClick = () => {
      navigate(`/city/${name}?lat=${lat}&lon=${lon}`);
    };
  
    return (
      <div
        onClick={handleClick}
        className="relative flex min-w-[270px] cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 pr-8 shadow-sm transition-all hover:shadow-md"
        role="button"
        tabIndex={0}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-6 w-6 rounded-full p-0  hover:text-destructive-foreground group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
            toast.error(`Removed ${name} from Favorites`);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
  
        {isLoading ? (
          <div className="flex h-8 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center gap-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
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
        ) : null}
      </div>
    );
  }
  
  export function FavoriteCities() {
    const { favorites, removeFavorite } = UseFavorites();
  
    if (!favorites.length) {
      return null;
    }
  
    return (
      <>
      <div className="space-y-4">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight ml-4">Favorites</h1>
        <div className="w-full overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 pb-2">
            {favorites.map((city) => (
              <FavoriteCityTablet
                key={city.id}
                {...city}
                onRemove={() => removeFavorite.mutate(city.id)}
              />
            ))}
          </div>
        </div>
      </div>
      </>
    );
  }