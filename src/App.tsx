import { lazy, Suspense } from 'react';
import { Outlet, createBrowserRouter, createHashRouter, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import AiroErrorBoundary from '../export-plugins/AiroErrorBoundary';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import OrfordTownPreviewPage from './pages/OrfordTownPreviewPage';
import { routes } from './routes';
const CookieBanner = lazy(() => import('@/components/CookieBanner').catch(error => {
  console.warn('Failed to load CookieBanner:', error);
  return {
    default: () => null
  };
}));
const SpinnerFallback = () => <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>;
const rootElement = <Suspense fallback={<SpinnerFallback />}>
    <AiroErrorBoundary captureGlobalErrors={true}>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </AiroErrorBoundary>
  </Suspense>;

// Wrap the agent-editable flat `routes` array in a layout route so ScrollRestoration
// + shared chrome live once above every page. Keeping the wrap here (instead of
// in routes.tsx) preserves the agent's simple flat-route contract. The dev
// boundary must live inside the route element so React Router doesn't replace it
// with its default route error UI before our boundary can catch render errors.
const routeTree: RouteObject[] = [{
  element: rootElement,
  children: routes
}];
const isCapacitorApp = typeof window !== 'undefined' && !!(window as any).Capacitor;
// A packaged Capacitor app serves static files from its WebView. Hash routing keeps
// navigation entirely inside index.html and avoids native/static-server path mismatches.
const router = isCapacitorApp ? createHashRouter(routeTree) : createBrowserRouter(routeTree);

export default function App() {
  console.log('App rendering');

  // Michael's 16 Sep phone-review branch opens on the connected Orford-style
  // town prototype first. Existing app routes remain intact and are reached by
  // adding ?classic=1. This is intentionally branch-scoped and must not be
  // treated as permission to change production routing.
  const townPreviewEnabled = typeof window !== 'undefined' && !new URLSearchParams(window.location.search).has('classic');

  if (townPreviewEnabled) {
    return <>
      <Suspense fallback={<SpinnerFallback />}>
        <AiroErrorBoundary captureGlobalErrors={true}>
          <OrfordTownPreviewPage />
        </AiroErrorBoundary>
      </Suspense>
      <CookieBannerErrorBoundary>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </CookieBannerErrorBoundary>
    </>;
  }

  return <>
      <RouterProvider router={router} />
      {/*
        CookieBanner reads document.cookie and subscribes to browser events.
        App.tsx is client-only (entry-server.tsx renders the route tree
        directly without importing App), so no SSR gate is needed here.
       */}
      <CookieBannerErrorBoundary>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </CookieBannerErrorBoundary>
    </>;
}
