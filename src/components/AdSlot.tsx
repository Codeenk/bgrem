import { useEffect } from 'react';

interface AdSlotProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

const AdSlot = ({ slot, format = "auto", responsive = true, className = "" }: AdSlotProps) => {
  useEffect(() => {
    try {
      // @ts-ignore - AdSense global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`ad-container min-h-[90px] flex items-center justify-center bg-muted/20 rounded-lg ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-TODO_REPLACE_WITH_YOUR_CLIENT_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
      {/* Fallback content for development/testing */}
      <div className="text-xs text-muted-foreground text-center p-4">
        <div className="border border-dashed border-muted-foreground/30 p-2 rounded">
          Ad Space<br />
          <span className="text-[10px]">Replace CLIENT_ID in AdSlot component</span>
        </div>
      </div>
    </div>
  );
};

export default AdSlot;