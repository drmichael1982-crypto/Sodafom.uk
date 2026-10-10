import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { Navigate, matchRoutes } from 'react-router';
import { routes } from './routes';

describe('owner page routing boundary', () => {
  it.each(['/preview-admin', '/admin-panel', '/admin/sodafom-bot'])(
    'sends legacy or preview route %s to the protected owner dashboard',
    path => {
      const element = matchRoutes(routes, path)?.at(-1)?.route.element;
      expect(isValidElement(element)).toBe(true);
      if (!isValidElement(element)) throw new Error('Expected a route element');
      expect(element.type).toBe(Navigate);
      expect(element.props).toMatchObject({ to: '/admin', replace: true });
    },
  );
});
