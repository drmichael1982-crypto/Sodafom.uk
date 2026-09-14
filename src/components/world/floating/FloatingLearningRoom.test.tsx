import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import FloatingLearningRoom from '../FloatingLearningRoom';

const { createScene, scenes } = vi.hoisted(() => ({ createScene: vi.fn(), scenes: [] as Array<{ dispose: ReturnType<typeof vi.fn>; setPlaying: ReturnType<typeof vi.fn>; setSpeed: ReturnType<typeof vi.fn>; resetView: ReturnType<typeof vi.fn>; moveView: ReturnType<typeof vi.fn> }> }));
vi.mock('./create-scene', () => ({ createFloatingScene: createScene }));

beforeEach(() => {
  scenes.length = 0; createScene.mockReset();
  createScene.mockImplementation(() => { const scene = { dispose: vi.fn(), setPlaying: vi.fn(), setSpeed: vi.fn(), resetView: vi.fn(), moveView: vi.fn() }; scenes.push(scene); return scene; });
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => vi.unstubAllGlobals());

function mount() { return render(<MemoryRouter initialEntries={['/world/floating']}><Routes><Route path="/world/floating" element={<FloatingLearningRoom />} /><Route path="/games/colour-book" element={<h1>Working colouring route</h1>} /></Routes></MemoryRouter>); }

describe('floating room integration', () => {
  it('cleans up scenes on skin changes and unmount, and starts paused with reduced motion', async () => {
    const view = mount();
    await waitFor(() => expect(createScene).toHaveBeenCalledTimes(1));
    expect(scenes[0].setPlaying).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole('button', { name: 'Play motion' }));
    expect(scenes[0].setPlaying).toHaveBeenLastCalledWith(true);
    const staleAction = createScene.mock.calls[0][2] as (id: string) => void;
    fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'colouring' } });
    await waitFor(() => expect(createScene).toHaveBeenCalledTimes(2));
    expect(scenes[0].dispose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Sun · Solar-system quiz/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Floating book · Start colouring/ })).toBeInTheDocument();
    act(() => staleAction('earth-spin'));
    expect(screen.queryByText(/Its axis stays tilted/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(scenes[1].resetView).toHaveBeenCalledOnce();
    view.unmount(); expect(scenes[1].dispose).toHaveBeenCalledTimes(1);
  });

  it('keeps the colouring action usable after WebGL failure', async () => {
    createScene.mockImplementation(() => { throw new Error('No WebGL'); });
    mount();
    await screen.findByText(/The 3D view is unavailable/);
    expect(screen.getByRole('link', { name: 'Open the animated planet diagram' })).toHaveAttribute('href', '/world/planets');
    fireEvent.change(screen.getByLabelText('Room'), { target: { value: 'colouring' } });
    await screen.findByText(/The 3D view is unavailable/);
    fireEvent.click(screen.getByRole('button', { name: /Floating book · Start colouring/ }));
    expect(screen.getByRole('heading', { name: 'Working colouring route' })).toBeInTheDocument();
  });
});
