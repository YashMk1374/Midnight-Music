import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '@/services/trackService';
import { toast } from 'sonner';
import { fetchRecommendations, getDiverseRecommendations } from '@/services/recommendationService';
import { Lyrics, fetchLyrics } from '@/services/lyricsService';
import { getLyricsJioSaavn } from '@/services/jioSaavnService';

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  tracks: Track[];
  isFullscreen: boolean;
  currentLyrics: Lyrics | null;
  setTracks: (tracks: Track[]) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  play: (track?: Track) => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFullscreen: () => void;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  addRelatedTracks: (trackId: string) => Promise<void>;
  playSource: 'user' | 'playlist' | 'queue';
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const RECENT_TRACKS_KEY = 'music_player_recent';
const MAX_RECENT_TRACKS = 20;

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracksList] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [trackHistory, setTrackHistory] = useState<Track[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState<Lyrics | null>(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [playSource, setPlaySource] = useState<'user' | 'playlist' | 'queue'>('user');
  const [originalPlaylistTracks, setOriginalPlaylistTracks] = useState<Track[]>([]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    setAudioElement(audio);

    // Add playlist play event listener
    const handlePlaylistPlay = (event: Event) => {
      const customEvent = event as CustomEvent;
      setPlaySource('playlist');
    };

    window.addEventListener('playlistPlay', handlePlaylistPlay);

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('playlistPlay', handlePlaylistPlay);
    };
  }, []);

  // Update audio source when current track changes
  useEffect(() => {
    if (!audioElement || !currentTrack?.preview_url) return;
    
    audioElement.src = currentTrack.preview_url;
    audioElement.load();
    
    if (isPlaying) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback error:", error);
        });
      }
    }
    
    setDuration(currentTrack.duration_ms / 1000);
    
    // Fetch lyrics when track changes - try JioSaavn API with lyrics=true parameter
    if (currentTrack.id) {
      // Try JioSaavn lyrics first with the new parameter
      getLyricsJioSaavn(currentTrack.id).then(lyrics => {
        if (lyrics && lyrics !== "Lyrics not available") {
          // Process the raw lyrics text into lines
          const lyricsLines = lyrics
            .split('\n')
            .filter(line => line.trim() !== '')
            .map((line, index) => ({ 
              words: line.trim(), 
              startTimeMs: index * 5000 // Approximate timing, 5 seconds per line
            }));
            
          setCurrentLyrics({ 
            lines: lyricsLines,
            syncType: "UNSYNCED",
            isAvailable: true
          });
        } else {
          // Fall back to original lyrics service
          fetchLyrics(currentTrack.id).then(lyrics => {
            setCurrentLyrics(lyrics);
          });
        }
      }).catch(() => {
        // If JioSaavn fails, try original lyrics service
        fetchLyrics(currentTrack.id).then(lyrics => {
          setCurrentLyrics(lyrics);
        });
      });
      
      // If this is a user-initiated play and not from the queue,
      // update the queue with related tracks based on the new current track
      if (playSource === 'user' && !isLoadingRelated) {
        // Clear existing queue and add related tracks
        setTracksList([]);
        addRelatedTracks(currentTrack.id);
      }
      // If less than 3 tracks in queue, add more related tracks
      else if (tracks.length < 3 && !isLoadingRelated) {
        addRelatedTracks(currentTrack.id);
      }
    }
    
    // Create an expandable notification
    const toastInstance = toast.success(
      <div className="cursor-pointer w-full">
        <div className="flex items-center gap-2">
          <img 
            src={currentTrack.album.images[0]?.url} 
            alt={currentTrack.name} 
            className="w-10 h-10 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://c.saavncdn.com/default-album-500x500.jpg";
            }}
          />
          <div>
            <p className="font-medium">{currentTrack.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentTrack.artists.map(artist => artist.name).join(", ")}
            </p>
          </div>
        </div>
      </div>,
      {
        duration: 5000
      }
    );

    // Add click handler to toggle fullscreen on toast click
    setTimeout(() => {
      const toasts = document.querySelectorAll('.sonner-toast');
      toasts.forEach(toastElement => {
        if (toastElement.textContent?.includes(currentTrack.name)) {
          toastElement.addEventListener('click', () => {
            toggleFullscreen();
          });
        }
      });
    }, 100);
    
    // Add to recently played tracks in localStorage
    if (currentTrack) {
      try {
        const recentTracks = JSON.parse(localStorage.getItem(RECENT_TRACKS_KEY) || '[]');
        
        // Remove if already exists to avoid duplicates
        const filteredTracks = recentTracks.filter(
          (track: Track) => track.id !== currentTrack.id
        );
        
        // Add current track to the beginning
        const updatedTracks = [currentTrack, ...filteredTracks].slice(0, MAX_RECENT_TRACKS);
        
        localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(updatedTracks));
      } catch (error) {
        console.error("Error updating recently played tracks:", error);
      }
    }
  }, [currentTrack, audioElement]);

  // Handle play/pause state
  useEffect(() => {
    if (!audioElement) return;
    
    if (isPlaying) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback error:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  // Update progress while playing
  useEffect(() => {
    if (!audioElement) return;
    
    const updateProgress = () => {
      setProgress(audioElement.currentTime);
    };
    
    const handleEnded = () => {
      if (isRepeatOn) {
        audioElement.currentTime = 0;
        audioElement.play();
      } else {
        playNext();
      }
    };
    
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);
    
    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, isRepeatOn]);

  // Update volume
  useEffect(() => {
    if (!audioElement) return;
    audioElement.volume = volume;
  }, [volume, audioElement]);

  const setTracks = (newTracks: Track[]) => {
    setTracksList(newTracks);
    // Save original playlist tracks if this is from a playlist
    if (playSource === 'playlist') {
      setOriginalPlaylistTracks(newTracks);
    }
  };
  
  const addTrack = (track: Track) => {
    // Check if track already exists
    if (tracks.some(t => t.id === track.id)) {
      toast.info(`"${track.name}" is already in your playlist`);
      return;
    }
    
    setTracksList(prev => [...prev, track]);
    toast.success(`Added "${track.name}" to playlist`);
  };
  
  const removeTrack = (trackId: string) => {
    setTracksList(prev => prev.filter(track => track.id !== trackId));
  };

  const play = (track?: Track) => {
    if (track) {
      setCurrentTrack(track);
      setTrackHistory(prev => [...prev, track]);
      setPlaySource('user'); // User initiated play
    } else if (currentTrack) {
      setIsPlaying(true);
    } else if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setTrackHistory([tracks[0]]);
      setPlaySource('queue'); // Playing from queue
    }
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    
    let nextIndex;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    
    if (isShuffleOn) {
      // Random track that's different from current
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      // Next track in order or loop back to first
      nextIndex = currentIndex + 1 < tracks.length ? currentIndex + 1 : 0;
    }
    
    // Set play source to queue since this is automatic playback
    setPlaySource('queue');
    setCurrentTrack(tracks[nextIndex]);
    setTrackHistory(prev => [...prev, tracks[nextIndex]]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    
    if (progress > 3) {
      // If more than 3 seconds into the track, restart it
      if (audioElement) {
        audioElement.currentTime = 0;
      }
      return;
    }
    
    // Get previous track from history
    if (trackHistory.length > 1) {
      const newHistory = [...trackHistory];
      newHistory.pop(); // Remove current track
      const prevTrack = newHistory[newHistory.length - 1]; // Get previous track
      
      setPlaySource('queue');
      setCurrentTrack(prevTrack);
      setTrackHistory(newHistory);
      setIsPlaying(true);
    } else {
      // If no history or at the beginning, go to the last track
      const prevIndex = tracks.findIndex(t => t.id === currentTrack?.id) - 1;
      const newIndex = prevIndex >= 0 ? prevIndex : tracks.length - 1;
      
      setPlaySource('queue');
      setCurrentTrack(tracks[newIndex]);
      setTrackHistory([tracks[newIndex]]);
      setIsPlaying(true);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolumeState(0);
    } else {
      setVolumeState(0.7);
    }
  };

  const seek = (position: number) => {
    if (audioElement) {
      audioElement.currentTime = position;
      setProgress(position);
    }
  };

  const toggleShuffle = () => {
    setIsShuffleOn(prev => !prev);
  };

  const toggleRepeat = () => {
    setIsRepeatOn(prev => !prev);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  const addRelatedTracks = async (trackId: string): Promise<void> => {
    if (!trackId || isLoadingRelated) return;
    
    setIsLoadingRelated(true);
    try {
      // If we're playing from a playlist, prioritize other tracks from the same playlist
      if (playSource === 'playlist' && originalPlaylistTracks.length > 0) {
        // Keep original playlist tracks but reorder them to prioritize similar genres
        const remainingPlaylistTracks = originalPlaylistTracks.filter(
          track => track.id !== currentTrack?.id
        );
        
        if (remainingPlaylistTracks.length > 0) {
          // Set queue to remaining playlist tracks
          setTracksList(remainingPlaylistTracks);
          
          // If there are few tracks left, supplement with recommendations
          if (remainingPlaylistTracks.length < 5) {
            // Get diverse recommendations using multiple tracks as seeds
            const seedTracks = [trackId, ...remainingPlaylistTracks.slice(0, 2).map(t => t.id)];
            const recommendations = await getDiverseRecommendations(seedTracks, 10);
            
            // Filter out tracks that are already in the playlist
            const newTracks = recommendations.filter(
              newTrack => !remainingPlaylistTracks.some(existingTrack => existingTrack.id === newTrack.id)
            );
            
            if (newTracks.length > 0) {
              setTracksList(prev => [...prev, ...newTracks.slice(0, 5)]);
            }
          }
          
          setIsLoadingRelated(false);
          return;
        }
      }
      
      // For user-initiated plays or when not in a playlist, get diverse recommendations
      // Use recently played tracks as additional seeds if available
      let seedTracks = [trackId];
      
      try {
        const recentTracks = JSON.parse(localStorage.getItem(RECENT_TRACKS_KEY) || '[]');
        const recentTrackIds = recentTracks
          .slice(0, 3)
          .filter((track: Track) => track.id !== trackId)
          .map((track: Track) => track.id);
        
        seedTracks = [...seedTracks, ...recentTrackIds];
      } catch (error) {
        console.error("Error getting recent tracks for recommendations:", error);
      }
      
      const recommendations = await getDiverseRecommendations(seedTracks, 10);
      
      if (recommendations.length > 0) {
        // If this was user-initiated, replace the queue
        if (playSource === 'user') {
          setTracksList(recommendations);
          toast.success(`Updated queue with ${recommendations.length} similar tracks`);
        } else {
          // Otherwise, filter out tracks that are already in the playlist
          const existingIds = new Set(tracks.map(t => t.id));
          const newTracks = recommendations.filter(track => !existingIds.has(track.id));
          
          if (newTracks.length > 0) {
            setTracksList(prev => [...prev, ...newTracks.slice(0, 5)]);
            toast.success(`Added ${newTracks.length} tracks to queue`);
          } else {
            toast.info("Looking for more diverse recommendations...");
            
            // If we didn't find any new tracks, try getting completely different recommendations
            const moreRecommendations = await fetchRecommendations();
            const moreDiverseTracks = moreRecommendations.filter(
              newTrack => !existingIds.has(newTrack.id)
            );
            
            if (moreDiverseTracks.length > 0) {
              setTracksList(prev => [...prev, ...moreDiverseTracks.slice(0, 5)]);
              toast.success(`Added ${moreDiverseTracks.length} diverse tracks to queue`);
            } else {
              toast.info("No new recommendations available");
            }
          }
        }
      } else {
        toast.info("No recommendations available");
      }
    } catch (error) {
      console.error("Error fetching related tracks:", error);
      toast.error("Failed to get recommendations");
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const contextValue: MusicPlayerContextType = {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    tracks,
    isFullscreen,
    currentLyrics,
    setTracks,
    addTrack,
    removeTrack,
    play,
    pause,
    playNext,
    playPrev,
    setVolume,
    toggleMute,
    seek,
    toggleShuffle,
    toggleRepeat,
    toggleFullscreen,
    isShuffleOn,
    isRepeatOn,
    addRelatedTracks,
    playSource
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
