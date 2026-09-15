import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartoonEpisodePlayer from './CartoonEpisodePlayer';
import { ARCHIES_AMAZING_SCIENCE_ADVENTURE } from '@/lib/cartoons/archies-amazing-science-adventure';

const audio = vi.hoisted(() => ({ ttsSpeak: vi.fn(), stopTts: vi.fn() }));
vi.mock('@/lib/voice-context', () => audio);

describe('CartoonEpisodePlayer', () => {
  beforeEach(() => { audio.ttsSpeak.mockReset(); audio.stopTts.mockReset(); });

  it('shows subtitles and plays spoken narration on request', () => {
    render(<CartoonEpisodePlayer episode={ARCHIES_AMAZING_SCIENCE_ADVENTURE} onExit={vi.fn()} />);
    expect(screen.getByText('Science starts with a curious question: why?')).toBeVisible();
    expect(screen.getByText(/Subtitles are on/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Play cartoon' }));
    expect(audio.ttsSpeak).toHaveBeenCalledWith(expect.stringContaining('Welcome to my Amazing Science Adventure!'));
  });

  it('requires a question answer, provides kind feedback, then continues', () => {
    render(<CartoonEpisodePlayer episode={ARCHIES_AMAZING_SCIENCE_ADVENTURE} initialSceneIndex={1} onExit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Continue after answering the question' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'A liquid' }));
    expect(screen.getByText('Correct! A liquid flows and takes the shape of its container.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { name: 'Look, Then Notice' })).toBeVisible();
  });

  it('offers working mute and restart controls', () => {
    render(<CartoonEpisodePlayer episode={ARCHIES_AMAZING_SCIENCE_ADVENTURE} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mute audio narration' }));
    expect(screen.getByRole('button', { name: 'Read current scene aloud' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Restart cartoon' }));
    expect(screen.getByRole('heading', { name: 'The Curious Door' })).toBeVisible();
  });

  it('runs the complete twelve-scene episode, including every interactive stop', async () => {
    vi.useFakeTimers();
    try {
      render(<CartoonEpisodePlayer episode={ARCHIES_AMAZING_SCIENCE_ADVENTURE} onExit={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Play cartoon' }));

      const run = async (seconds: number): Promise<void> => {
        for (let tick = 0; tick < (seconds + 1) * 4; tick += 1) {
          await act(async () => { await vi.advanceTimersByTimeAsync(250); });
        }
      };

      await run(28);
      expect(screen.getByRole('heading', { name: 'Three Material Friends' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'A liquid' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await run(28);
      expect(screen.getByRole('heading', { name: 'The Push and Pull Parade' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'A push' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await run(31);
      expect(screen.getByRole('heading', { name: 'The Shadow Show' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'An object blocks light' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await run(31 + 32);
      expect(screen.getByRole('heading', { name: 'Homes for Every Creature' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'A pond' }));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await run(31 + 34 + 36);
      expect(screen.getByRole('heading', { name: 'Science stars!' })).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  }, 15000);
});
