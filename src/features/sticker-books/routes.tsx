import { lazy, Suspense } from 'react';
import { Link, type RouteObject } from 'react-router';
import { routes as existingRoutes } from '../../routes';
import './stickers.css';

const StickerBooksPage = lazy(() => import('../../pages/StickerBooksPage'));
// Keep the original Rewards element and every existing route intact. The existing
// home-screen Sticker Book hotspot already opens /rewards; this adds its doorway.
export const routes: RouteObject[] = [
  ...existingRoutes.map(route => route.path === '/rewards' ? {
    ...route,
    element: <>
      <section className="sb-entry" aria-label="Archie's sticker books">
        <div><strong>Archie's Sticker Books</strong><p>Make and save a page with Archie and friends.</p></div>
        <Link to="/sticker-books">Open sticker books</Link>
      </section>
      {route.element}
    </>,
  } : route),
  {
    path: '/sticker-books',
    element: <Suspense fallback={<p role="status">Opening your sticker book…</p>}><StickerBooksPage /></Suspense>,
  },
];
