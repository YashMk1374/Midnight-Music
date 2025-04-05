
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ListMusic, Heart, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Search", path: "/search", icon: <Search className="w-5 h-5" /> },
    { name: "Playlists", path: "/playlists", icon: <ListMusic className="w-5 h-5" /> },
    { name: "Liked", path: "/liked", icon: <Heart className="w-5 h-5" /> },
    { name: "Downloads", path: "/downloads", icon: <Download className="w-5 h-5" /> }
  ];
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-30">
      <div className="flex justify-between items-center px-2">
        {navItems.map(item => (
          <Link 
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-3 transition-all",
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
