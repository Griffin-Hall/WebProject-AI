import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/search',
        lazy: async () => {
          const { SearchResultsPage } = await import('@/pages/SearchResultsPage');
          return { Component: SearchResultsPage };
        },
      },
      {
        path: '/destinations',
        lazy: async () => {
          const { DestinationsPage } = await import('@/pages/DestinationsPage');
          return { Component: DestinationsPage };
        },
      },
      {
        path: '/destinations/:id',
        lazy: async () => {
          const { DestinationPage } = await import('@/pages/DestinationPage');
          return { Component: DestinationPage };
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/NotFoundPage');
          return { Component: NotFoundPage };
        },
      },
    ],
  },
], {
  basename: '/WebProject-AI',
});
