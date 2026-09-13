import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CHARACTER_OUTFIT_STORAGE_KEY, LEGACY_ARCHIE_OUTFIT_STORAGE_KEY } from '@/lib/character-outfits';
import ArchieOutfitPage from '../ArchieOutfitPage';

function renderPage() {
  return render(<HelmetProvider><MemoryRouter><ArchieOutfitPage /></MemoryRouter></HelmetProvider>);
}

describe('ArchieOutfitPage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('keeps a legacy Archie look while adding character choices', () => {
    localStorage.setItem(LEGACY_ARCHIE_OUTFIT_STORAGE_KEY, JSON.stringify({
      colour: '#16a34a',
      badge: '📚',
      accessory: '🎧',
    }));

    renderPage();

    expect(screen.getByRole('heading', { name: 'Characters & Outfits' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hero Green' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Choose badge 📚' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Choose accessory 🎧' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Annual Sign-up Outfit/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Birthday Outfit/i })).toBeDisabled();
  });

  it('saves the selected character and look under the v2 key only after save', () => {
    localStorage.setItem(LEGACY_ARCHIE_OUTFIT_STORAGE_KEY, JSON.stringify({ colour: '#16a34a', badge: '📚', accessory: '🎧' }));
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Bella' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rainbow Purple' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose badge ⭐' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose accessory 👑' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save my choice' }));

    expect(JSON.parse(localStorage.getItem(CHARACTER_OUTFIT_STORAGE_KEY) ?? '{}')).toMatchObject({
      characterId: 'bella',
      colour: '#9333ea',
      badge: '⭐',
      accessory: '👑',
    });
    expect(localStorage.getItem(LEGACY_ARCHIE_OUTFIT_STORAGE_KEY)).not.toBeNull();
    expect(screen.getByText('Bella and your outfit are saved on this device.')).toBeInTheDocument();
  });
});
