
import { AlbumCover } from "./AlbumCover";
import { TrackInfo } from "./TrackInfo";
import { Controls } from "./Controls";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { TrackOptions } from "./TrackOptions";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";

interface MusicPlayerNowPlayingProps {
  className?: string;
}

export const MusicPlayerNowPlaying = ({ className }: MusicPlayerNowPlayingProps) => {
  const { currentTrack } = useMusicPlayer();
  
  // Use dynamic theme based on album artwork
  useDynamicTheme(currentTrack?.album.images[0]?.url);
  
  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-6 flex flex-col transition-all relative MusicPlayerNowPlaying",
        className
      )}
    >
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <AlbumCover size="lg" />
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-between items-center">
            <TrackInfo className="text-center" />
            {currentTrack && <TrackOptions track={currentTrack} />}
          </div>
          
          <ProgressBar />
          <Controls />
        </div>
      </div>
    </div>
  );
};
