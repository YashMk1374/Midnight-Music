
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Track } from "@/services/trackService";
import { fetchRecommendations } from "@/services/recommendationService";
import { getLikedTracks, getPlaylists } from "@/services/playlistService";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, Search, ListMusic, Music } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/components/MusicPlayer/SearchBar";
import { SearchResults } from "@/components/MusicPlayer/SearchResults";
import { searchTracks } from "@/services/searchService";
import { toast } from "sonner";

const HomePage = () => {
  const { currentTrack, play, setTracks, addTrack } = useMusicPlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  
  // Get liked tracks for recommendations
  const likedTracks = getLikedTracks();
  const playlists = getPlaylists();
  
  // Get recommendations based on liked tracks if available
  const seedTrackIds = likedTracks.length > 0 
    ? likedTracks.slice(0, 3).map(track => track.id)
    : undefined;
  
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', seedTrackIds],
    queryFn: () => fetchRecommendations(seedTrackIds),
  });
  
  // Update searchResults when recommendations are fetched
  useEffect(() => {
    if (recommendations) {
      // Any additional logic you want to run when recommendations change
    }
  }, [recommendations]);
  
  const { isLoading: isSearching, refetch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchTracks(searchQuery),
    enabled: false,
  });
  
  // Update searchResults after search refetch
  useEffect(() => {
    refetch().then(result => {
      if (result.data) {
        setSearchResults(result.data);
        if (result.data.length === 0 && searchQuery.trim() !== '') {
          toast.info("No results found for your search");
        }
      }
    }).catch(error => {
      console.error("Search error:", error);
      toast.error("Failed to search tracks");
    });
  }, [searchQuery, refetch]);

  // Get recently played tracks from localStorage on component mount
  useEffect(() => {
    const recentlyPlayedData = localStorage.getItem('music_player_recent');
    if (recentlyPlayedData) {
      try {
        setRecentlyPlayed(JSON.parse(recentlyPlayedData));
      } catch (error) {
        console.error('Error parsing recently played tracks:', error);
      }
    }
  }, []);
  
  const handlePlayRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return;
    
    setTracks(recommendations);
    play(recommendations[0]);
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
    }
  };

  const handleSelectTrack = (track: Track) => {
    addTrack(track);
    play(track);
    toast.success(`Now playing: ${track.name}`);
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Discover Music</h1>

        <SearchBar 
          onSearch={handleSearch} 
          isSearching={isSearching}
          className="mx-auto mb-6"
        />
        
        {searchResults.length > 0 && (
          <SearchResults 
            results={searchResults} 
            onSelectTrack={handleSelectTrack} 
            isLoading={isSearching}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 w-full md:max-w-xs">
            <Card
              className="hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate("/search")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-28">
                <Search className="mb-2 text-primary" />
                <span className="text-sm font-medium">Advanced Search</span>
              </CardContent>
            </Card>
            
            <Card
              className="hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate("/playlists")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-28">
                <ListMusic className="mb-2 text-primary" />
                <span className="text-sm font-medium">Playlists</span>
              </CardContent>
            </Card>
            
            <Card
              className="hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate("/liked")}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-28">
                <Music className="mb-2 text-primary" />
                <span className="text-sm font-medium">Liked Songs</span>
              </CardContent>
            </Card>
            
            {currentTrack && (
              <Card
                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => play()}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-28">
                  <Play className="mb-2 text-primary" />
                  <span className="text-sm font-medium">Now Playing</span>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Recommendations Section */}
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recommended for You</h2>
                
                {recommendations && recommendations.length > 0 && (
                  <Button 
                    size="sm"
                    onClick={handlePlayRecommendations}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play All
                  </Button>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading recommendations...</p>
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="max-h-64 overflow-y-auto pr-2">
                  <TrackList 
                    tracks={recommendations.slice(0, 5)} 
                    compact
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32">
                  <p className="text-muted-foreground mb-2">No recommendations available</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/search")}
                  >
                    Discover Music
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recently Played</h2>
            <TrackList tracks={recentlyPlayed.slice(0, 5)} compact />
            
            {recentlyPlayed.length > 5 && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => navigate("/history")}
              >
                View all
              </Button>
            )}
          </div>
        )}
        
        {/* Your Playlists Section */}
        {playlists.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Playlists</h2>
              <Button 
                variant="link"
                onClick={() => navigate("/playlists")}
              >
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.slice(0, 3).map(playlist => (
                <Card 
                  key={playlist.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default HomePage;
