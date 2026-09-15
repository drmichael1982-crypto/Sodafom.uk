import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartoonTheatrePage from './CartoonTheatrePage';

const voice = vi.hoisted(() => ({
  stopTts: vi.fn(),
  ttsSpeak: vi.fn(),
}));

vi.mock('@/lib/voice-context', () => voice);
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/components/ArchieCharacter', () => ({
  default: ({ speaking }: { speaking?: boolean }) => (
    <div data-testid="archie" data-speaking={speaking ? 'yes' : 'no'} />
  ),
}));

describe('CartoonTheatrePage', () => {
  beforeEach(() => {
    voice.stopTts.mockClear();
    voice.ttsSpeak.mockClear();
  });

  it('starts one narration when an episode begins and one more when playback resumes', () => {
    render(<CartoonTheatrePage />);

    fireEvent.click(screen.getByRole('button', { name: /The Number Island/i }));
    expect(voice.ttsSpeak).toHaveBeenCalledTimes(1);
    expect(voice.ttsSpeak).toHaveBeenLastCalledWith('The Number Island. Archie arrives at Number Island.');
    expect(screen.getByTestId('archie')).toHaveAttribute('data-speaking', 'yes');

    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(screen.getByTestId('archie')).toHaveAttribute('data-speaking', 'no');

    fireEvent.click(screen.getByRole('button', { name: /^Play$/i }));
    expect(voice.ttsSpeak).toHaveBeenCalledTimes(2);
    expect(voice.ttsSpeak).toHaveBeenLastCalledWith('The Number Island. Archie arrives at Number Island.');
  });

  it('moves to the next scene without duplicating narration', () => {
    render(<CartoonTheatrePage />);

    fireEvent.click(screen.getByRole('button', { name: /The Number Island/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next scene/i }));

    expect(screen.getByText('The number bridge needs ten correct answers.')).toBeInTheDocument();
    expect(voice.ttsSpeak).toHaveBeenCalledTimes(2);
    expect(voice.ttsSpeak).toHaveBeenLastCalledWith('The number bridge needs ten correct answers.');
  });

  it('turns autoplay off before reading a scene manually', () => {
    render(<CartoonTheatrePage />);

    fireEvent.click(screen.getByRole('button', { name: /The Number Island/i }));
    fireEvent.click(screen.getByRole('button', { name: /Read this scene/i }));

    expect(screen.getByTestId('archie')).toHaveAttribute('data-speaking', 'no');
    expect(voice.ttsSpeak).toHaveBeenCalledTimes(2);
    expect(voice.ttsSpeak).toHaveBeenLastCalledWith('Archie arrives at Number Island.');
  });
});
