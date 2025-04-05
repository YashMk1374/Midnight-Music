import { toast } from "sonner";
import { Track } from "./trackService";

const JIOSAAVN_API_BASE_URL = "https://saavnapi-nine.vercel.app";

export interface JioSaavnSongResponse {
  id: string;
  name: string;
  album: {
    name: string;
    url?: string;
    id?: string;
  };
  year: string;
  duration: string;
  image: string;
  url: string;
  downloadUrl?: string[];
  artists: { name: string }[];
  language?: string;
  lyrics?: string;
}

export const searchJioSaavn = async (query: string, fetchLyrics = false): Promise<Track[]> => {
  try {
    const lyricsParam = fetchLyrics ? '&lyrics=true' : '';
    const response = await fetch(`${JIOSAAVN_API_BASE_URL}/result/?query=${encodeURIComponent(query)}${lyricsParam}`);
    if (!response.ok) {
      throw new Error('Failed to search tracks on JioSaavn');
    }
    
    const data = await response.json();
    
    return convertJioSaavnToTracks(data);
  } catch (error) {
    console.error('Error searching JioSaavn:', error);
    toast.error("Failed to search tracks on JioSaavn");
    return [];
  }
};

export const getJioSaavnSongDetails = async (songId: string, fetchLyrics = false): Promise<Track | null> => {
  try {
    const lyricsParam = fetchLyrics ? '&lyrics=true' : '';
    const response = await fetch(`${JIOSAAVN_API_BASE_URL}/song/?query=${songId}${lyricsParam}`);
    if (!response.ok) {
      throw new Error('Failed to get song details from JioSaavn');
    }
    
    const data = await response.json();
    const tracks = convertJioSaavnToTracks([data]);
    
    return tracks.length > 0 ? tracks[0] : null;
  } catch (error) {
    console.error('Error getting song details from JioSaavn:', error);
    return null;
  }
};

export const getJioSaavnAlbum = async (albumId: string): Promise<Track[]> => {
  try {
    const response = await fetch(`${JIOSAAVN_API_BASE_URL}/album/?query=${albumId}`);
    if (!response.ok) {
      throw new Error('Failed to get album from JioSaavn');
    }
    
    const data = await response.json();
    return convertJioSaavnToTracks(data.songs || []);
  } catch (error) {
    console.error('Error getting album from JioSaavn:', error);
    return [];
  }
};

export const getJioSaavnPlaylist = async (playlistId: string): Promise<Track[]> => {
  try {
    const response = await fetch(`${JIOSAAVN_API_BASE_URL}/playlist/?query=${playlistId}`);
    if (!response.ok) {
      throw new Error('Failed to get playlist from JioSaavn');
    }
    
    const data = await response.json();
    return convertJioSaavnToTracks(data.songs || []);
  } catch (error) {
    console.error('Error getting playlist from JioSaavn:', error);
    return [];
  }
};

export const getLyricsJioSaavn = async (songId: string): Promise<string> => {
  try {
    // Use the updated endpoint with lyrics=true parameter
    const response = await fetch(`${JIOSAAVN_API_BASE_URL}/result/?query=${songId}&lyrics=true`);
    if (!response.ok) {
      throw new Error('Failed to get lyrics from JioSaavn');
    }
    
    const data = await response.json();
    // Check if the response is an array and has at least one item
    if (Array.isArray(data) && data.length > 0 && data[0].lyrics) {
      return data[0].lyrics || "Lyrics not available";
    } else if (data.lyrics) {
      return data.lyrics;
    }
    
    return "Lyrics not available";
  } catch (error) {
    console.error('Error getting lyrics from JioSaavn:', error);
    return "Lyrics not available";
  }
};

export const getJioSaavnRecommendations = async (songId?: string): Promise<Track[]> => {
  try {
    // If no songId is provided, get trending songs
    const endpoint = songId 
      ? `${JIOSAAVN_API_BASE_URL}/song/?query=${songId}&lyrics=true` 
      : `${JIOSAAVN_API_BASE_URL}/result/?query=trending`;
    
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Failed to get recommendations from JioSaavn');
    }
    
    const data = await response.json();
    
    // If we're getting recommendations based on a song, get songs from the same album
    if (songId && data.album && data.album.id) {
      // Get tracks from the same album for better genre matching
      const albumResponse = await fetch(`${JIOSAAVN_API_BASE_URL}/album/?query=${data.album.id}`);
      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        if (albumData.songs && Array.isArray(albumData.songs)) {
          // If we got songs from the album, use them as recommendations
          const albumTracks = convertJioSaavnToTracks(albumData.songs);
          
          // If there are more than 5 songs from the album, that's good enough
          if (albumTracks.length > 5) {
            return albumTracks;
          }
          
          // Otherwise, try to get more related tracks
          if (data.language) {
            // If we know the language/genre, search for more tracks with it
            const languageResponse = await fetch(
              `${JIOSAAVN_API_BASE_URL}/result/?query=${encodeURIComponent(data.language)}`
            );
            if (languageResponse.ok) {
              const languageData = await languageResponse.json();
              const languageTracks = convertJioSaavnToTracks(Array.isArray(languageData) ? languageData : [languageData]);
              
              // Combine unique tracks from album and language search
              const seenIds = new Set(albumTracks.map(t => t.id));
              const uniqueLanguageTracks = languageTracks.filter(t => !seenIds.has(t.id));
              
              return [...albumTracks, ...uniqueLanguageTracks];
            }
          }
          
          return albumTracks;
        }
      }
    }
    
    // Default to returning search results if album recommendations fail or for trending
    return convertJioSaavnToTracks(Array.isArray(data) ? data : [data]);
  } catch (error) {
    console.error('Error getting recommendations from JioSaavn:', error);
    return [];
  }
};

// Helper function to convert JioSaavn format to our Track format
export const convertJioSaavnToTracks = (songs: any[]): Track[] => {
  if (!Array.isArray(songs)) {
    console.error("Expected array of songs but got:", typeof songs);
    return [];
  }
  
  return songs.map(song => {
    // Extract the correct image URL
    let imageUrl = song.image_url || song.image || '';
    
    // Ensure image_url is a full URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://c.saavncdn.com/${imageUrl}`;
    }
    
    // If image is still empty, use a placeholder
    if (!imageUrl) {
      imageUrl = "https://c.saavncdn.com/default-album-500x500.jpg";
    }
    
    // Ensure we have an array of artist objects
    const artists = [];
    if (song.singers || song.artist || song.artists || song.primary_artists) {
      // Try various artist fields in priority order
      const artistNames = song.primary_artists || song.singers || song.artist || song.artists;
      if (typeof artistNames === 'string') {
        artists.push(...artistNames.split(', ').map(name => ({ name })));
      } else if (Array.isArray(artistNames)) {
        artists.push(...artistNames.map(artist => 
          typeof artist === 'string' ? { name: artist } : artist
        ));
      }
    }
    
    // Get the correct audio URL
    let audioUrl = song.url || song.downloadUrl?.[0] || song.media_url || '';
    
    // Create a track ID if none exists
    const trackId = song.id || song.songid || `jiosaavn-${Date.now()}-${Math.random()}`;
    
    // Get duration in milliseconds
    const duration = song.duration ? parseInt(song.duration) * 1000 : 0;
    
    // Get song name with fallbacks
    const trackName = song.name || song.song || song.title || 'Unknown Track';
    
    return {
      id: trackId,
      name: trackName,
      album: {
        name: song.album?.name || song.album_name || song.album || 'Unknown Album',
        images: [{ url: imageUrl }]
      },
      artists: artists.length > 0 ? artists : [{ name: 'Unknown Artist' }],
      duration_ms: duration,
      preview_url: audioUrl
    };
  });
};
