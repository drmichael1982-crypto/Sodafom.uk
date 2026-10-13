import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SceneArtwork, { gameArtworkCue } from './SceneArtwork';

describe('game artwork cues', () => {
  it('gives the opening maths games distinct, predictable picture cues', () => {
    const titles = ["Archie’s Adventure Trail", 'Star Trail', 'Number Pop!', 'Times Table Race', 'Fraction Pizza', 'Shape Sorter', 'Number Bonds'];
    const cues = titles.map(title => gameArtworkCue(title, 'maths'));
    expect(cues).toEqual(['🗺️', '⭐', '🎈', '🏁', '🍕', '🔷', '🧩']);
    expect(new Set(cues)).toHaveLength(titles.length);
  });

  it('keeps the cue decorative while exposing a stable browser-test hook', () => {
    const { container } = render(<SceneArtwork scene="maths" title="Fraction Pizza" compact cue="🍕"/>);
    const artwork = container.querySelector('.scene-art');
    expect(artwork).toHaveAttribute('aria-hidden', 'true');
    expect(artwork?.querySelector('[data-game-art-cue]')).toHaveTextContent('🍕');
  });

  it('falls back to a subject cue for an unfamiliar game title', () => {
    expect(gameArtworkCue('A new activity', 'science')).toBe('🔬');
    expect(gameArtworkCue('A new activity', 'maths')).toBe('🔢');
  });
});
