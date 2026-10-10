import { describe, expect, it } from 'vitest';
import { navLinks } from './Header';
import { footerLinks } from './Footer';

describe('shared learning navigation', () => {
  it('opens the games catalogue from the header and footer', () => {
    expect(navLinks.find(link => link.label === 'Games')?.href).toBe('/games');
    expect(footerLinks.Learn.find(link => link.label === 'All Games')?.href).toBe('/games');
  });
});
