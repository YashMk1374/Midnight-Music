
import { toast } from "sonner";
import { Track } from "./trackService";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: number;
}

// Local storage keys
const PLAYLISTS_KEY = 'music_player_playlists';
const LIKED_PLAYLIST_KEY = 'music_player_liked_tracks';

// Get all playlists from localStorage
export const getPlaylists = (): Playlist[] => {
  const playlists = localStorage.getItem(PLAYLISTS_KEY);
  return playlists ? JSON.parse(playlists) : [];
};

// Create a new playlist
export const createPlaylist = (name: string, description?: string): Playlist => {
  const playlists = getPlaylists();
  
  const newPlaylist: Playlist = {
    id: `playlist_${Date.now()}`,
    name,
    description,
    tracks: [],
    createdAt: Date.now(),
  };
  
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([...playlists, newPlaylist]));
  toast.success(`Playlist "${name}" created`);
  return newPlaylist;
};

// Add track to a playlist
export const addTrackToPlaylist = (playlistId: string, track: Track): boolean => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) {
    toast.error("Playlist not found");
    return false;
  }
  
  // Check if track already exists in playlist
  if (playlists[playlistIndex].tracks.some(t => t.id === track.id)) {
    toast.info("Track already in playlist");
    return false;
  }
  
  playlists[playlistIndex].tracks.push(track);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  toast.success(`Added to ${playlists[playlistIndex].name}`);
  return true;
};

// Remove track from a playlist
export const removeTrackFromPlaylist = (playlistId: string, trackId: string): boolean => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) {
    toast.error("Playlist not found");
    return false;
  }
  
  const trackIndex = playlists[playlistIndex].tracks.findIndex(t => t.id === trackId);
  
  if (trackIndex === -1) {
    toast.error("Track not found in playlist");
    return false;
  }
  
  playlists[playlistIndex].tracks.splice(trackIndex, 1);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  toast.success("Track removed from playlist");
  return true;
};

// Delete a playlist
export const deletePlaylist = (playlistId: string): boolean => {
  const playlists = getPlaylists();
  const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
  
  if (playlists.length === updatedPlaylists.length) {
    toast.error("Playlist not found");
    return false;
  }
  
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updatedPlaylists));
  toast.success("Playlist deleted");
  return true;
};

// Update playlist details
export const updatePlaylist = (playlistId: string, updates: Partial<Playlist>): boolean => {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) {
    toast.error("Playlist not found");
    return false;
  }
  
  playlists[playlistIndex] = {
    ...playlists[playlistIndex],
    ...updates,
  };
  
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  toast.success("Playlist updated");
  return true;
};

// Liked tracks management
export const getLikedTracks = (): Track[] => {
  const tracks = localStorage.getItem(LIKED_PLAYLIST_KEY);
  return tracks ? JSON.parse(tracks) : [];
};

export const likeTrack = (track: Track): boolean => {
  const likedTracks = getLikedTracks();
  
  if (likedTracks.some(t => t.id === track.id)) {
    toast.info("Track already liked");
    return false;
  }
  
  localStorage.setItem(LIKED_PLAYLIST_KEY, JSON.stringify([...likedTracks, track]));
  toast.success("Added to Liked Songs");
  return true;
};

export const unlikeTrack = (trackId: string): boolean => {
  const likedTracks = getLikedTracks();
  const updatedTracks = likedTracks.filter(t => t.id !== trackId);
  
  if (likedTracks.length === updatedTracks.length) {
    toast.error("Track not found in liked songs");
    return false;
  }
  
  localStorage.setItem(LIKED_PLAYLIST_KEY, JSON.stringify(updatedTracks));
  toast.success("Removed from Liked Songs");
  return true;
};

export const isTrackLiked = (trackId: string): boolean => {
  const likedTracks = getLikedTracks();
  return likedTracks.some(t => t.id === trackId);
};
