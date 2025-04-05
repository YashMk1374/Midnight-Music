
import { toast } from "sonner";
import { Track } from "./trackService";
import { getJioSaavnRecommendations, getJioSaavnSongDetails } from "./jioSaavnService";

// Cache to store recommendations by seed track ID
const recommendationsCache: Record<string, Track[]> = {};

// Cache to store track genre information
const trackGenreCache: Record<string, string> = {};

// Cache to store artist recommendations
const artistRecommendationsCache: Record<string, Track[]> = {};

/**
 * Fetch recommendations based on seed tracks, artists, or genres
 */
export const fetchRecommendations = async (
  seedTracks?: string[],
  seedArtists?: string[],
  seedGenres?: string[]
): Promise<Track[]> => {
  try {
    // Use the first seed track if available, otherwise get trending songs
    const seedTrack = seedTracks && seedTracks.length > 0 ? seedTracks[0] : undefined;
    
    // Check if we already have recommendations for this seed track
    if (seedTrack && recommendationsCache[seedTrack]) {
      return recommendationsCache[seedTrack];
    }
    
    // Get recommendations from JioSaavn API
    const recommendations = await getJioSaavnRecommendations(seedTrack);
    
    // If we have seed tracks, try to get their genre information
    if (seedTrack && !trackGenreCache[seedTrack]) {
      try {
        const trackDetails = await getJioSaavnSongDetails(seedTrack, true);
        if (trackDetails) {
          trackGenreCache[seedTrack] = trackDetails.album.name.toLowerCase();
        }
      } catch (error) {
        console.error("Error fetching genre info:", error);
      }
    }
    
    // Sort recommendations to prioritize similar genres if we have genre info
    if (seedTrack && trackGenreCache[seedTrack]) {
      const seedGenre = trackGenreCache[seedTrack];
      
      // Sort recommendations by genre similarity
      recommendations.sort((a, b) => {
        const aGenre = a.album.name.toLowerCase();
        const bGenre = b.album.name.toLowerCase();
        
        // Check if album names contain similar words
        const aScore = genreSimilarityScore(seedGenre, aGenre);
        const bScore = genreSimilarityScore(seedGenre, bGenre);
        
        return bScore - aScore;
      });
    }
    
    // If we don't have enough recommendations, try to get recommendations
    // based on genre or trending if available
    if (recommendations.length < 5 && seedGenres && seedGenres.length > 0) {
      // This would use genre-based recommendations if we had that API
      // For now, we'll just get more general recommendations
      const additionalRecs = await getJioSaavnRecommendations();
      
      // Filter out duplicates
      const existingIds = new Set(recommendations.map(track => track.id));
      const uniqueAdditionalRecs = additionalRecs.filter(track => !existingIds.has(track.id));
      
      // Combine recommendations
      recommendations.push(...uniqueAdditionalRecs);
    }
    
    // Cache recommendations for this seed track
    if (seedTrack) {
      recommendationsCache[seedTrack] = recommendations;
    }
    
    // Shuffle the recommendations a bit to get variety while maintaining genre priority
    const topRecommendations = recommendations.slice(0, Math.min(5, recommendations.length));
    const otherRecommendations = shuffleArray(recommendations.slice(Math.min(5, recommendations.length)));
    
    return [...topRecommendations, ...otherRecommendations].slice(0, 10);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    toast.error("Failed to load recommendations");
    return [];
  }
};

/**
 * Calculate similarity score between two genre strings
 * Higher score means more similarity
 */
function genreSimilarityScore(genre1: string, genre2: string): number {
  // Split into words and normalize
  const words1 = genre1.toLowerCase().split(/\s+/);
  const words2 = genre2.toLowerCase().split(/\s+/);
  
  // Count matching words
  let matchCount = 0;
  for (const word1 of words1) {
    if (word1.length > 2) { // Only consider words longer than 2 chars
      for (const word2 of words2) {
        if (word2.length > 2 && (word1.includes(word2) || word2.includes(word1))) {
          matchCount++;
          break;
        }
      }
    }
  }
  
  // Artist name similarity can also be a factor
  return matchCount;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Clear the recommendations cache
 */
export const clearRecommendationsCache = (): void => {
  Object.keys(recommendationsCache).forEach(key => {
    delete recommendationsCache[key];
  });
};

/**
 * Get diverse recommendations by combining multiple seed tracks
 */
export const getDiverseRecommendations = async (
  seedTracks: string[] = [],
  count: number = 10
): Promise<Track[]> => {
  try {
    const allRecommendations: Track[] = [];
    const trackedIds = new Set<string>();
    
    // If we have seed tracks, get recommendations for each
    if (seedTracks.length > 0) {
      for (const trackId of seedTracks) {
        const recs = await fetchRecommendations([trackId]);
        
        // Add only unique tracks
        for (const track of recs) {
          if (!trackedIds.has(track.id)) {
            allRecommendations.push(track);
            trackedIds.add(track.id);
          }
        }
      }
    } else {
      // If no seed tracks, just get general recommendations
      const recs = await fetchRecommendations();
      allRecommendations.push(...recs);
    }
    
    // Return the recommendations with minimal shuffling to preserve genre relevance
    return allRecommendations.slice(0, count);
  } catch (error) {
    console.error('Error getting diverse recommendations:', error);
    return [];
  }
};

/**
 * Get artist-specific recommendations
 */
export const getArtistRecommendations = async (artistId: string, count: number = 5): Promise<Track[]> => {
  try {
    // Check cache first
    if (artistRecommendationsCache[artistId]) {
      return artistRecommendationsCache[artistId];
    }
    
    // Get general recommendations and filter by artist
    const recommendations = await getJioSaavnRecommendations();
    const artistRecs = recommendations.filter(track => 
      track.artists.some(artist => artist.id === artistId)
    );
    
    // Cache the results
    artistRecommendationsCache[artistId] = artistRecs;
    
    return artistRecs.slice(0, count);
  } catch (error) {
    console.error('Error fetching artist recommendations:', error);
    return [];
  }
};
