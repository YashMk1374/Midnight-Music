
import React from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { MusicIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LyricsViewProps {
  className?: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ className }) => {
  const { currentLyrics, currentTrack, progress } = useMusicPlayer();
  
  // Find the current line based on timestamp
  const currentTimeMs = progress * 1000;
  const currentLineIndex = currentLyrics?.lines.findIndex(
    (line, i, arr) => {
      const nextLine = arr[i + 1];
      return (
        line.startTimeMs <= currentTimeMs &&
        (!nextLine || nextLine.startTimeMs > currentTimeMs)
      );
    }
  );
  
  if (!currentLyrics?.isAvailable || !currentLyrics.lines.length) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-center p-4", className)}>
        <MusicIcon className="h-16 w-16 mb-4 text-muted-foreground animate-pulse" />
        <p className="text-lg font-medium">Lyrics not available</p>
        <p className="text-sm text-muted-foreground mt-2">
          We couldn't find lyrics for {currentTrack?.name || "this track"}
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className={cn("h-full py-4 px-2", className)}>
      <div className="space-y-6">
        {currentLyrics.lines.map((line, index) => (
          <div 
            key={index} 
            className={cn(
              "transition-all duration-300 text-center px-4 py-1",
              index === currentLineIndex 
                ? "text-lg font-medium text-primary animate-pulse" 
                : "text-base text-muted-foreground"
            )}
          >
            {line.words}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
