import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { canAccessPrivate797, isPrivate797Path } from './access-policy';

describe('private 797 adult/admin boundary', () => {
  it.each(['child', 'parent', 'teacher'])('denies %s roles', (role) => {
    expect(canAccessPrivate797({ isAdmin: false, role })).toBe(false);
    expect(canAccessPrivate797({ isAdmin: true, role })).toBe(false);
  });

  it('denies Archie and unauthenticated principals', () => {
    expect(canAccessPrivate797(undefined)).toBe(false);
    expect(canAccessPrivate797({ role: 'child' })).toBe(false);
  });

  it('requires both admin flag and private 797 role', () => {
    expect(canAccessPrivate797({ isAdmin: false, role: 'kano797-admin' })).toBe(false);
    expect(canAccessPrivate797({ isAdmin: true, role: 'kano797-admin' })).toBe(true);
  });

  it('identifies only the private route family', () => {
    expect(isPrivate797Path('/admin/797')).toBe(true);
    expect(isPrivate797Path('/admin/797/audit')).toBe(true);
    expect(isPrivate797Path('/games')).toBe(false);
    expect(isPrivate797Path('/ai-teacher')).toBe(false);
  });

  it('does not expose a 797 link in the child-facing world', () => {
    const childWorld = readFileSync(resolve(process.cwd(), 'src/pages/SodafomAdventurePage.tsx'), 'utf8');
    expect(childWorld).not.toContain('/admin/797');
    expect(childWorld).not.toContain('kano797-admin');
  });

  it('keeps secrets and Archie integrations out of the private dashboard', () => {
    const dashboard = readFileSync(resolve(process.cwd(), 'src/pages/admin797/AdminBusinessSectionsPage.tsx'), 'utf8');
    expect(dashboard).not.toMatch(/OPENAI_API_KEY|STRIPE_SECRET|AUTH_SECRET/);
    expect(dashboard).not.toMatch(/archie-local|agent-tools|AskArchie/);
  });
});
