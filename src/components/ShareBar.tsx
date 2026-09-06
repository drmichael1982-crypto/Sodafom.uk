/**
 * ShareBar
 *
 * A compact row of share/follow buttons: TikTok follow, YouTube subscribe,
 * and a copy-link / native share button.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Share2, Youtube } from 'lucide-react';

const TIKTOK_URL  = 'https://www.tiktok.com/@sodafom';
const YOUTUBE_URL = 'https://www.youtube.com/@sodafom';

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

interface ShareBarProps {
  url?: string;
  text?: string;
  label?: string;
  compact?: boolean;
}

export default function ShareBar({
  url,
  text = 'Check out Sodafom — fun learning games for kids! 🎮',
  label = 'Share with friends',
  compact = false,
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const resolvedUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://sodafom.uk');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sodafom', text, url: resolvedUrl });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(resolvedUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = resolvedUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex flex-col gap-3'}>
      {!compact && label && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">

        {/* TikTok follow — dark pill */}
        <motion.a
          href={TIKTOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          title="Follow on TikTok"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs bg-foreground text-background shadow-sm transition-opacity hover:opacity-80"
        >
          <TikTokIcon />
          {!compact && <span>TikTok</span>}
        </motion.a>

        {/* YouTube subscribe — secondary (red) pill */}
        <motion.a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          title="Subscribe on YouTube"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs bg-secondary text-secondary-foreground shadow-sm transition-opacity hover:opacity-80"
        >
          <Youtube className="w-4 h-4" />
          {!compact && <span>YouTube</span>}
        </motion.a>

        {/* Share / Copy link */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleNativeShare}
          title="Share or copy link"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors shadow-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 text-primary"
              >
                <Check size={14} />
                {!compact && 'Copied!'}
              </motion.span>
            ) : (
              <motion.span
                key="share"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Share2 size={14} />
                {!compact && 'Share'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>
    </div>
  );
}
