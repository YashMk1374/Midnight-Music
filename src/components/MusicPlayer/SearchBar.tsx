
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
  isSearching?: boolean;
}

export const SearchBar = ({ 
  onSearch, 
  className, 
  isSearching = false 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative flex w-full max-w-lg items-center space-x-2 transition-all animate-fade-in",
        className
      )}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search for songs, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm text-foreground border-primary/20 focus-visible:ring-primary"
          disabled={isSearching}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <Button 
        type="submit" 
        variant="default" 
        size="icon"
        disabled={isSearching}
        className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
};
