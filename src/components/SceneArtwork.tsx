import type { CSSProperties } from 'react';
import './scene-artwork.css';

export type LearningScene = 'adventure' | 'maths' | 'reading' | 'history' | 'science' | 'rewards';
export function sceneArtworkPath(scene: LearningScene): string {
  const artwork = scene === 'maths' ? 'maths' : scene === 'science' ? 'space' : 'island';
  return `/assets/scenes/archie-jigsaw-${artwork}-v2.webp`;
}
export function sceneForSubject(subject: string, title = ''): LearningScene {
  if (/history|egypt|roman|tudor|castle|past/i.test(subject + ' ' + title)) return 'history';
  if (/science|planet|space|atom|solar/i.test(subject + ' ' + title)) return 'science';
  if (/reading|spelling|english|story|book|word|punctuation/i.test(subject + ' ' + title)) return 'reading';
  if (/reward|sticker|progress/i.test(subject + ' ' + title)) return 'rewards';
  if (/maths|fraction|number|money|clock|pattern/i.test(subject + ' ' + title)) return 'maths';
  return 'adventure';
}

const GAME_CUES: Array<[RegExp, string]> = [
  [/adventure trail|reading map|story map/i, '🗺️'],
  [/star trail/i, '⭐'],
  [/number pop|place value pop/i, '🎈'],
  [/race|sprint|dash|speed/i, '🏁'],
  [/fraction pizza/i, '🍕'],
  [/fraction|decimal|percent|ratio/i, '½'],
  [/shape|angle|geometry|symmetr|area|perimeter/i, '🔷'],
  [/number bond|snap|match/i, '🧩'],
  [/money|coin|shop/i, '🪙'],
  [/time|clock/i, '🕒'],
  [/table|multiply|multiplication|division/i, '×'],
  [/punctuation|speech mark|apostrophe/i, '❓'],
  [/spell|letter|anagram|word/i, '🔤'],
  [/sentence|reading|story|book|poetry|comprehension/i, '📖'],
  [/animal|habitat|food chain|microhabitat/i, '🦊'],
  [/space|planet|solar|earth and space/i, '🪐'],
  [/science|lab|material|force|electric|magnet/i, '🧪'],
  [/geography|world|country|uk/i, '🌍'],
  [/pattern|sequence/i, '🔁'],
  [/data|chart|graph/i, '📊'],
];

/** A decorative, predictable cue that helps adjacent game cards look different. */
export function gameArtworkCue(title: string, subject = ''): string {
  const match = GAME_CUES.find(([pattern]) => pattern.test(title));
  if (match) return match[1];
  return ({ maths: '🔢', spelling: '🔤', reading: '📖', science: '🔬' } as Record<string, string>)[subject.toLowerCase()] ?? '🎮';
}

export default function SceneArtwork({ scene = 'adventure', title = '', compact = false, cue }: { scene?: LearningScene; title?: string; compact?: boolean; cue?: string }) {
  const seed = Array.from(title).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 17);
  return <div aria-hidden="true" className={`scene-art scene-${scene} ${compact ? 'scene-compact' : ''}`} style={{ '--scene-turn': `${seed % 17 - 8}deg`, '--scene-accent': `${190 + seed % 35}`, '--scene-position': `${45 + seed % 15}%` } as CSSProperties}>
    <img className="scene-environment" src={sceneArtworkPath(scene)} alt="" loading="lazy" decoding="async" width={1536} height={1024}/>
    <span className="scene-glow"/>
    <span className="scene-orb scene-orb-one"/><span className="scene-orb scene-orb-two"/>
    <span className="scene-spark scene-spark-one">✦</span><span className="scene-spark scene-spark-two">✧</span>
    {cue && <span className="scene-game-cue" data-game-art-cue>{cue}</span>}
  </div>;
}
