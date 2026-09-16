import type { ImgHTMLAttributes, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import HomeworkHelperPage from '@/pages/HomeworkHelperPage';
import ScannerWorkspace from '@/components/scanners/ScannerWorkspace';

// Keep the real homework/scanner UI; replace unrelated page chrome and device speech.
vi.mock('@/components/FeaturePageShell', () => ({ default: ({ title, children }: { title: string; children: ReactNode }) => <main><h1>{title}</h1>{children}</main> }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
  motion: { img: ({ src, alt, className, onError }: ImgHTMLAttributes<HTMLImageElement>) => <img src={src} alt={alt} className={className} onError={onError} /> },
}));
vi.mock('@/components/scanners/useScannerSpeech', () => ({ useScannerSpeech: () => ({
  speak: vi.fn(), stopSpeech: vi.fn(), listen: vi.fn(), stopListening: vi.fn(),
  speaking: false, listening: false, offset: null, message: '',
}) }));

afterEach(() => vi.unstubAllGlobals());

it('allows a typed answer on the Homework Helper page while photo actions stay gated by a photo', async () => {
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('No network is allowed'); }));
  render(<HomeworkHelperPage />);
  expect(screen.getByRole('heading', { name: 'Homework Helper', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open camera' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Guide me step by step' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Your homework question' }), { target: { value: 'Please explain 7 × 8 with a simple example.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask Archie' }));
  expect(await screen.findByText(/7 × 8 = 56\./)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guide me step by step' })).toBeDisabled();
  expect(fetch).not.toHaveBeenCalled();
});

it('keeps photo validation errors visible and typed help usable', async () => {
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('No network is allowed'); }));
  render(<HomeworkHelperPage />);
  fireEvent.change(screen.getByLabelText('Upload a scanner photo'), { target: { files: [new File(['test'], 'homework.pdf', { type: 'application/pdf' })] } });
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose a JPG, PNG or WebP photograph.');
  fireEvent.change(screen.getByRole('textbox', { name: 'Your homework question' }), { target: { value: '7 × 8' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask Archie' }));
  expect(await screen.findByText(/7 × 8 = 56\./)).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose a JPG, PNG or WebP photograph.');
  expect(fetch).not.toHaveBeenCalled();
});

it('leaves the reading scanner without a homework panel', () => {
  render(<ScannerWorkspace mode="reading" />);
  expect(screen.getByRole('heading', { name: 'Scan Reading Book', level: 1 })).toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Your homework question' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Scan the page text' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Help with my question' })).toBeDisabled();
});
