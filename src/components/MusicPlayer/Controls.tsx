import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/utils";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, Volume1, VolumeX,
  Shuffle, Repeat, Heart, Download, 
  Maximize2, Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { isTrackLiked, likeTrack, unlikeTrack } from "@/services/playlistService";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { getPlaylists, addTrackToPlaylist } from "@/services/playlistService";
import { downloadFile } from "@/utils/storagePermission";

interface ControlsProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showVolume?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const Controls = ({ 
  size = "md", 
  className,
  showVolume = false,
  onClick
}: ControlsProps) => {
  const { 
    isPlaying, 
    play, 
    pause, 
    playNext, 
    playPrev, 
    toggleShuffle,
    toggleRepeat,
    isShuffleOn,
    isRepeatOn,
    volume,
    setVolume,
    toggleMute,
    currentTrack,
    toggleFullscreen,
    addRelatedTracks
  } = useMusicPlayer();
  
  const [liked, setLiked] = useState<boolean>(
    currentTrack ? isTrackLiked(currentTrack.id) : false
  );
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  
  // Update liked state when track changes
  useEffect(() => {
    if (currentTrack) {
      setLiked(isTrackLiked(currentTrack.id));
    }
  }, [currentTrack]);
  
  const getIconSize = () => {
    switch (size) {
      case "sm": return "h-4 w-4";
      case "lg": return "h-6 w-6";
      default: return "h-5 w-5";
    }
  };
  
  const handlePlayPause = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
    isPlaying ? pause() : play();
  };
  
  const handleLikeToggle = () => {
    if (!currentTrack) return;
    
    if (liked) {
      unlikeTrack(currentTrack.id);
      setLiked(false);
    } else {
      likeTrack(currentTrack);
      setLiked(true);
    }
  };
  
  const handleDownload = async () => {
    if (!currentTrack?.preview_url) {
      toast.error("No preview available for download");
      return;
    }
    
    const fileName = `${currentTrack.name} - ${currentTrack.artists.map(a => a.name).join(', ')}.mp3`;
    const success = await downloadFile(currentTrack.preview_url, fileName);
    
    if (success) {
      // Add to downloads in localStorage
      try {
        const storedDownloads = localStorage.getItem('music_player_downloads') || '[]';
        const downloads = JSON.parse(storedDownloads);
        
        // Check if track is already in downloads
        if (!downloads.some((t: any) => t.id === currentTrack.id)) {
          const updatedDownloads = [currentTrack, ...downloads];
          localStorage.setItem('music_player_downloads', JSON.stringify(updatedDownloads));
        }
      } catch (error) {
        console.error('Error updating downloads:', error);
      }
    }
  };
  
  const handleAddToPlaylist = (playlistId: string) => {
    if (!currentTrack) return;
    
    addTrackToPlaylist(playlistId, currentTrack);
    setShowPlaylistDialog(false);
  };
  
  const handleRefreshQueue = async () => {
    if (!currentTrack) return;
    
    toast.loading("Refreshing recommendations...");
    await addRelatedTracks(currentTrack.id);
    toast.dismiss();
  };
  
  // Determine volume icon based on volume level
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} onClick={onClick}>
      <div className={cn(
        "flex items-center justify-center gap-2", 
        size === "sm" ? "w-auto" : "w-full"
      )}>
        <Button
          variant="ghost"
          size={size === "lg" ? "default" : "icon"}
          onClick={toggleShuffle}
          className={cn(
            "rounded-full",
            isShuffleOn ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Shuffle className={getIconSize()} />
        </Button>

        <Button
          variant="ghost"
          size={size === "lg" ? "default" : "icon"}
          onClick={playPrev}
          className="rounded-full"
        >
          <SkipBack className={getIconSize()} />
        </Button>

        <Button
          variant={size === "sm" ? "ghost" : "default"}
          size={size === "lg" ? "lg" : "icon"}
          onClick={handlePlayPause}
          className={cn(
            "rounded-full",
            size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          {isPlaying ? (
            <Pause className={getIconSize()} />
          ) : (
            <Play className={cn(getIconSize(), "ml-0.5")} />
          )}
        </Button>

        <Button
          variant="ghost"
          size={size === "lg" ? "default" : "icon"}
          onClick={playNext}
          className="rounded-full"
        >
          <SkipForward className={getIconSize()} />
        </Button>

        <Button
          variant="ghost"
          size={size === "lg" ? "default" : "icon"}
          onClick={toggleRepeat}
          className={cn(
            "rounded-full",
            isRepeatOn ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Repeat className={getIconSize()} />
        </Button>
      </div>

      {size !== "sm" && (
        <div className="flex items-center justify-center gap-2 mt-2 w-full">
          {currentTrack && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeToggle}
                className={cn(
                  "rounded-full",
                  liked ? "text-red-500" : "text-muted-foreground"
                )}
              >
                <Heart 
                  className={getIconSize()} 
                  fill={liked ? "currentColor" : "none"}
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylistDialog(true)}
                className="rounded-full text-muted-foreground"
              >
                <Plus className={getIconSize()} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="rounded-full text-muted-foreground"
                disabled={!currentTrack?.preview_url}
              >
                <Download className={getIconSize()} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshQueue}
                className="rounded-full text-muted-foreground"
              >
                <Repeat className={getIconSize()} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-full text-muted-foreground"
              >
                <Maximize2 className={getIconSize()} />
              </Button>
            </>
          )}
        </div>
      )}

      {showVolume && (
        <div className="flex items-center gap-2 mt-4 w-full max-w-xs mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full"
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
          
          <Slider
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0] / 100)}
            className="w-full"
          />
        </div>
      )}

      {/* Add to Playlist Dialog */}
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-72 overflow-y-auto">
            {getPlaylists().length > 0 ? (
              getPlaylists().map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  {playlist.name}
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No playlists yet. Create a playlist first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
