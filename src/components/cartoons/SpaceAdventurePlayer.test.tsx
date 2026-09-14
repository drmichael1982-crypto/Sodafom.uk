/** @vitest-environment jsdom */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SpaceAdventurePlayer from './SpaceAdventurePlayer';

const { ttsSpeakMock, stopTtsMock } = vi.hoisted(() => ({
  ttsSpeakMock: vi.fn(),
  stopTtsMock: vi.fn(),
}));

vi.mock('@/lib/voice-context', () => ({
  ttsSpeak: ttsSpeakMock,
  stopTts: stopTtsMock,
}));

describe('SpaceAdventurePlayer', () => {
  it('opens with subtitles and starts narration only after a child presses Play', () => {
    render(<SpaceAdventurePlayer onExit={vi.fn()} />);

    expect(screen.getByTestId('cartoon-subtitle')).toHaveTextContent('Three, two, one… space adventure!');
    expect(ttsSpeakMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Play cartoon' }));
    expect(ttsSpeakMock).toHaveBeenCalledWith(expect.stringContaining('Archie.'), expect.any(Function));
  });

  it('stops at the Earth question and advances after the correct child answer', async () => {
    render(<SpaceAdventurePlayer onExit={vi.fn()} />);
    const next = screen.getByRole('button', { name: 'Skip or continue to next scene' });

    for (let count = 0; count < 5; count += 1) fireEvent.click(next);

    expect(screen.getByTestId('space-quiz')).toHaveTextContent('Which object does Earth travel around?');
    fireEvent.click(screen.getByRole('button', { name: 'The Sun' }));

    const lastCall = ttsSpeakMock.mock.calls.at(-1);
    expect(lastCall?.[0]).toContain('Correct! Earth travels around the Sun');
    act(() => lastCall?.[1]?.());

    await waitFor(() => expect(screen.getByTestId('cartoon-subtitle')).toHaveTextContent('Next stop: Earth’s Moon!'));
  });

  it('keeps play, skip, restart and sound controls available', () => {
    render(<SpaceAdventurePlayer onExit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Play cartoon' }));
    expect(screen.getByRole('button', { name: 'Pause cartoon' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Skip or continue to next scene' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Restart Space Adventure' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Turn music and sound off' })).toHaveAttribute('aria-pressed', 'true');
  });
});
