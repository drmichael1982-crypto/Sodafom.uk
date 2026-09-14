import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { readFileSync, existsSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StoryPlayer from './StoryPlayer';
import CinemaPage, { AnimatedBooksPage } from '../../pages/CinemaPage';
import { CINEMA_STORIES, ILLUSTRATED_SHORTS, pageDurationMs, storyDurationLabel } from './stories';
import { initialPlayback, LITTLE_JOKES, makeJokeBag, playbackReducer } from './playback';

const story = CINEMA_STORIES[0];
let hidden = false;
let reduced = false;
let preferenceChanged: (() => void) | undefined;

beforeEach(() => {
  vi.useFakeTimers();
  hidden = false;
  reduced = false;
  preferenceChanged = undefined;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    get matches() { return reduced; },
    addEventListener: (_: string, listener: () => void) => { preferenceChanged = listener; },
    removeEventListener: vi.fn(),
  })));
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function showPlayer() { return render(<StoryPlayer story={story} mode="cinema" onClose={vi.fn()} />); }
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })); }
function advance(ms: number) { act(() => { vi.advanceTimersByTime(ms); }); }

describe('existing story content and truthful durations', () => {
  it('uses all 100 original sentences and only available artwork', () => {
    const original = readFileSync('src/pages/ArchieStoryCollectionPage.tsx', 'utf8');
    expect(CINEMA_STORIES).toHaveLength(10);
    expect(ILLUSTRATED_SHORTS).toHaveLength(4);
    for (const item of CINEMA_STORIES) {
      expect(item.pages).toHaveLength(10);
      expect(original).toContain(item.title);
      item.pages.forEach(page => expect(original).toContain(page));
      if (item.image) expect(existsSync(`public${item.image}`)).toBe(true);
    }
  });
  it('derives the displayed runtime from the real scene durations', () => {
    expect(pageDurationMs('A short sentence.')).toBe(8_000);
    const total = story.pages.reduce((sum, page) => sum + pageDurationMs(page), 0) / 1000;
    expect(storyDurationLabel(story)).toBe(`${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`);
  });
});

describe('story playback', () => {
  it('starts silently paused, preserves paused time, and plays all ten scenes to a real ending', () => {
    const { unmount } = showPlayer();
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    click('Play story');
    advance(2_000);
    click('Pause');
    advance(60_000);
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
    click('Play story');
    advance(pageDurationMs(story.pages[0]) - 2_000);
    expect(screen.getByText(story.pages[1])).toBeInTheDocument();
    for (let page = 1; page < story.pages.length; page += 1) {
      expect(screen.getByText(story.pages[page])).toBeInTheDocument();
      advance(pageDurationMs(story.pages[page]));
    }
    expect(screen.getByText('The end. Thank you for joining Archie!')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Story progress' })).toHaveAttribute('value', '100');
    expect(screen.getByRole('button', { name: 'Next scene' })).toBeDisabled();
    expect(vi.getTimerCount()).toBe(0);
    click('Play again');
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('supports manual pages, keyboard controls, restart, and the manual ending without audio', () => {
    showPlayer();
    expect(screen.getByRole('button', { name: 'Previous scene' })).toBeDisabled();
    const stage = screen.getByLabelText('Story screen. Use left and right arrows to turn pages, or Space to play and pause.');
    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(screen.getByText(story.pages[1])).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: ' ' });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    click('Restart');
    expect(vi.getTimerCount()).toBe(0);
    for (let i = 1; i < story.pages.length; i += 1) click('Next scene');
    expect(screen.getByText('The end. Thank you for joining Archie!')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Story progress' })).toHaveAttribute('value', '100');
    click('Restart');
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
  });

  it('does not hijack arrow keys on a button', () => {
    showPlayer();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Play story' }), { key: 'ArrowRight' });
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
  });

  it('pauses in a background tab and waits for user playback when visible again', () => {
    showPlayer();
    click('Play story');
    hidden = true;
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(vi.getTimerCount()).toBe(0);
    advance(90_000);
    hidden = false;
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play story' })).toBeInTheDocument();
  });

  it('honours reduced motion even when playback is explicitly started', () => {
    reduced = true;
    showPlayer();
    const motion = screen.getByRole('checkbox', { name: 'Gentle picture motion' });
    expect(motion).toBeDisabled();
    expect(motion).not.toBeChecked();
    click('Play story');
    expect(screen.getByLabelText('Story screen. Use left and right arrows to turn pages, or Space to play and pause.')).toHaveAttribute('data-moving', 'false');
    advance(pageDurationMs(story.pages[0]));
    expect(screen.getByText(story.pages[1])).toBeInTheDocument();
    act(() => preferenceChanged?.());
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the entire reader usable if the illustration fails', () => {
    showPlayer();
    fireEvent.error(screen.getByRole('img', { name: `${story.title} cover illustration` }));
    expect(screen.getByRole('img', { name: `Illustration unavailable for ${story.title}` })).toBeInTheDocument();
    click('Next scene');
    expect(screen.getByText(story.pages[1])).toBeInTheDocument();
  });

  it('handles unavailable full screen without losing the story', async () => {
    showPlayer();
    await act(async () => click('Toggle full screen'));
    expect(screen.getByRole('status')).toHaveTextContent('Full screen is unavailable here');
    expect(screen.getByText(story.pages[0])).toBeInTheDocument();
  });
});

describe('optional user-initiated browser speech', () => {
  let speech: { speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    speech = { speak: vi.fn(), cancel: vi.fn() };
    vi.stubGlobal('speechSynthesis', speech);
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; constructor(text: string) { this.text = text; } });
  });

  it('speaks only after a click, pauses timing, and cancels on page change, visibility and unmount', () => {
    const { unmount } = showPlayer();
    expect(speech.speak).not.toHaveBeenCalled();
    click('Play story');
    expect(speech.speak).not.toHaveBeenCalled();
    click('Read this page');
    expect(speech.speak.mock.calls[0][0].text).toBe(story.pages[0]);
    expect(vi.getTimerCount()).toBe(0);
    click('Next scene');
    expect(speech.cancel).toHaveBeenCalledTimes(1);
    click('Read this page');
    hidden = true;
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(speech.cancel).toHaveBeenCalledTimes(2);
    hidden = false;
    click('Read this page');
    unmount();
    expect(speech.cancel).toHaveBeenCalledTimes(3);
  });

  it('recovers from speech failures with manual controls intact', () => {
    speech.speak.mockImplementation(() => { throw new Error('No voice'); });
    showPlayer();
    click('Read this page');
    expect(screen.getByRole('status')).toHaveTextContent('Read aloud is unavailable');
    click('Next scene');
    expect(screen.getByText(story.pages[1])).toBeInTheDocument();
  });
});

describe('shelves and optional surprises', () => {
  it('lists the available shorts and restores keyboard focus after closing', () => {
    render(<MemoryRouter><CinemaPage /></MemoryRouter>);
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(4);
    click(`Open ${story.title}`);
    click('Back to shelf');
    expect(screen.getByRole('button', { name: `Open ${story.title}` })).toHaveFocus();
  });

  it('offers all ten books and the final book can be read to its ending', () => {
    render(<MemoryRouter><AnimatedBooksPage /></MemoryRouter>);
    expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(10);
    click(`Open ${CINEMA_STORIES[9].title}`);
    for (let i = 1; i < 10; i += 1) click('Next page');
    expect(screen.getByText(CINEMA_STORIES[9].pages[9])).toBeInTheDocument();
    expect(screen.getByText('The end. Thank you for joining Archie!')).toBeInTheDocument();
  });

  it('shows each joke once before repeating and avoids repeats across bag boundaries', () => {
    const bag = makeJokeBag(null, () => .5);
    expect(new Set(bag).size).toBe(LITTLE_JOKES.length);
    expect(makeJokeBag(bag.at(-1)!, () => .5)[0]).not.toBe(bag.at(-1));
    showPlayer();
    expect(screen.queryByRole('complementary', { name: 'Little surprise' })).not.toBeInTheDocument();
    click('Find a little surprise');
    const seen = new Set<string>();
    for (let i = 0; i < LITTLE_JOKES.length; i += 1) {
      seen.add(screen.getByRole('complementary', { name: 'Little surprise' }).querySelector('p')!.textContent!);
      if (i < LITTLE_JOKES.length - 1) click('Another giggle');
    }
    expect(seen.size).toBe(LITTLE_JOKES.length);
    const last = screen.getByRole('complementary', { name: 'Little surprise' }).querySelector('p')!.textContent;
    click('Close surprise');
    click('Find a little surprise');
    expect(screen.getByRole('complementary', { name: 'Little surprise' }).querySelector('p')!.textContent).not.toBe(last);
  });

  it('does not advance a paused reducer and clamps page requests', () => {
    expect(playbackReducer(initialPlayback, { type: 'tick', deltaMs: 999999, durationMs: 8000, count: 10 })).toEqual(initialPlayback);
    expect(playbackReducer(initialPlayback, { type: 'page', page: 30, count: 10 }).page).toBe(9);
    expect(playbackReducer(initialPlayback, { type: 'page', page: -10, count: 10 }).page).toBe(0);
  });
});
