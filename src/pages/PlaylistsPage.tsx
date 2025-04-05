
import { useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { createPlaylist, getPlaylists, Playlist } from "@/services/playlistService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListMusic } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(getPlaylists());
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) return;
    
    const newPlaylist = createPlaylist(playlistName, playlistDescription);
    setPlaylists([...playlists, newPlaylist]);
    setPlaylistName("");
    setPlaylistDescription("");
    setDialogOpen(false);
    
    // Navigate to the new playlist
    navigate(`/playlist/${newPlaylist.id}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Playlists</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="w-4 h-4" />
                <span className={isMobile ? "sr-only" : ""}>New Playlist</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="playlist-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="playlist-name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="playlist-description" className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    id="playlist-description"
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    placeholder="A collection of my favorite tracks"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreatePlaylist}
                  disabled={!playlistName.trim()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Liked Songs "Playlist" */}
          <Card 
            className="hover:bg-secondary/30 transition-colors cursor-pointer"
            onClick={() => navigate('/liked')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-md flex items-center justify-center">
                  <ListMusic className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Liked Songs</h3>
                  <p className="text-sm text-muted-foreground">Your favorite tracks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id}
              className="hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-md flex items-center justify-center">
                    <ListMusic className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{playlist.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {formatDate(playlist.createdAt)} • {playlist.tracks.length} tracks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {playlists.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <ListMusic className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
              <p className="text-muted-foreground mb-4">Create your first playlist to start organizing your music</p>
              <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PlaylistsPage;
