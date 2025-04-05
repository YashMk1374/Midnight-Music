
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MusicPlayerNowPlaying } from "@/components/MusicPlayer/MusicPlayerNowPlaying";
import { MiniPlayer } from "@/components/MusicPlayer/MiniPlayer";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Menu, X, Home, Search, ListMusic, Heart, Download, Music, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack } = useMusicPlayer();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Search", path: "/search", icon: <Search className="w-4 h-4 mr-2" /> },
    { name: "Playlists", path: "/playlists", icon: <ListMusic className="w-4 h-4 mr-2" /> },
    { name: "Liked Songs", path: "/liked", icon: <Heart className="w-4 h-4 mr-2" /> },
    { name: "Downloads", path: "/downloads", icon: <Download className="w-4 h-4 mr-2" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="w-4 h-4 mr-2" /> }
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };
  
  const renderNavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button
            variant={isActive(item.path) ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setOpen(false)}
          >
            {item.icon}
            {item.name}
          </Button>
        </Link>
      ))}
    </>
  );
  
  const openSettings = () => {
    navigate('/settings');
    setDrawerOpen(false);
    setOpen(false);
  };
  
  if (isMobile) {
    return (
      <>
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container flex items-center justify-between h-14 px-4">
            <Link to="/" className="flex items-center gap-2">
              <Music className="text-primary" />
              <span className="font-bold">Music Player</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={openSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Music className="text-primary" />
                        <span className="font-bold">Music Player</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      {renderNavLinks()}
                    </div>
                    
                    {currentTrack && (
                      <div className="mt-4 pt-4 border-t">
                        <MiniPlayer />
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Remove the floating MiniPlayer as it's now in the sidebar */}
      </>
    );
  }
  
  return (
    <div className="flex h-screen fixed">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-background/80 backdrop-blur-md p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Music className="text-primary" />
          <span className="font-bold">Music Player</span>
        </div>
        
        <div className="space-y-1">
          {renderNavLinks()}
        </div>
        
        {currentTrack && (
          <div className="mt-auto pt-4">
            <MusicPlayerNowPlaying />
          </div>
        )}
      </div>
      
      {/* Main content offset */}
      <div className="w-64" />
    </div>
  );
};
