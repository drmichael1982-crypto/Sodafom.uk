import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameResult } from '@/components/games/GameShell';

const { onComplete } = vi.hoisted(() => ({ onComplete: vi.fn() }));
vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: { children: (complete: (result: GameResult) => void) => React.ReactNode }) => children(onComplete),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
import ColourLearnPage from './colour-learn';

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); onComplete.mockClear(); });

const paletteNames = ['Colour 1: Red', 'Colour 2: Blue', 'Colour 3: Yellow', 'Colour 4: Green', 'Colour 5: Orange', 'Colour 6: Purple', 'Colour 7: Pink', 'Colour 8: Brown'];

async function tabTo(user: ReturnType<typeof userEvent.setup>, target: HTMLElement) {
  for (let step = 0; step <= screen.getAllByRole('button').length; step++) {
    if (document.activeElement === target) return;
    await user.tab();
  }
  expect(target).toHaveFocus();
}

describe('Colour & Learn keyboard painting', () => {
  it('names every colour and keeps one selected state while keyboard focus stays on the choice', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<ColourLearnPage />);
    for (const [index, name] of paletteNames.entries()) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', String(index === 0));
    }
    const red = screen.getByRole('button', { name: 'Colour 1: Red', pressed: true });
    const blue = screen.getByRole('button', { name: 'Colour 2: Blue', pressed: false });
    await tabTo(user, blue);
    await user.keyboard(' ');
    expect(blue).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Colour 2: Blue', pressed: true })).toBe(blue);
    expect(red).toHaveAttribute('aria-pressed', 'false');
    const green = screen.getByRole('button', { name: 'Colour 4: Green', pressed: false });
    await tabTo(user, green);
    await user.keyboard('{Enter}');
    expect(green).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Colour 4: Green', pressed: true })).toBe(green);
    expect(blue).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard(' ');
    expect(screen.getAllByRole('button', { pressed: true })).toEqual([green]);
    expect(screen.getByRole('button', { name: 'Sun, colour 3' })).toBeEnabled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.each([
    { picture: 'Sunshine', random: 0, regions: [['Sun', 3], ['Sky', 2], ['Grass', 4]] as const },
    { picture: 'Flower', random: 0.4, regions: [['Petals', 7], ['Centre', 3], ['Stem', 4], ['Leaf', 4]] as const },
    { picture: 'Rainbow', random: 0.8, regions: [['Outer arc', 1], ['Middle arc', 5], ['Inner arc', 3], ['Innermost', 2], ['Cloud', 8]] as const },
  ])('can complete $picture using Tab, Enter and Space', async ({ random, regions }) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    const user = userEvent.setup();
    render(<ColourLearnPage />);
    for (const [label, number] of regions) {
      expect(screen.getByRole('button', { name: `${label}, colour ${number}` })).toBeEnabled();
    }
    for (const [index, [label, number]] of regions.entries()) {
      const palette = screen.getByRole('button', { name: paletteNames[number - 1] });
      await tabTo(user, palette);
      await user.keyboard(index % 2 === 0 ? '{Enter}' : ' ');
      const region = screen.getByRole('button', { name: `${label}, colour ${number}` });
      expect(region).toBeEnabled();
      await tabTo(user, region);
      await user.keyboard(index % 2 === 0 ? ' ' : '{Enter}');
      expect(region).toBeDisabled();
      for (const [remainingLabel, remainingNumber] of regions.slice(index + 1)) {
        expect(screen.getByRole('button', { name: `${remainingLabel}, colour ${remainingNumber}` })).toBeEnabled();
      }
      expect(onComplete).not.toHaveBeenCalled();
    }
    expect(screen.getByText(`Beautiful! ${regions.length}/${regions.length} correct!`, { exact: false })).toBeInTheDocument();
    const finish = screen.getByRole('button', { name: 'See my stars' });
    expect(finish).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ correct: regions.length, total: regions.length, score: 100, stars: 3 });
    await user.keyboard(' ');
    expect(onComplete).toHaveBeenCalledTimes(1);
  }, 10000);

  it('locks an incorrectly filled region and keeps the original partial score', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<ColourLearnPage />);
    const sun = screen.getByRole('button', { name: 'Sun, colour 3' });
    await tabTo(user, sun);
    await user.keyboard('{Enter}'); // Initial colour 1 is wrong for the sun.
    expect(sun).toBeDisabled();
    const yellow = screen.getByRole('button', { name: 'Colour 3: Yellow' });
    await tabTo(user, yellow);
    await user.keyboard(' ');
    await user.click(sun); // A filled region cannot be repainted to increase the score.
    expect(sun).toBeDisabled();
    for (const [label, number] of [['Sky', 2], ['Grass', 4]] as const) {
      await tabTo(user, screen.getByRole('button', { name: paletteNames[number - 1] }));
      await user.keyboard('{Enter}');
      await tabTo(user, screen.getByRole('button', { name: `${label}, colour ${number}` }));
      await user.keyboard(' ');
    }
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'See my stars' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ correct: 2, total: 3, score: 67, stars: 2 });
  }, 10000);

  it('keeps the finished artwork and score until explicit completion, even after 30 seconds', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { container } = render(<ColourLearnPage />);
    for (const [label, number] of [['Sun', 3], ['Sky', 2], ['Grass', 4]] as const) {
      fireEvent.click(screen.getByRole('button', { name: paletteNames[number - 1] }));
      fireEvent.click(screen.getByRole('button', { name: `${label}, colour ${number}` }));
    }
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText('Beautiful! 3/3 correct!', { exact: false })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll('svg path')).map(path => path.getAttribute('fill'))).toEqual(['#EAB308', '#3B82F6', '#22C55E']);
    expect(onComplete).not.toHaveBeenCalled();
    const finish = screen.getByRole('button', { name: 'See my stars' });
    fireEvent.click(finish);
    fireEvent.click(finish);
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ correct: 3, total: 3, score: 100, stars: 3 });
  });

  it.each(['tutor', 'dialog'] as const)('preserves %s interaction when the last region is filled', async (interaction) => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(
      <div onClick={event => {
        if ((event.target as HTMLElement).closest('button')?.getAttribute('aria-label') !== 'Grass, colour 4') return;
        if (interaction === 'tutor') screen.getByRole('textbox', { name: 'Tutor reply' }).focus();
        else document.querySelector('dialog')?.setAttribute('open', '');
      }}>
        <ColourLearnPage />
        <input aria-label="Tutor reply" />
        <dialog aria-label="Tutor dialog">Help stays open</dialog>
      </div>
    );
    for (const [label, number] of [['Sun', 3], ['Sky', 2], ['Grass', 4]] as const) {
      await user.click(screen.getByRole('button', { name: paletteNames[number - 1] }));
      await user.click(screen.getByRole('button', { name: `${label}, colour ${number}` }));
    }
    const finish = screen.getByRole('button', { name: 'See my stars' });
    expect(finish).not.toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();
    if (interaction === 'tutor') expect(screen.getByRole('textbox', { name: 'Tutor reply' })).toHaveFocus();
    else {
      expect(screen.getByRole('dialog', { name: 'Tutor dialog' })).toHaveAttribute('open');
      document.querySelector('dialog')?.removeAttribute('open');
    }
    const red = screen.getByRole('button', { name: 'Colour 1: Red' });
    await user.click(red);
    expect(red).toHaveFocus();
    expect(finish).not.toHaveFocus();
  });
});
