
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { getLikedTracks, unlikeTrack } from "@/services/playlistService";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { Track } from "@/services/trackService";
import { Play, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const LikedSongsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { play, setTracks } = useMusicPlayer();
  
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  
  useEffect(() => {
    setLikedTracks(getLikedTracks());
  }, []);
  
  const handleUnlikeTrack = (trackId: string) => {
    const success = unlikeTrack(trackId);
    if (success) {
      setLikedTracks(likedTracks.filter(track => track.id !== trackId));
    }
  };
  
  const handlePlayAll = () => {
    if (!likedTracks.length) return;
    
    setTracks(likedTracks);
    play(likedTracks[0]);
  };
  
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
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                <h1 className="text-2xl font-bold">Liked Songs</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {likedTracks.length} {likedTracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
            
            {likedTracks.length > 0 && (
              <Button onClick={handlePlayAll}>
                <Play className="w-4 h-4 mr-2" />
                Play All
              </Button>
            )}
          </div>
        </div>
        
        {likedTracks.length > 0 ? (
          <TrackList 
            tracks={likedTracks} 
            onRemove={handleUnlikeTrack} 
            showRemoveButton
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">You haven't liked any songs yet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/search")}
            >
              Discover songs to like
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default LikedSongsPage;
