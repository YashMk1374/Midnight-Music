
import { Track } from "@/services/trackService";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, MoreHorizontal } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { TrackOptions } from "./TrackOptions";

interface SearchResultsProps {
  results: Track[];
  onSelectTrack: (track: Track) => void;
  className?: string;
  isLoading?: boolean;
}

export const SearchResults = ({ 
  results, 
  onSelectTrack,
  className,
  isLoading = false
}: SearchResultsProps) => {
  const { play, addTrack, toggleFullscreen } = useMusicPlayer();
  
  if (isLoading) {
    return (
      <div className={cn("mt-4 glass-card rounded-lg p-4", className)}>
        <div className="flex items-center justify-center p-6">
          <div className="text-gradient text-xl">Searching...</div>
        </div>
      </div>
    );
  }
  
  if (results.length === 0) {
    return null;
  }

  const handlePlay = (track: Track) => {
    // Add the track to the queue if it's not already there
    addTrack(track);
    // Play it immediately
    play(track);
    // Show expandable toast
    const toastId = Math.random().toString(36).substring(2, 9);
    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toastId}`;
    toastElement.className = 'cursor-pointer';
    toastElement.onclick = toggleFullscreen;
    document.body.appendChild(toastElement);
  };

  return (
    <Card className={cn("mt-4 glass-card border-0 bg-background/50 backdrop-blur-sm", className)}>
      <CardContent className="p-2">
        <h3 className="text-sm font-medium mb-2 text-muted-foreground px-2 pt-2">Search Results</h3>
        <ul className="space-y-1">
          {results.map((track) => (
            <li key={track.id}>
              <div className="flex items-center gap-3 w-full p-2 text-left rounded-md hover:bg-primary/10 transition-colors">
                <div 
                  className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => handlePlay(track)}
                >
                  <img 
                    src={track.album.images[0]?.url || "https://i.scdn.co/image/ab67616d0000b2732a7db835b912dc5014bd37f4"} 
                    alt={track.album.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artists.map(artist => artist.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => handlePlay(track)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => onSelectTrack(track)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <TrackOptions track={track} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
