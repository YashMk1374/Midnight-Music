
/**
 * Utility functions for handling storage permissions and downloads
 */

import { toast } from "sonner";

/**
 * Check if the app has storage permission on Android
 * For web, this will use the File System Access API if available
 */
export const checkStoragePermission = async (): Promise<boolean> => {
  // Check if we're in a mobile environment (Capacitor)
  if (typeof (window as any).Capacitor !== 'undefined') {
    try {
      const { Permissions } = (window as any).Capacitor.Plugins;
      
      // Request storage permission
      const permissionStatus = await Permissions.query({ name: 'storage' });
      
      if (permissionStatus.state === 'granted') {
        return true;
      } else if (permissionStatus.state === 'denied') {
        toast.error("Storage permission denied. Cannot download tracks.");
        return false;
      } else {
        // Request permission
        const requestResult = await Permissions.request({ name: 'storage' });
        return requestResult.state === 'granted';
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      // Fall back to browser download if Capacitor permissions fail
      return true;
    }
  }
  
  // For web browsers, we'll always return true and let the browser handle permissions
  return true;
};

/**
 * Download a file and save it to the appropriate location
 * @param url URL of the file to download
 * @param filename Filename to save as
 */
export const downloadFile = async (url: string, filename: string): Promise<boolean> => {
  // Check permission first
  const hasPermission = await checkStoragePermission();
  
  if (!hasPermission) {
    return false;
  }
  
  try {
    // Check if we're in a mobile environment (Capacitor)
    if (typeof (window as any).Capacitor !== 'undefined') {
      try {
        const { Filesystem } = (window as any).Capacitor.Plugins;
        
        // Create directory if it doesn't exist
        try {
          await Filesystem.mkdir({
            path: 'midnight',
            directory: 'DOWNLOADS',
            recursive: true,
          });
        } catch (e) {
          // Directory might already exist, continue
        }
        
        // Fetch the file
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve((reader.result as string).split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
        
        // Save file to downloads/midnight
        await Filesystem.writeFile({
          path: `midnight/${filename}`,
          data: base64Data,
          directory: 'DOWNLOADS',
        });
        
        toast.success(`Saved to Downloads/midnight/${filename}`);
        return true;
      } catch (error) {
        console.error('Error saving file with Capacitor:', error);
        // Fall back to browser download
      }
    }
    
    // Web browser download fallback
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Download started");
    return true;
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
    return false;
  }
};
