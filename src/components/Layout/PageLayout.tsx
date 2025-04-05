
import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { BottomNavigation } from "./BottomNavigation";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MiniPlayer } from "../MusicPlayer/MiniPlayer";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { currentTrack } = useMusicPlayer();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-black flex flex-col">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 flex-1">
        <main className={`${isMobile && currentTrack ? 'pb-32' : isMobile ? 'pb-24' : ''}`}>
          {children}
        </main>
      </div>
      
      {isMobile && <BottomNavigation />}
      {isMobile && currentTrack && <MiniPlayer />}
    </div>
  );
};
