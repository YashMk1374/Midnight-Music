
import { useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { ThemeCustomizer } from "@/components/Theme/ThemeCustomizer";

const SettingsPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        
        <ThemeCustomizer />
        
        <Card>
          <CardHeader>
            <CardTitle>Playback</CardTitle>
            <CardDescription>
              Control how music plays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-recommendations">Auto Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically add recommended tracks to the queue
                </p>
              </div>
              <Switch id="auto-recommendations" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="crossfade">Crossfade Between Songs</Label>
                <p className="text-sm text-muted-foreground">
                  Smooth transition between tracks
                </p>
              </div>
              <Switch id="crossfade" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Downloads</CardTitle>
            <CardDescription>
              Manage your downloaded content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Storage used: 0 MB
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
