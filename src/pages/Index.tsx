
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Search, Heart, Download, Headphones } from "lucide-react";
import { Track } from "@/services/trackService";
import { getDiverseRecommendations } from "@/services/recommendationService";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { AlbumCover } from "@/components/MusicPlayer/AlbumCover";

const Index = () => {
  const navigate = useNavigate();
  const { play, currentTrack } = useMusicPlayer();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load trending tracks on first visit
    const loadTrendingTracks = async () => {
      setLoading(true);
      const recommendations = await getDiverseRecommendations([], 10);
      setTrendingTracks(recommendations);
      setLoading(false);
    };
    
    loadTrendingTracks();
  }, []);
  
  const handlePlayTrack = (track: Track) => {
    play(track);
    navigate('/player');
  };
  
  return (
    <motion.div 
      className="min-h-screen pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Midnight Music</h1>
          <p className="text-muted-foreground">Discover and enjoy your favorite tracks</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Button 
            variant="secondary" 
            className="p-6 h-auto flex flex-col items-center gap-2"
            onClick={() => navigate('/player')}
          >
            <Headphones className="h-8 w-8" />
            <span>Now Playing</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="p-6 h-auto flex flex-col items-center gap-2"
            onClick={() => navigate('/search')}
          >
            <Search className="h-8 w-8" />
            <span>Search</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="p-6 h-auto flex flex-col items-center gap-2"
            onClick={() => navigate('/liked')}
          >
            <Heart className="h-8 w-8" />
            <span>Liked Songs</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="p-6 h-auto flex flex-col items-center gap-2"
            onClick={() => navigate('/downloads')}
          >
            <Download className="h-8 w-8" />
            <span>Downloads</span>
          </Button>
        </div>
        
        {currentTrack && (
          <div className="mt-10">
            <h2 className="text-lg font-medium mb-4">Currently Playing</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-secondary/30 rounded-lg">
              <AlbumCover size="sm" className="w-20 h-20 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium truncate">{currentTrack.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.artists.map(a => a.name).join(', ')}
                </p>
              </div>
              <Button 
                variant="default" 
                className="mt-4 sm:mt-0" 
                onClick={() => navigate('/player')}
              >
                <Play className="mr-2 h-4 w-4" />
                Continue Listening
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-4">Trending Tracks</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <TrackList 
              tracks={trendingTracks} 
              onPlay={handlePlayTrack} 
              compact
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
