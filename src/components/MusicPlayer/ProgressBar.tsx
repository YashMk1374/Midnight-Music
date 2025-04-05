
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar = ({ className }: ProgressBarProps) => {
  const { progress, duration, seek } = useMusicPlayer();
  const [localProgress, setLocalProgress] = useState(0);
  
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleChange = (value: number[]) => {
    setLocalProgress(value[0]);
    seek(value[0]);
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      <Slider 
        value={[localProgress]} 
        max={duration || 100} 
        step={0.01}
        onValueChange={handleChange}
        className="cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration || 0)}</span>
      </div>
    </div>
  );
};
