import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChildPageMischief, { chooseMischief, isChildLearningPath, shouldRenderMischief } from '@/components/ChildPageMischief';

const renderMischief = (path: string, random: () => number) => render(
  <MemoryRouter initialEntries={[path]}>
    <ChildPageMischief delayMs={0} random={random} />
  </MemoryRouter>
);

describe('ChildPageMischief route boundary', () => {
  it('runs only on child learning routes', () => {
    expect(isChildLearningPath('/')).toBe(true);
    expect(isChildLearningPath('/subjects/maths')).toBe(true);
    expect(isChildLearningPath('/games/number-pop')).toBe(true);
    expect(isChildLearningPath('/battle/abc')).toBe(true);

    expect(isChildLearningPath('/parent-dashboard')).toBe(false);
    expect(isChildLearningPath('/hub/subscription')).toBe(false);
    expect(isChildLearningPath('/checkout/cancel')).toBe(false);
    expect(isChildLearningPath('/pricing')).toBe(false);
    expect(isChildLearningPath('/admin-panel')).toBe(false);
    expect(isChildLearningPath('/teacher-hub')).toBe(false);
  });

  it('reserves the pretend cancel visual for games and uses no real action element', () => {
    expect(chooseMischief('/games/number-pop', () => 0.4)).toBe('pretend-cancel');
    expect(chooseMischief('/subjects/maths', () => 0.4)).toBe('archie-dash');
  });

  it('does not render an animation for reduced-motion users', () => {
    expect(shouldRenderMischief(true, true)).toBe(false);
    expect(shouldRenderMischief(true, false)).toBe(true);
    expect(shouldRenderMischief(false, false)).toBe(false);
  });
});

describe('ChildPageMischief safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('runs each allowed visual gag as an inert overlay', () => {
    const examples = [
      ['/subjects/maths', 0.1, 'mischief-archie-dash'],
      ['/subjects/maths', 0.9, 'mischief-friend-peek'],
      ['/games/number-pop', 0.2, 'mischief-button-buddy'],
      ['/games/number-pop', 0.4, 'mischief-pretend-cancel'],
    ] as const;

    for (const [path, randomValue, testId] of examples) {
      sessionStorage.clear();
      const { container, unmount } = renderMischief(path, () => randomValue);
      act(() => vi.advanceTimersByTime(1));

      const gag = screen.getByTestId(testId);
      expect(gag).toHaveAttribute('aria-hidden', 'true');
      expect(gag.className).toContain('pointer-events-none');
      expect(gag.querySelector('button, a, input, select, textarea')).toBeNull();
      expect(container.querySelector('[data-testid^="mischief-"]')).toBe(gag);
      unmount();
    }
  });

  it('renders the pretend cancel gag as a non-interactive, pointer-transparent visual', () => {
    const { container } = renderMischief('/games/number-pop', () => 0.4);
    act(() => vi.advanceTimersByTime(1));

    const gag = screen.getByTestId('mischief-pretend-cancel');
    expect(gag).toHaveAttribute('aria-hidden', 'true');
    expect(gag.className).toContain('pointer-events-none');
    expect(gag.querySelector('button')).toBeNull();
    expect(gag.querySelector('a')).toBeNull();
    expect(container.querySelectorAll('[data-testid^="mischief-"] button')).toHaveLength(0);
  });

  it('does not render on a protected parent or subscription page', () => {
    const { container } = renderMischief('/hub/subscription', () => 0.4);
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('[data-testid^="mischief-"]')).toBeNull();
  });

  it('does not mount an interaction when the operating system requests reduced motion', () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = renderMischief('/games/number-pop', () => 0.4);
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('[data-testid^="mischief-"]')).toBeNull();

    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
  });

  it('rate limits a second gag in the same session', () => {
    const first = renderMischief('/games/number-pop', () => 0.2);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('mischief-button-buddy')).toBeInTheDocument();
    first.unmount();

    const second = renderMischief('/games/number-pop', () => 0.2);
    act(() => vi.advanceTimersByTime(1));
    expect(second.container.querySelector('[data-testid^="mischief-"]')).toBeNull();
  });
});
