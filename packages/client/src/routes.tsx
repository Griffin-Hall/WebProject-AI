import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';

/**
 * Retry a dynamic import up to `retries` times, then force-reload the page.
 * This handles stale chunk hashes after a new deployment.
 */
function lazyRetry<T extends { default: React.ComponentType<unknown> }>(
  factory: () => Promise<T>,
  retries = 2,
): Promise<T> {
  return factory().catch((err: unknown) => {
    if (retries > 0) {
      return new Promise<T>((resolve) => setTimeout(resolve, 500)).then(() =>
        lazyRetry(factory, retries - 1),
      );
    }
    // All retries exhausted — force a full reload to fetch new assets
    window.location.reload();
    throw err;
  });
}

// Lazy-load non-critical pages so the initial bundle stays small
const SearchResultsPage = lazy(() => lazyRetry(() => import('@/pages/SearchResultsPage')));
const DestinationPage = lazy(() => lazyRetry(() => import('@/pages/DestinationPage')));
const DestinationsPage = lazy(() => lazyRetry(() => import('@/pages/DestinationsPage')));
const ComparePage = lazy(() => lazyRetry(() => import('@/pages/ComparePage')));
const NotFoundPage = lazy(() => lazyRetry(() => import('@/pages/NotFoundPage')));

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-aurora-light/30 border-t-aurora-light rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <PageSuspense><SearchResultsPage /></PageSuspense> },
      { path: '/destinations', element: <PageSuspense><DestinationsPage /></PageSuspense> },
      { path: '/destinations/:id', element: <PageSuspense><DestinationPage /></PageSuspense> },
      { path: '/compare', element: <PageSuspense><ComparePage /></PageSuspense> },
      { path: '*', element: <PageSuspense><NotFoundPage /></PageSuspense> },
    ],
  },
], {
  basename: '/WebProject-AI',
});
