
import { useEffect } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { MusicPlayerNowPlaying } from "@/components/MusicPlayer/MusicPlayerNowPlaying";
import { useNavigate } from "react-router-dom";
import { ChevronDown, X, RefreshCw, Mic, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { AlbumCover } from "@/components/MusicPlayer/AlbumCover";
import { TrackInfo } from "@/components/MusicPlayer/TrackInfo";
import { Controls } from "@/components/MusicPlayer/Controls";
import { ProgressBar } from "@/components/MusicPlayer/ProgressBar";
import { TrackOptions } from "@/components/MusicPlayer/TrackOptions";
import { LyricsView } from "@/components/MusicPlayer/LyricsView";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";

const PlayerPage = () => {
  const { currentTrack, addRelatedTracks, play } = useMusicPlayer();
  const navigate = useNavigate();
  
  // Use dynamic theme based on album artwork
  useDynamicTheme(currentTrack?.album.images[0]?.url);
  
  // If there's no current track, redirect to home
  useEffect(() => {
    if (!currentTrack) {
      navigate('/');
    }
  }, [currentTrack, navigate]);

  const handleRefreshQueue = async () => {
    if (currentTrack) {
      toast.loading("Refreshing queue...");
      // Clear playSource to 'user' to trigger a full queue refresh
      play(currentTrack);
      await addRelatedTracks(currentTrack.id);
      toast.dismiss();
    }
  };

  if (!currentTrack) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg overflow-auto pb-20"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        backgroundImage: currentTrack ? 
          `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95)), url(${currentTrack.album.images[0]?.url})` : 
          undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto py-4 px-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-medium">Now Playing</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div 
              className="mb-6 cursor-pointer flex justify-center"
            >
              <AlbumCover 
                size="xl"
                className="shadow-xl shadow-primary/20"
              />
            </div>
            
            <div className="w-full space-y-6">
              <div className="flex justify-between items-center">
                <TrackInfo className="text-center" />
                {currentTrack && <TrackOptions track={currentTrack} />}
              </div>
              
              <Tabs defaultValue="player" className="flex-1 flex flex-col">
                <TabsList className="mx-auto">
                  <TabsTrigger value="player">Player</TabsTrigger>
                  <TabsTrigger value="lyrics">
                    <Mic className="w-4 h-4 mr-2" />
                    Lyrics
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <Info className="w-4 h-4 mr-2" />
                    Track Info
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="player" className="flex-1 flex items-center">
                  <div className="w-full space-y-6">
                    <ProgressBar />
                    <Controls showVolume size="lg" />
                    
                    <div className="border-t pt-4 mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Queue</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRefreshQueue}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                      <TrackList compact={true} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="lyrics" className="flex-1 overflow-hidden">
                  <LyricsView className="h-full" />
                </TabsContent>

                <TabsContent value="info" className="flex-1 overflow-auto p-4">
                  {currentTrack && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">Song Details</h3>
                        <div className="mt-2 space-y-2 text-sm">
                          <p><span className="font-medium">Title:</span> {currentTrack.name}</p>
                          <p><span className="font-medium">Artist:</span> {currentTrack.artists.map(a => a.name).join(", ")}</p>
                          <p><span className="font-medium">Album:</span> {currentTrack.album.name}</p>
                          <p><span className="font-medium">Duration:</span> {Math.floor(currentTrack.duration_ms / 60000)}:{Math.floor((currentTrack.duration_ms % 60000) / 1000).toString().padStart(2, '0')}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium">Audio Controls</h3>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button className="w-full" onClick={() => {
                            const audio = document.querySelector('audio');
                            if (audio) {
                              audio.playbackRate = Math.max(0.5, audio.playbackRate - 0.25);
                              toast.info(`Playback speed: ${audio.playbackRate}x`);
                            }
                          }}>
                            Slower
                          </Button>
                          <Button className="w-full" onClick={() => {
                            const audio = document.querySelector('audio');
                            if (audio) {
                              audio.playbackRate = Math.min(2, audio.playbackRate + 0.25);
                              toast.info(`Playback speed: ${audio.playbackRate}x`);
                            }
                          }}>
                            Faster
                          </Button>
                          <Button className="w-full col-span-2" onClick={() => {
                            const audio = document.querySelector('audio');
                            if (audio) {
                              audio.playbackRate = 1;
                              toast.info(`Playback speed reset to 1x`);
                            }
                          }}>
                            Reset Speed
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerPage;
