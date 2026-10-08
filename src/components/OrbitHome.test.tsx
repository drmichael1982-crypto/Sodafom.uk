import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saved = vi.hoisted(() => ({ setSettings: vi.fn() }));
vi.mock('@/lib/archie/storage', () => ({
  useArchieData: () => ({ settings: { year: 3, sound: true, largeText: false }, setSettings: saved.setSettings }),
}));
import OrbitHome from './OrbitHome';

const FACTS = [
  ['Mercury', 'Mercury is the closest planet to the Sun.'],
  ['Venus', 'Venus has a very hot surface and a thick atmosphere.'],
  ['Earth', 'Earth is our home, with oceans and living things.'],
  ['Mars', 'Mars is a rocky planet often called the Red Planet.'],
  ['Jupiter', 'Jupiter is the largest planet in our Solar System.'],
  ['Saturn', 'Saturn has bright rings made of ice and rock.'],
  ['Uranus', 'Uranus rotates on its side compared with most planets.'],
  ['Neptune', 'Neptune is the farthest planet from the Sun.'],
] as const;

function preference(initial = false) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches: initial,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') listeners.add(listener);
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') listeners.delete(listener);
    }),
  };
  return {
    query, listeners,
    change(matches: boolean) {
      query.matches = matches;
      const event = { matches, media: query.media } as MediaQueryListEvent;
      act(() => { for (const listener of listeners) listener(event); });
    },
  };
}
let media: ReturnType<typeof preference>;
let mediaDevicesDescriptor: PropertyDescriptor | undefined;
const network = vi.fn();
const microphone = vi.fn();
const recognition = vi.fn(function () { return { start: microphone }; });
beforeEach(() => {
  vi.clearAllMocks();
  media = preference();
  vi.stubGlobal('matchMedia', vi.fn(() => media.query));
  vi.stubGlobal('fetch', network);
  vi.stubGlobal('SpeechRecognition', recognition);
  vi.stubGlobal('webkitSpeechRecognition', recognition);
  mediaDevicesDescriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: microphone } });
});
afterEach(() => {
  cleanup();
  if (mediaDevicesDescriptor) Object.defineProperty(navigator, 'mediaDevices', mediaDevicesDescriptor);
  else Reflect.deleteProperty(navigator, 'mediaDevices');
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
function show() { return render(<MemoryRouter><OrbitHome /></MemoryRouter>); }
async function completePuzzle(user: ReturnType<typeof userEvent.setup>, selectEarth=true) {
  for (let index=0;index<FACTS.length;index++) {
    await user.click(screen.getByRole('button',{name:`Pick up ${FACTS[index][0]}`,exact:true}));
    await user.click(screen.getByRole('button',{name:`Place in position ${index+1}: ${FACTS[index][0]}`,exact:true}));
  }
  if(selectEarth)await user.click(screen.getByRole('button',{name:'Earth',exact:true}));
}
function model() { return screen.getByLabelText('Explore the eight planets'); }

describe('home planet discovery', () => {
  it('lets a child change a chosen piece without losing planets already placed', async () => {
    const user=userEvent.setup();show();
    await user.click(screen.getByRole('button',{name:'Pick up Mercury',exact:true}));
    await user.click(screen.getByRole('button',{name:'Place in position 1: Mercury',exact:true}));
    await user.click(screen.getByRole('button',{name:'Pick up Mars',exact:true}));
    await user.click(screen.getByRole('button',{name:'Choose a different piece',exact:true}));
    expect(screen.getByText('1 / 8')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Pick up Mercury',exact:true})).toBeDisabled();
    expect(screen.getByRole('button',{name:'Pick up Mars',exact:true})).toHaveAttribute('aria-pressed','false');
    await user.click(screen.getByRole('button',{name:'Pick up Venus',exact:true}));
    await user.click(screen.getByRole('button',{name:'Place in position 2: Venus',exact:true}));
    expect(screen.getByText('2 / 8')).toBeInTheDocument();
    expect(screen.getByText(/Venus fits!.*Venus has a very hot surface/)).toBeInTheDocument();
  });
  it('starts still, rejects a wrong piece, starts orbiting only after completion and resets', async () => {
    const user=userEvent.setup();show();
    expect(model()).toHaveClass('is-still');
    expect(screen.getByRole('button',{name:'Finish the jigsaw to move planets'})).toBeDisabled();
    await user.click(screen.getByRole('button',{name:'Pick up Mars',exact:true}));
    await user.click(screen.getByRole('button',{name:'Place in position 1: Mercury',exact:true}));
    expect(screen.getByText('Mars belongs in position 4 from the Sun. Try another place.')).toBeInTheDocument();
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
    await completePuzzle(user);
    expect(model()).toHaveClass('is-moving');
    expect(screen.getByText('8 / 8 pieces fit!')).toBeInTheDocument();
    expect(screen.getByRole('dialog',{name:'Your solar system is alive!'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Start the jigsaw again'}));
    expect(model()).toHaveClass('is-still');
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Pick up Mars',exact:true})).toBeEnabled();
  });
  it('places one decorative Moon with Earth, explains the relationship and shares the motion control', async () => {
    const user = userEvent.setup(); show(); await completePuzzle(user);
    const earth = model().querySelector('.home-planet-2');
    const moon = earth?.querySelector('.home-moon-orbit .home-moon');
    expect(moon).not.toBeNull();
    expect(model().querySelectorAll('.home-moon')).toHaveLength(1);
    expect(earth).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('The Moon orbits Earth while Earth orbits the Sun.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pause planets' }));
    expect(model()).toHaveClass('is-still'); expect(moon).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Move planets' }));
    expect(model()).toHaveClass('is-moving');
    media.change(true); expect(model()).toHaveClass('is-still');
    expect(screen.getByRole('button', { name: 'Still planets' })).toBeDisabled();
  });
  it('has eight named native choices with single selected state and a persistent fact status', async () => {
    const user = userEvent.setup(); show(); await completePuzzle(user);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Earth is our home, with oceans and living things.');
    expect(screen.getByRole('button', { name: 'Earth' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('A playful model: sizes, distances and orbit speeds are not to scale.')).toBeInTheDocument();
    for (const [name, fact] of FACTS) {
      const choice = screen.getByRole('button', { name });
      expect(choice.tagName).toBe('BUTTON'); expect(choice).toHaveAttribute('type', 'button');
      choice.focus(); await user.keyboard('{Enter}');
      expect(choice).toHaveFocus(); expect(screen.getByRole('status')).toBe(status);
      expect(status.textContent).toBe(fact);
      for (const [otherName] of FACTS) {
        expect(screen.getByRole('button', { name: otherName })).toHaveAttribute('aria-pressed', String(otherName === name));
      }
    }
    await user.click(screen.getByRole('button', {name:'Back to puzzle'}));
    expect(screen.getByRole('link', { name: 'Start a lesson' })).toHaveAttribute('href', '/courses');
    expect(screen.getByRole('link', { name: 'Choose a game' })).toHaveAttribute('href', '/games');
  });

  it('toggles pause and resume once per keyboard activation without changing the chosen fact', async () => {
    const user = userEvent.setup(); show(); await completePuzzle(user);
    await user.click(screen.getByRole('button', { name: 'Mars' }));
    const motion = screen.getByRole('button', { name: 'Pause planets' }); motion.focus();
    expect(model()).toHaveClass('is-moving'); expect(motion).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Move planets' })).toBe(motion);
    expect(motion).toHaveFocus(); expect(motion).toHaveAttribute('aria-pressed', 'false');
    expect(model()).toHaveClass('is-still'); expect(model()).not.toHaveClass('is-moving');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Pause planets' })).toBe(motion);
    expect(motion).toHaveFocus(); expect(motion).toHaveAttribute('aria-pressed', 'true');
    expect(model()).toHaveClass('is-moving');
    expect(screen.getByRole('status')).toHaveTextContent('Mars is a rocky planet often called the Red Planet.');
    expect(screen.getByRole('button', { name: 'Mars' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('starts still under reduced motion and keeps planet discovery usable', async () => {
    media = preference(true);
    const user = userEvent.setup(); show(); await completePuzzle(user);
    const motion = screen.getByRole('button', { name: 'Still planets' });
    expect(motion).toBeDisabled(); expect(motion).toHaveAttribute('aria-pressed', 'false');
    expect(model()).toHaveClass('is-still'); expect(model()).not.toHaveClass('is-moving');
    await user.click(motion); expect(model()).toHaveClass('is-still');
    screen.getByRole('button', { name: 'Saturn' }).focus(); await user.keyboard(' ');
    expect(screen.getByRole('status')).toHaveTextContent('Saturn has bright rings made of ice and rock.');
    expect(screen.getByRole('button', { name: 'Saturn' })).toHaveFocus();
  });

  it('responds to changed motion preferences, requires opt-in resume and removes its media listener', async () => {
    const user = userEvent.setup(); const view = show(); await completePuzzle(user);
    expect(media.listeners.size).toBe(1); expect(model()).toHaveClass('is-moving');
    media.change(true);
    expect(screen.getByRole('button', { name: 'Still planets' })).toBeDisabled();
    expect(model()).toHaveClass('is-still');
    media.change(false);
    const resume = screen.getByRole('button', { name: 'Move planets' });
    expect(resume).toBeEnabled(); expect(resume).toHaveAttribute('aria-pressed', 'false');
    expect(model()).toHaveClass('is-still');
    await user.click(resume); expect(model()).toHaveClass('is-moving');
    const subscribed = media.query.addEventListener.mock.calls[0];
    view.unmount();
    expect(media.query.removeEventListener).toHaveBeenCalledExactlyOnceWith('change', subscribed[1]);
    expect(media.listeners.size).toBe(0);
    media.change(true); expect(media.listeners.size).toBe(0);
  });

  it('does not start a microphone, request online help or mutate saved data through discovery controls', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    const user = userEvent.setup(); show(); await completePuzzle(user);
    for (const [name] of FACTS) await user.click(screen.getByRole('button', { name }));
    await user.click(screen.getByRole('button', { name: 'Pause planets' }));
    await user.click(screen.getByRole('button', { name: 'Move planets' }));
    media.change(true); media.change(false);
    expect(network).not.toHaveBeenCalled();
    expect(recognition).not.toHaveBeenCalled(); expect(microphone).not.toHaveBeenCalled();
    expect(saved.setSettings).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled(); expect(removeItem).not.toHaveBeenCalled(); expect(clear).not.toHaveBeenCalled();
  });
  it('opens the full-page reward only after solving, closes with Escape and can reopen it', async()=>{
    const user=userEvent.setup();show();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await completePuzzle(user,false);
    const close=screen.getByRole('button',{name:'Back to puzzle'});
    expect(close).toHaveFocus();expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');
    await user.click(screen.getByRole('button',{name:'See my full-page solar system'}));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Start the jigsaw again'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
  });

});
