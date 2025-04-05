
import { useEffect, useState } from "react";
import { fetchTracks } from "@/services/trackService";
import { searchTracks } from "@/services/searchService";
import { Track } from "@/services/trackService";
import { TrackList } from "./TrackList";
import { MusicPlayerNowPlaying } from "./MusicPlayerNowPlaying";
import { MiniPlayer } from "./MiniPlayer";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface MusicPlayerLayoutProps {
  children: React.ReactNode;
}

const MusicPlayerLayout = ({ children }: MusicPlayerLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-black flex flex-col">
      <div className="container mx-auto py-6 px-4 flex-1">
        {children}
      </div>
      
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-10 p-2">
          <MiniPlayerWrapper />
        </div>
      )}
    </div>
  );
};

const MiniPlayerWrapper = () => {
  const { currentTrack } = useMusicPlayer();
  return currentTrack ? <MiniPlayer /> : null;
};

const MusicPlayerContent = () => {
  const { setTracks, currentTrack, addTrack } = useMusicPlayer();
  const [isMobile, setIsMobile] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks
  });
  
  useEffect(() => {
    if (tracks) {
      setTracks(tracks);
    }
  }, [tracks, setTracks]);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const results = await searchTracks(query);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No tracks found for your search");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search tracks");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchTrack = (track: Track) => {
    addTrack(track);
    toast.success(`Added ${track.name} to your playlist`);
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gradient text-2xl font-bold">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBar 
        onSearch={handleSearch} 
        isSearching={isSearching} 
        className="mx-auto mb-6"
      />
      
      <SearchResults 
        results={searchResults} 
        onSelectTrack={handleSelectSearchTrack} 
        isLoading={isSearching}
        className={isMobile && currentTrack ? 'mb-20' : ''}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${isMobile && currentTrack ? 'mb-16' : ''}`}>
          <TrackList />
        </div>
        
        {(!isMobile || !currentTrack) && (
          <div className="hidden md:block">
            <MusicPlayerNowPlaying />
          </div>
        )}
      </div>
    </div>
  );
};

export const MusicPlayer = () => {
  // No longer wrapping with MusicPlayerProvider as it's now at the App level
  return (
    <MusicPlayerLayout>
      <MusicPlayerContent />
    </MusicPlayerLayout>
  );
};
