
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Track } from "@/services/trackService";
import { TrackList } from "@/components/MusicPlayer/TrackList";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { checkStoragePermission } from "@/utils/storagePermission";

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState<Track[]>([]);
  const [hasStoragePermission, setHasStoragePermission] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Check for storage permission and load downloads
  useEffect(() => {
    const checkPermissionAndLoadDownloads = async () => {
      const hasPermission = await checkStoragePermission();
      setHasStoragePermission(hasPermission);
      
      // Load downloads from localStorage
      const storedDownloads = localStorage.getItem('music_player_downloads');
      if (storedDownloads) {
        try {
          setDownloads(JSON.parse(storedDownloads));
        } catch (error) {
          console.error('Error parsing downloads:', error);
        }
      }
    };
    
    checkPermissionAndLoadDownloads();
  }, []);
  
  const handleRemoveDownload = (trackId: string) => {
    const updatedDownloads = downloads.filter(track => track.id !== trackId);
    setDownloads(updatedDownloads);
    localStorage.setItem('music_player_downloads', JSON.stringify(updatedDownloads));
    toast.success("Download removed");
  };
  
  const handleClearAll = () => {
    setDownloads([]);
    localStorage.removeItem('music_player_downloads');
    toast.success("All downloads cleared");
  };
  
  const handleRequestPermission = async () => {
    const hasPermission = await checkStoragePermission();
    setHasStoragePermission(hasPermission);
    
    if (hasPermission) {
      toast.success("Storage permission granted");
    } else {
      toast.error("Storage permission is required to download tracks");
    }
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Downloads</h1>
          
          {downloads.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        {!hasStoragePermission && (
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg">
            <p className="mb-2">Storage permission is required to download tracks.</p>
            <Button onClick={handleRequestPermission}>
              Grant Permission
            </Button>
          </div>
        )}
        
        {downloads.length > 0 ? (
          <TrackList 
            tracks={downloads} 
            onRemove={handleRemoveDownload}
            showRemoveButton
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            <Download className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No downloads yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              Download your favorite tracks to listen offline
            </p>
            <Button onClick={() => navigate("/search")}>
              Find music to download
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default DownloadsPage;
