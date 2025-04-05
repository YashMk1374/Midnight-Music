
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/MusicPlayer/SearchBar";
import { SearchResults } from "@/components/MusicPlayer/SearchResults";
import { searchTracks } from "@/services/searchService";
import { Track } from "@/services/trackService";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Filter } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const { addTrack, play } = useMusicPlayer();
  const navigate = useNavigate();
  
  const { isLoading: isSearching, refetch } = useQuery({
    queryKey: ['search', searchQuery, artist, genre],
    queryFn: () => searchTracks(searchQuery),
    enabled: false,
  });
  
  // Update searchResults after a refetch
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      refetch().then(result => {
        if (result.data) {
          setSearchResults(result.data);
          if (result.data.length === 0) {
            toast.info("No tracks found for your search");
          }
        }
      }).catch(error => {
        console.error("Search error:", error);
        toast.error("Failed to search tracks");
      });
    }
  }, [searchQuery, refetch]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleAdvancedSearch = () => {
    // Combine basic and advanced search parameters
    const combinedQuery = [
      searchQuery,
      artist ? `artist:${artist}` : "", 
      genre ? `genre:${genre}` : ""
    ].filter(Boolean).join(" ");
    
    if (combinedQuery) {
      setSearchQuery(combinedQuery);
    } else {
      toast.error("Please enter at least one search term");
    }
  };

  const handleSelectTrack = (track: Track) => {
    addTrack(track);
    play(track);
    
    const toastInstance = toast.success(`Playing ${track.name}`, {
      duration: 3000,
      className: "cursor-pointer",
    });
    
    // Add a click event listener to the toast via DOM
    setTimeout(() => {
      const toasts = document.querySelectorAll('.sonner-toast');
      toasts.forEach(toastElement => {
        if (toastElement.textContent?.includes(track.name)) {
          toastElement.addEventListener('click', () => {
            navigate('/player');
          });
        }
      });
    }, 100);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Advanced Search</h1>
        
        <div className="flex flex-col space-y-4">
          <SearchBar 
            onSearch={handleSearch} 
            isSearching={isSearching}
            className="mx-auto"
          />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAdvancedSearch(!advancedSearch)}
            className="flex items-center mx-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {advancedSearch ? "Hide" : "Show"} Advanced Options
          </Button>
        </div>

        {advancedSearch && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Search Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input 
                  id="artist" 
                  placeholder="Search by artist..." 
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input 
                  id="genre" 
                  placeholder="pop, rock, jazz..." 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleAdvancedSearch} 
                disabled={isSearching}
                className="w-full"
              >
                Search
              </Button>
            </CardContent>
          </Card>
        )}
        
        <SearchResults 
          results={searchResults} 
          onSelectTrack={handleSelectTrack} 
          isLoading={isSearching}
        />
        
        {!searchResults.length && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="w-16 h-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-medium">Start your music journey</h3>
            <p className="text-muted-foreground mt-2">
              Search for your favorite songs, artists, or genres
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;
