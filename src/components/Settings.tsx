import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Download, Trash2, HardDrive } from 'lucide-react';
import { ProcessingOptions } from '@/types/engines';

interface SettingsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  onClearCache: () => void;
  cacheSize?: number;
}

export const Settings = ({ options, onChange, onClearCache, cacheSize }: SettingsProps) => {
  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    onChange({ ...options, ...updates });
  };

  const formatBytes = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <SettingsIcon className="h-5 w-5" />
          Settings & Cache
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PWA Settings */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Progressive Web App</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Offline Mode</Label>
              <p className="text-xs text-muted-foreground">
                Cache models for offline use (requires reload)
              </p>
            </div>
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              {navigator.onLine ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Cache Management */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cache Management</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <Label className="text-sm">Model Cache</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {cacheSize ? formatBytes(cacheSize) : 'Calculating...'} stored locally
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCache}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Model Preloading */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Performance</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="preload-models" className="text-sm">
                Preload Models
              </Label>
              <p className="text-xs text-muted-foreground">
                Download models in background for faster processing
              </p>
            </div>
            <Switch
              id="preload-models"
              checked={false} // This could be stored in localStorage
              onCheckedChange={(checked) => {
                // Handle preload preference
                localStorage.setItem('preloadModels', checked.toString());
              }}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Privacy</h4>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                🔒 Private
              </Badge>
              <div className="text-xs text-muted-foreground">
                All processing happens locally in your browser. No images or data are sent to external servers.
              </div>
            </div>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">App Status</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Version: 2.0.0</p>
            <p>Service Worker: {'serviceWorker' in navigator ? 'Available' : 'Not Available'}</p>
            <p>Cross-Origin Isolation: {crossOriginIsolated ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};