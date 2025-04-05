
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/utils";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";

interface TrackInfoProps {
  className?: string;
  size?: "sm" | "lg";
}

export const TrackInfo = ({ className, size = "lg" }: TrackInfoProps) => {
  const { currentTrack } = useMusicPlayer();
  
  // Use dynamic theme based on album artwork
  useDynamicTheme(currentTrack?.album.images[0]?.url);
  
  const sizeClasses = {
    sm: "space-y-0",
    lg: "space-y-1"
  };
  
  const titleClasses = {
    sm: "text-sm font-medium",
    lg: "text-xl font-bold"
  };
  
  const artistClasses = {
    sm: "text-xs text-muted-foreground",
    lg: "text-sm text-muted-foreground"
  };

  if (!currentTrack) {
    return (
      <div className={cn("flex flex-col", sizeClasses[size], className)}>
        <div className={cn("animate-pulse bg-secondary/50 rounded h-5 w-32", titleClasses[size])}></div>
        <div className={cn("animate-pulse bg-secondary/30 rounded h-4 w-24", artistClasses[size])}></div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col animate-fade-in", sizeClasses[size], className)}>
      <h3 className={cn("truncate", titleClasses[size])}>
        {currentTrack.name || "Unknown Track"}
      </h3>
      <p className={cn("truncate", artistClasses[size])}>
        {currentTrack.artists?.map(artist => artist.name).join(", ") || "Unknown Artist"}
      </p>
    </div>
  );
};
