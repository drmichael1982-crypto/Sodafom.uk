import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CartoonEpisodePlayer from './CartoonEpisodePlayer';
import { DINOSAUR_ADVENTURE } from '@/lib/cartoons/dinosaur-adventure';

vi.mock('@/lib/voice-context', () => ({
  stopTts: vi.fn(),
  ttsSpeak: vi.fn(),
}));

describe('CartoonEpisodePlayer', () => {
  it('shows captions, working controls and an explorer question', () => {
    render(<CartoonEpisodePlayer episode={DINOSAUR_ADVENTURE} onExit={vi.fn()} />);

    expect(screen.getByRole('heading', { name: "Archie's Dinosaur Adventure" })).toBeInTheDocument();
    expect(screen.getByLabelText('Subtitles')).toHaveTextContent('My golden heart key is glowing');
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('region', { name: 'Explorer question' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'A leafy branch' }));
    expect(screen.getByText('Exactly! A herbivore eats plants.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Subtitles on' }));
    expect(screen.queryByLabelText('Subtitles')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subtitles off' })).toBeInTheDocument();
  });
});
