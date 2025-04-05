
import { useState } from "react";
import { Track } from "@/services/trackService";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Heart, Plus, Trash, Download, HeartOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { likeTrack, unlikeTrack, isTrackLiked, getPlaylists, addTrackToPlaylist } from "@/services/playlistService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { downloadFile } from "@/utils/storagePermission";

interface TrackOptionsProps {
  track: Track;
  onRemove?: (trackId: string) => void;
}

export const TrackOptions = ({ track, onRemove }: TrackOptionsProps) => {
  const [liked, setLiked] = useState<boolean>(isTrackLiked(track.id));
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  
  const handleLikeToggle = () => {
    if (liked) {
      unlikeTrack(track.id);
      setLiked(false);
    } else {
      likeTrack(track);
      setLiked(true);
    }
  };
  
  const handleDownload = async () => {
    if (!track.preview_url) {
      toast.error("No preview available for download");
      return;
    }
    
    const fileName = `${track.name} - ${track.artists.map(a => a.name).join(', ')}.mp3`;
    await downloadFile(track.preview_url, fileName);
    
    // Add to downloads in localStorage
    try {
      const storedDownloads = localStorage.getItem('music_player_downloads') || '[]';
      const downloads = JSON.parse(storedDownloads);
      
      // Check if track is already in downloads
      if (!downloads.some((t: Track) => t.id === track.id)) {
        const updatedDownloads = [track, ...downloads];
        localStorage.setItem('music_player_downloads', JSON.stringify(updatedDownloads));
      }
    } catch (error) {
      console.error('Error updating downloads:', error);
    }
  };
  
  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setShowPlaylistDialog(false);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLikeToggle}>
            {liked ? (
              <>
                <HeartOff className="h-4 w-4 mr-2" />
                Unlike
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Like
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPlaylistDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add to Playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={() => onRemove(track.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
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
    </>
  );
};
