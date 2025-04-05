
import { useState, useEffect } from 'react';
import * as ColorThief from 'colorthief';

export function useDynamicTheme(imageUrl: string | undefined) {
  const [colors, setColors] = useState<{
    primary: string;
    secondary: string;
    background: string;
  }>({
    primary: 'hsl(252, 100%, 67%)',
    secondary: 'hsl(240, 5%, 10%)',
    background: 'hsl(240, 10%, 4%)'
  });

  useEffect(() => {
    // Check if dynamic theming is disabled
    const isDynamicThemeEnabled = localStorage.getItem("music_dynamic_theme") !== "false";
    if (!isDynamicThemeEnabled || !imageUrl) {
      // If disabled or no image, use the custom color from settings if available
      const customColor = localStorage.getItem("music_primary_color");
      if (customColor) {
        // Convert hex to RGB
        const r = parseInt(customColor.slice(1, 3), 16);
        const g = parseInt(customColor.slice(3, 5), 16);
        const b = parseInt(customColor.slice(5, 7), 16);
        
        // Set CSS variables
        document.documentElement.style.setProperty('--primary', `${r} ${g} ${b}`);
        
        // Calculate secondary and background
        const darkerR = Math.max(0, r - 40);
        const darkerG = Math.max(0, g - 40);
        const darkerB = Math.max(0, b - 40);
        
        document.documentElement.style.setProperty('--secondary', `${darkerR} ${darkerG} ${darkerB}`);
        
        const bgR = Math.max(0, r - 80);
        const bgG = Math.max(0, g - 80);
        const bgB = Math.max(0, b - 80);
        
        document.documentElement.style.setProperty('--background', `${bgR} ${bgG} ${bgB}`);
      }
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img, 3);
        
        if (palette && palette.length >= 3) {
          const primary = `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`;
          const secondary = `rgb(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]})`;
          const background = `rgb(${palette[2][0]}, ${palette[2][1]}, ${palette[2][2]})`;
          
          setColors({
            primary,
            secondary,
            background
          });
          
          // Apply to CSS variables - use direct RGB values instead of creating HSL
          document.documentElement.style.setProperty('--primary', palette[0].join(' '));
          document.documentElement.style.setProperty('--secondary', palette[1].join(' '));
          document.documentElement.style.setProperty('--background', palette[2].join(' '));
          
          // Also update accent which is used in some components
          document.documentElement.style.setProperty('--accent', palette[0].join(' '));
        }
      } catch (error) {
        console.error('Error extracting colors:', error);
      }
    };
  }, [imageUrl]);

  return colors;
}
