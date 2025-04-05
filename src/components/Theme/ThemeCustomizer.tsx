
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CirclePicker } from "react-color";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ThemeCustomizerProps {
  className?: string;
}

export const ThemeCustomizer = ({ className }: ThemeCustomizerProps) => {
  const [dynamicTheme, setDynamicTheme] = useState(() => {
    return localStorage.getItem("music_dynamic_theme") !== "false";
  });
  
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("music_primary_color") || "#7c3aed"; // Default purple
  });
  
  const handleDynamicThemeChange = (checked: boolean) => {
    setDynamicTheme(checked);
    localStorage.setItem("music_dynamic_theme", String(checked));
    
    // Reset to custom colors if dynamic theme is turned off
    if (!checked) {
      applyThemeColor(primaryColor);
    }
    
    toast.success(`Dynamic theme ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleColorChange = (color: any) => {
    setPrimaryColor(color.hex);
    localStorage.setItem("music_primary_color", color.hex);
    
    // Only apply if dynamic theme is off
    if (!dynamicTheme) {
      applyThemeColor(color.hex);
    }
  };
  
  const applyThemeColor = (color: string) => {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Set CSS variables
    document.documentElement.style.setProperty('--primary', `${r} ${g} ${b}`);
    
    // Calculate secondary and background colors (darker variants)
    const darkerR = Math.max(0, r - 40);
    const darkerG = Math.max(0, g - 40);
    const darkerB = Math.max(0, b - 40);
    
    document.documentElement.style.setProperty('--secondary', `${darkerR} ${darkerG} ${darkerB}`);
    
    // Even darker for background
    const bgR = Math.max(0, r - 80);
    const bgG = Math.max(0, g - 80);
    const bgB = Math.max(0, b - 80);
    
    document.documentElement.style.setProperty('--background', `${bgR} ${bgG} ${bgB}`);
    
    toast.success("Theme color applied");
  };
  
  const presetColors = [
    "#7c3aed", // Purple
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#000000", // Black
    "#6b7280", // Gray
  ];
  
  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dynamic-theme">Dynamic Theme</Label>
            <p className="text-sm text-muted-foreground">
              Automatically change colors based on album artwork
            </p>
          </div>
          <Switch 
            id="dynamic-theme"
            checked={dynamicTheme}
            onCheckedChange={handleDynamicThemeChange}
          />
        </div>
        
        <div className="space-y-2 pt-2">
          <Label>Theme Color</Label>
          <p className="text-sm text-muted-foreground mb-4">
            {dynamicTheme ? "Custom colors will be applied when dynamic theme is disabled" : "Choose your preferred accent color"}
          </p>
          
          <CirclePicker 
            colors={presetColors}
            color={primaryColor}
            onChange={handleColorChange}
            width="100%"
            circleSize={24}
            circleSpacing={16}
          />
        </div>
      </CardContent>
    </Card>
  );
};
