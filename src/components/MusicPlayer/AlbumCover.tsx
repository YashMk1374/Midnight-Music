
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/utils";

interface AlbumCoverProps {
  className?: string;
  size?: "sm" | "lg" | "xl";
}

export const AlbumCover = ({ className, size = "lg" }: AlbumCoverProps) => {
  const { currentTrack } = useMusicPlayer();
  
  const sizeClasses = {
    sm: "w-10 h-10",
    lg: "w-48 h-48",
    xl: "w-64 h-64"
  };

  if (!currentTrack?.album.images[0]?.url) {
    return (
      <div 
        className={cn(
          "rounded-lg bg-secondary/50 animate-pulse", 
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <img
      src={currentTrack.album.images[0]?.url}
      alt={currentTrack.album.name}
      className={cn(
        "rounded-lg shadow-md object-cover", 
        sizeClasses[size],
        className
      )}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://c.saavncdn.com/default-album-500x500.jpg";
      }}
    />
  );
};
