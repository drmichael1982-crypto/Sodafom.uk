/**
 * share.ts — Social sharing URL helpers
 *
 * Usage:
 *   import { buildShareUrls } from '@/lib/share';
 *   const urls = buildShareUrls({ url: 'https://sodafom.uk', text: 'Check this out!' });
 */

export interface ShareOptions {
  url: string;
  text: string;
  hashtags?: string[];   // Twitter/X only
}

export interface ShareUrls {
  facebook: string;
  twitter: string;
  whatsapp: string;
  copyUrl: string;
}

export function buildShareUrls({ url, text, hashtags = [] }: ShareOptions): ShareUrls {
  const encoded = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const tags = hashtags.join(',');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}${tags ? `&hashtags=${tags}` : ''}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    copyUrl: url,
  };
}

/** Opens a share popup centred on screen */
export function openSharePopup(url: string, title: string) {
  const w = 600, h = 500;
  const left = Math.round(window.screen.width / 2 - w / 2);
  const top = Math.round(window.screen.height / 2 - h / 2);
  window.open(url, title, `width=${w},height=${h},left=${left},top=${top},toolbar=0,status=0`);
}

/** Returns true if the Web Share API is available (mobile browsers) */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/** Triggers the native share sheet if available, otherwise falls back to copy */
export async function nativeShare(options: ShareOptions): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ title: options.text, text: options.text, url: options.url });
    return true;
  } catch {
    return false;
  }
}
