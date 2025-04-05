
import { toast } from "sonner";
import { Track } from "./trackService";
import { searchJioSaavn } from "./jioSaavnService";

export const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // Search using JioSaavn API
    return await searchJioSaavn(query);
  } catch (error) {
    console.error('Error searching tracks:', error);
    toast.error("Failed to search tracks");
    return [];
  }
};
