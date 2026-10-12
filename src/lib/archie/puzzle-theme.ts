import type { CSSProperties } from 'react';
import { sceneForSubject, sceneArtworkPath } from '@/components/SceneArtwork';

/** Stable page-specific artwork, position and colour, without changing activities. */
export function puzzleThemeStyle(title: string, subject = ''): CSSProperties {
  const key = `${subject} ${title}`.toLowerCase();
  const seed = Array.from(key).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const scene = sceneForSubject(subject, title);
  const world = /geography|homework|spelling/.test(key)
    ? /geography/.test(key) ? 'geography' : /homework/.test(key) ? 'crossword' : 'spelling'
    : null;
  return {
    '--puzzle-picture': `url("${world ? `/assets/cartoon/worlds/${world}.png` : sceneArtworkPath(scene)}")`,
    '--puzzle-position': `${25 + seed % 55}% ${20 + seed % 60}%`,
    '--puzzle-colour': `hsl(${190 + seed % 75} 70% 92%)`,
  } as CSSProperties;
}
