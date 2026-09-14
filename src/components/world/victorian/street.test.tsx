import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VictorianStreet from '../VictorianStreet';

vi.mock('three', () => ({ WebGLRenderer: class { constructor() { throw new Error('WebGL unavailable'); } } }));
vi.mock('./scene', () => ({ buildWorld: vi.fn() }));
afterEach(() => vi.restoreAllMocks());

function renderStreet(route = '/world/victorian') { return render(<MemoryRouter initialEntries={[route]}><VictorianStreet /></MemoryRouter>); }

describe('accessible shop visit when WebGL is unavailable', () => {
  it('keeps all five doors and complete sweet shop journey usable', async () => {
    renderStreet();
    await screen.findByText('Your visit can continue');
    expect(screen.getAllByText('Open the door →')).toHaveLength(5);
    fireEvent.click(screen.getByRole('link', { name: /Sweet Shop/ }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sweet Shop'));
    fireEvent.click(screen.getByRole('button', { name: /Explore the display/ }));
    expect(screen.getByText(/tiny happy wobble|wooden toy dog|Why did the sweet|golden star/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Play Coin Counter/ }).getAttribute('href')).toContain('returnTo=%2Fworld%2Fvictorian%3Fshop%3Dsweet-shop');
    fireEvent.click(screen.getByRole('link', { name: 'Return to street' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Victorian Learning Lane');
  });
  it('filters older activities by the age control', async () => {
    renderStreet('/world/victorian?shop=cake-and-pie&age=5');
    await screen.findByText('Your visit can continue');
    expect(screen.queryByRole('link', { name: /Play Ratio Recipe/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Play Fraction Pizza/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Choose age'), { target: { value: '10' } });
    expect(screen.getByRole('link', { name: /Play Ratio Recipe/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Play Fraction Pizza/ })).toBeTruthy();
  });
  it('honours reduced motion and does not offer an override', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    renderStreet();
    await screen.findByText('Your visit can continue');
    expect(screen.getByRole('button', { name: 'Reduced motion on' }).getAttribute('disabled')).not.toBeNull();
    vi.unstubAllGlobals();
  });
});
