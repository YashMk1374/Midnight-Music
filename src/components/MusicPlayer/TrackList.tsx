import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Track } from "@/services/trackService";
import { cn } from "@/lib/utils";
import { Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackOptions } from "./TrackOptions";

interface TrackListProps {
  className?: string;
  tracks?: Track[];
  onRemove?: (trackId: string) => void;
  showRemoveButton?: boolean;
  compact?: boolean;
  onPlay?: (track: Track) => void; 
}

export const TrackList = ({ 
  className, 
  tracks, 
  onRemove,
  showRemoveButton = false,
  compact = false,
  onPlay
}: TrackListProps) => {
  const { tracks: contextTracks, currentTrack, play, pause, isPlaying } = useMusicPlayer();
  
  // Use provided tracks or fallback to context tracks
  const displayTracks = tracks || contextTracks;
  
  if (!displayTracks.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No tracks available
      </div>
    );
  }
  
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTrackClick = (track: Track) => {
    // If onPlay prop is provided, use it
    if (onPlay) {
      onPlay(track);
      return;
    }
    
    // Otherwise use the default behavior
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : play();
    } else {
      play(track);
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {!compact && <h2 className="font-medium text-lg mb-2">Tracks</h2>}
      <div className="space-y-1">
        {displayTracks.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          
          return (
            <div 
              key={track.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-all",
                "hover:bg-secondary group",
                isCurrentTrack ? "bg-secondary/60" : "bg-transparent"
              )}
            >
              <div 
                className="w-8 h-8 flex items-center justify-center relative rounded bg-secondary/50 cursor-pointer overflow-hidden"
                onClick={() => handleTrackClick(track)}
              >
                {track.album.images && track.album.images[0]?.url ? (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://c.saavncdn.com/default-album-500x500.jpg";
                      e.currentTarget.classList.add("opacity-60");
                    }}
                  />
                ) : (
                  <Music className="w-4 h-4 text-muted-foreground" />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  {isCurrentTrack && isPlaying ? (
                    <div className="w-4 flex justify-between items-end h-3">
                      <div className="w-1 h-full bg-primary animate-pulse"></div>
                      <div className="w-1 h-2 bg-primary animate-pulse delay-75"></div>
                      <div className="w-1 h-3 bg-primary animate-pulse delay-150"></div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 p-0 hidden group-hover:flex absolute inset-0 items-center justify-center"
                    >
                      {isCurrentTrack && isPlaying ? 
                        <Pause className="w-4 h-4 text-white" /> : 
                        <Play className="w-4 h-4 ml-0.5 text-white" />
                      }
                    </Button>
                  )}
                </div>
              </div>
              
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                <div className={cn(
                  "text-sm font-medium truncate",
                  isCurrentTrack ? "text-primary" : "text-foreground"
                )}>
                  {track.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {track.artists.map(artist => artist.name).join(", ")}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {formatDuration(track.duration_ms)}
              </div>
              
              <TrackOptions 
                track={track} 
                onRemove={showRemoveButton ? onRemove : undefined} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
