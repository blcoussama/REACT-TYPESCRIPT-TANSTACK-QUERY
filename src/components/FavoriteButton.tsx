import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WeatherData } from "@/api/types"
import { favoriteId, useFavorites } from "@/hooks/UseFavorites"
import { toast } from "sonner"

interface FavoriteButtonProps {
  data: WeatherData;
}

export function FavoriteButton({ data }: FavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isCurrentlyFavorite = isFavorite(data.coord.lat, data.coord.lon);

  const handleToggleFavorite = () => {
    if (isCurrentlyFavorite) {
      removeFavorite(favoriteId(data.coord.lat, data.coord.lon));
      toast.error(`Removed ${data.name} from Favorites`);
    } else {
      addFavorite({
        name: data.name,
        lat: data.coord.lat,
        lon: data.coord.lon,
        country: data.sys.country,
      });
      toast.success(`Added ${data.name} to Favorites`);
    }
  };

  return (
    <Button
      variant={isCurrentlyFavorite ? "default" : "outline"}
      size="icon"
      onClick={handleToggleFavorite}
      aria-label={`Favorite ${data.name}`}
      aria-pressed={isCurrentlyFavorite}
      title={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
      className={isCurrentlyFavorite ? "bg-yellow-500 hover:bg-yellow-600" : ""}
    >
      <Star
        className={`h-4 w-4 ${isCurrentlyFavorite ? "fill-current" : ""}`}
        aria-hidden="true"
      />
    </Button>
  );
}