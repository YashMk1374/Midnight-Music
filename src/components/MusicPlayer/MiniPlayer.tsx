
import { AlbumCover } from "./AlbumCover";
import { TrackInfo } from "./TrackInfo";
import { Controls } from "./Controls";
import { cn } from "@/lib/utils";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface MiniPlayerProps {
  className?: string;
}

export const MiniPlayer = ({ className }: MiniPlayerProps) => {
  const { currentTrack } = useMusicPlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!currentTrack) return null;

  const handlePlayerClick = () => {
    // Navigate to the player page
    navigate('/player');
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-16 left-0 right-0 glass-card rounded-lg p-3 flex items-center gap-3 mx-2 z-50 shadow-lg",
        className
      )}
      onClick={handlePlayerClick}
    >
      <div className="cursor-pointer">
        <AlbumCover size="sm" />
      </div>
      <TrackInfo size="sm" className="flex-1 min-w-0" />
      <Controls 
        size="sm" 
        className="flex-shrink-0" 
        onClick={(e) => e.stopPropagation()} 
      />
    </motion.div>
  );
};
