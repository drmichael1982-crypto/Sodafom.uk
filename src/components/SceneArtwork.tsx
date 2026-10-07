import type { CSSProperties } from 'react';
import './scene-artwork.css';

export type LearningScene = 'adventure' | 'maths' | 'reading' | 'history' | 'science' | 'rewards';
export function sceneForSubject(subject: string, title = ''): LearningScene {
  if (/history|egypt|roman|tudor|castle|past/i.test(subject + ' ' + title)) return 'history';
  if (/science|planet|space|atom|solar/i.test(subject + ' ' + title)) return 'science';
  if (/reading|spelling|english|story|book|word|punctuation/i.test(subject + ' ' + title)) return 'reading';
  if (/reward|sticker|progress/i.test(subject + ' ' + title)) return 'rewards';
  if (/maths|fraction|number|money|clock|pattern/i.test(subject + ' ' + title)) return 'maths';
  return 'adventure';
}
export default function SceneArtwork({ scene = 'adventure', title = '', compact = false }: { scene?: LearningScene; title?: string; compact?: boolean }) {
  const seed = Array.from(title).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 17);
  return <div aria-hidden="true" className={`scene-art scene-${scene} ${compact ? 'scene-compact' : ''}`} style={{ '--scene-turn': `${seed % 17 - 8}deg`, '--scene-accent': `${190 + seed % 35}`, '--scene-position': `${45 + seed % 15}%` } as CSSProperties}>
    <img className="scene-environment" src={`/assets/scenes/${scene}-v1.png`} alt="" loading="lazy" decoding="async"/>
    <span className="scene-glow"/>
    <span className="scene-orb scene-orb-one"/><span className="scene-orb scene-orb-two"/>
    <span className="scene-spark scene-spark-one">✦</span><span className="scene-spark scene-spark-two">✧</span>
  </div>;
}
