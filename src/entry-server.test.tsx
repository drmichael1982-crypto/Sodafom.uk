import { describe, expect, it } from 'vitest';

import { render } from './entry-server';

describe('SSR route redirects', () => {
  it.each([
    ['/pocket-money', '/chores'],
    ['/pocket-money/setup', '/parent-dashboard/chores'],
    ['/admin/sodafom-bot', '/admin-panel?tab=bot'],
    ['/sodafom-bot', '/ask-archie'],
    ['/classic-home', '/'],
    ['/games/game-pattern-maker', '/games/pattern-maker'],
    ['/reading', '/subjects/reading'],
    ['/design-archie-outfit', '/archie-outfit'],
    ['/birthday-party', '/birthday'],
  ])('returns an HTTP redirect for %s', async (source, destination) => {
    const result = await render(source);

    expect(result.status).toBe(302);
    expect(result.redirect).toBe(destination);
    expect(result.html).toBe('');
  });

  it('renders the games library at /games instead of sending children home', async () => {
    const result = await render('/games');

    expect(result.status).toBe(200);
    expect(result.redirect).toBeUndefined();
    expect(result.html).toContain('Games &amp; Activities');
  });

  it('renders the child-friendly recovery page for an unknown route', async () => {
    const result = await render('/definitely-not-a-real-route');

    expect(result.status).toBe(200);
    expect(result.redirect).toBeUndefined();
    expect(result.html).toContain('Oops! Page not found');
  });
});
