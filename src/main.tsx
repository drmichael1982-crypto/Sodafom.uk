import './lib/i18n';
import { showCriticalError } from './lib/critical-error-display';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

if (typeof window !== 'undefined') {
  (window as any)._APP_START_TIME = Date.now();
  console.log('Main.tsx loaded');

  window.onerror = function(msg, url, line, col, error) {
    console.error('CRITICAL ERROR:', msg, url, line, col, error);
    showCriticalError(document, () => window.location.reload(), {
      message: msg, url, line, column: col, error,
    });
  };
}
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AiroErrorBoundary from '../export-plugins/AiroErrorBoundary';
import App from './App';
import './styles/globals.css';

if (import.meta.env.MODE === 'development') {
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow';
  document.head.appendChild(meta);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Root element not found');

const providers = (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </HelmetProvider>
);

// Root-level dev error boundary. The inner boundary in App.tsx lives
// inside the route element (so it can catch route render errors before
// React Router swaps in its own error UI), which leaves everything
// OUTSIDE the router uncaught: provider crashes, errors in App itself,
// and render errors in components mounted as siblings of <RouterProvider>
// (e.g. an analytics loader calling useLocation() outside the router).
// Those throw on first render before the inner boundary ever mounts, so
// only an ancestor boundary above the providers can catch them. This
// boundary also owns the global window.onerror/unhandledrejection
// handlers (the inner one opts out via captureGlobalErrors={false}).
const tree = (
  <StrictMode>
    {import.meta.env.MODE === 'development' ? (
      <AiroErrorBoundary>{providers}</AiroErrorBoundary>
    ) : (
      providers
    )}
  </StrictMode>
);

// Use createRoot always, as index.html content is a static placeholder, not SSR.
createRoot(rootElement).render(tree);
