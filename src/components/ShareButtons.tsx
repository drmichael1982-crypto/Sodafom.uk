/**
 * ShareButtons — reusable social sharing component
 * Shows TikTok + YouTube follow links and a native share button.
 */
import { useState } from 'react';
import { Youtube, Share2, Check } from 'lucide-react';

const TIKTOK_URL  = 'https://www.tiktok.com/@sodafom';
const YOUTUBE_URL = 'https://www.youtube.com/@sodafom';
const SITE_URL    = 'https://sodafom.uk';
const SHARE_TEXT  = '🎮 My kids love learning with Sodafom — fun educational games for ages 5–13!';

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

interface ShareButtonsProps {
  /** Show "Follow us" heading above the buttons */
  showHeading?: boolean;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** Custom share text (overrides default) */
  shareText?: string;
}

export default function ShareButtons({
  showHeading = true,
  className = '',
  shareText,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = shareText ?? SHARE_TEXT;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sodafom', text, url: SITE_URL });
      } catch {
        // user cancelled — no-op
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showHeading && (
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          Follow us
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* TikTok */}
        <a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Sodafom on TikTok"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-80 transition-opacity"
        >
          <TikTokIcon size={16} />
          TikTok
        </a>

        {/* YouTube */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Subscribe to Sodafom on YouTube"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-bold hover:opacity-80 transition-opacity"
        >
          <Youtube size={16} />
          YouTube
        </a>

        {/* Share / Copy */}
        <button
          onClick={handleShare}
          aria-label="Share Sodafom"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}
