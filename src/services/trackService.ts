
import { toast } from "sonner";

export interface Track {
  id: string;
  name: string;
  album: {
    name: string;
    images: { url: string }[];
  };
  artists: { name: string }[];
  duration_ms: number;
  preview_url: string | null;
}

export const fetchTracks = async (): Promise<Track[]> => {
  try {
    const response = await fetch(
      'https://spotify23.p.rapidapi.com/tracks/?ids=4WNcduiCmDNfmTEz7JvmLv,2tpWsVSb9UEmDRxAl1zhX1,0VjIjW4GlUZAMYd2vXMi3b,7qiZfU4dY1lWllzX7mPBI3,5ghIJDpPoe3CfHMGu71E6T',
      {
        headers: {
          'x-rapidapi-key': '718be00c03mshc28e0d7f97701c9p1ebc60jsn5c040e4feefa',
          'x-rapidapi-host': 'spotify23.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tracks');
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error fetching tracks:', error);
    toast.error("Failed to load tracks. Using demo tracks instead.");
    
    // Return demo tracks as fallback
    return [
      {
        id: "1",
        name: "Blinding Lights",
        album: {
          name: "After Hours",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b273ef12efa4d3123fed7e13f5e8" }]
        },
        artists: [{ name: "The Weeknd" }],
        duration_ms: 201880,
        preview_url: "https://p.scdn.co/mp3-preview/505a85f15aef80a97826463bba6d4df2b8764bc5?cid=0beee08e00b947e0aaa2d5cc7f8ffd30"
      },
      {
        id: "2",
        name: "Save Your Tears",
        album: {
          name: "After Hours",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b273ef12efa4d3123fed7e13f5e8" }]
        },
        artists: [{ name: "The Weeknd" }],
        duration_ms: 215627,
        preview_url: null
      },
      {
        id: "3",
        name: "As It Was",
        album: {
          name: "Harry's House",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f7" }]
        },
        artists: [{ name: "Harry Styles" }],
        duration_ms: 167300,
        preview_url: null
      },
      {
        id: "4",
        name: "Levitating",
        album: {
          name: "Future Nostalgia",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734a048af9c449957970ed433a" }]
        },
        artists: [{ name: "Dua Lipa" }],
        duration_ms: 203064,
        preview_url: null
      },
      {
        id: "5",
        name: "Bad Guy",
        album: {
          name: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
          images: [{ url: "https://i.scdn.co/image/ab67616d0000b2732a7db835b912dc5014bd37f4" }]
        },
        artists: [{ name: "Billie Eilish" }],
        duration_ms: 194088,
        preview_url: null
      }
    ];
  }
};
