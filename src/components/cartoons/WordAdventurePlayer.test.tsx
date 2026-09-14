import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import WordAdventurePlayer from './WordAdventurePlayer';
import { WORD_ADVENTURE } from '@/lib/cartoons/word-adventure';

const voiceMocks = vi.hoisted(() => ({ stopTts: vi.fn(), ttsSpeak: vi.fn() }));
vi.mock('@/lib/voice-context', () => ({ stopTts: voiceMocks.stopTts, ttsSpeak: voiceMocks.ttsSpeak }));

describe('WordAdventurePlayer', () => {
  beforeEach(() => vi.clearAllMocks());
  it('plays with permanent subtitles and all primary controls', () => {
    render(<WordAdventurePlayer onExit={vi.fn()} />);
    expect(screen.getByTestId('scene-counter')).toHaveTextContent('Scene 1 of 42');
    expect(screen.getByTestId('word-adventure-subtitle')).toHaveTextContent('Welcome to Word World');
    expect(screen.getByRole('button', { name: 'Pause cartoon' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip to next scene' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restart the cartoon' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause cartoon' }));
    expect(screen.getByRole('button', { name: 'Play cartoon' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Turn music and sound off' }));
    expect(screen.getByRole('button', { name: 'Turn music and sound on' })).toBeInTheDocument();
  });
  it('gives kind, checked feedback for a correct answer', () => {
    render(<WordAdventurePlayer onExit={vi.fn()} initialScene={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'kite' }));
    expect(screen.getByRole('status')).toHaveTextContent('Kite begins with the /k/ sound');
  });
  it('keeps feedback encouraging for an incorrect answer', () => {
    render(<WordAdventurePlayer onExit={vi.fn()} initialScene={4} />);
    fireEvent.click(screen.getByRole('button', { name: 'sun' }));
    expect(screen.getByRole('status')).toHaveTextContent('Good try. Kite begins with the /k/ sound');
  });
  it('auto-advances the running timeline after a scene duration', () => {
    vi.useFakeTimers();
    try {
      render(<WordAdventurePlayer onExit={vi.fn()} />);
      act(() => { vi.advanceTimersByTime(8_000); });
      expect(screen.getByTestId('scene-counter')).toHaveTextContent('Scene 2 of 42');
    } finally { vi.runOnlyPendingTimers(); vi.useRealTimers(); }
  });
  it('runs all 42 scenes through the player controls to the end card', () => {
    render(<WordAdventurePlayer onExit={vi.fn()} />);
    for (let scene = 0; scene < WORD_ADVENTURE.scenes.length; scene += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Skip to next scene' }));
    }
    expect(screen.getByRole('status')).toHaveTextContent('Adventure complete');
    expect(screen.getByTestId('scene-counter')).toHaveTextContent('Scene 42 of 42');
  });
});
