
import { toast } from "sonner";

export interface LyricsLine {
  words: string;
  startTimeMs: number;
}

export interface Lyrics {
  lines: LyricsLine[];
  syncType: string;
  isAvailable: boolean;
}

export const fetchLyrics = async (trackId: string): Promise<Lyrics | null> => {
  try {
    const response = await fetch(
      `https://spotify23.p.rapidapi.com/track_lyrics/?id=${trackId}`,
      {
        headers: {
          'x-rapidapi-key': '718be00c03mshc28e0d7f97701c9p1ebc60jsn5c040e4feefa',
          'x-rapidapi-host': 'spotify23.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }

    const data = await response.json();
    
    if (!data.lyrics || !data.lyrics.lines || !data.lyrics.lines.length) {
      return {
        lines: [],
        syncType: "UNSYNCED",
        isAvailable: false
      };
    }
    
    // Transform the lyrics data to ensure all lines have the required structure
    const processedLines = data.lyrics.lines.map((line: any) => ({
      words: line.words || "",
      startTimeMs: line.startTimeMs || 0
    }));
    
    return {
      lines: processedLines,
      syncType: data.lyrics.syncType || "UNSYNCED",
      isAvailable: processedLines.length > 0
    };
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    toast.error("Could not load lyrics for this track");
    return null;
  }
};
