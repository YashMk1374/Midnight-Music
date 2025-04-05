import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/Layout/PageLayout";
import { getPlaylists, updatePlaylist, deletePlaylist, removeTrackFromPlaylist } from "@/services/playlistService";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { Track } from "@/services/trackService";
import { Play, Edit, Trash2, ArrowLeft, Save, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const PlaylistDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { play, setTracks } = useMusicPlayer();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const playlists = getPlaylists();
    const foundPlaylist = playlists.find(p => p.id === id);
    
    if (foundPlaylist) {
      setPlaylist(foundPlaylist);
      setEditName(foundPlaylist.name);
      setEditDescription(foundPlaylist.description || "");
    } else {
      navigate("/playlists");
    }
  }, [id, navigate]);
  
  const handleSaveEdit = () => {
    if (!id || !editName.trim()) return;
    
    updatePlaylist(id, {
      name: editName,
      description: editDescription || undefined
    });
    
    setPlaylist({
      ...playlist,
      name: editName,
      description: editDescription || undefined
    });
    
    setIsEditing(false);
  };
  
  const handleDeletePlaylist = () => {
    if (!id) return;
    
    deletePlaylist(id);
    navigate("/playlists");
  };
  
  const handleRemoveTrack = (trackId: string) => {
    if (!id) return;
    
    const success = removeTrackFromPlaylist(id, trackId);
    if (success) {
      setPlaylist({
        ...playlist,
        tracks: playlist.tracks.filter((track: Track) => track.id !== trackId)
      });
    }
  };
  
  const handlePlayAll = () => {
    if (!playlist?.tracks?.length) return;
    
    // Set the new tracks queue and flag as a playlist
    setTracks(playlist.tracks);
    
    // Play the first track - this will be handled specially in MusicPlayerContext
    const firstTrack = playlist.tracks[0];
    // Using the native DOM APIs to dispatch a custom event
    window.dispatchEvent(new CustomEvent('playlistPlay', { detail: { playlistId: id } }));
    play(firstTrack);
  };
  
  const handlePlayTrack = (track: Track) => {
    // Keep the playlist context but start from this specific track
    setTracks(playlist.tracks);
    // Using the native DOM APIs to dispatch a custom event
    window.dispatchEvent(new CustomEvent('playlistPlay', { detail: { playlistId: id } }));
    play(track);
  };
  
  if (!playlist) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gradient text-2xl font-bold">Loading playlist...</div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/playlists")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Back to Playlists</h1>
        </div>
        
        <div className="bg-secondary/20 rounded-xl p-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Playlist name"
                className="text-xl font-bold bg-background/50"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add an optional description"
                className="bg-background/50"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{playlist.name}</h1>
                  {playlist.description && (
                    <p className="text-muted-foreground mb-4">{playlist.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size={isMobile ? "icon" : "default"}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className={`w-4 h-4 ${isMobile ? '' : 'mr-2'}`} />
                    {!isMobile && <span>Edit</span>}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size={isMobile ? "icon" : "default"}
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <Trash2 className={`w-4 h-4 ${isMobile ? '' : 'mr-2'}`} />
                    {!isMobile && <span>Delete</span>}
                  </Button>
                </div>
              </div>
              
              {playlist.tracks.length > 0 && (
                <Button className="mt-4" onClick={handlePlayAll}>
                  <Play className="w-4 h-4 mr-2" />
                  Play All
                </Button>
              )}
            </>
          )}
        </div>
        
        {playlist.tracks.length > 0 ? (
          <TrackList 
            tracks={playlist.tracks} 
            onRemove={handleRemoveTrack} 
            showRemoveButton
            onPlay={handlePlayTrack}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">This playlist is empty</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/search")}
            >
              Search for tracks to add
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default PlaylistDetailPage;
