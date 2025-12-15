import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

import { StrictMode } from 'react';
import { Amplify } from 'aws-amplify';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';

// ----------------------------------------------------------------------

const baseUrl = import.meta.env.VITE_BASE_URL;

// Auth configuration
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: `${import.meta.env.VITE_USER_POOL_ID}`,
      userPoolClientId: `${import.meta.env.VITE_USER_POOL_CLIENT_ID}`,
    },
  },
});

const router = createBrowserRouter(
  [
    {
      Component: () => (
        <App>
          <Outlet />
        </App>
      ),
      errorElement: <ErrorBoundary />,
      children: routesSection,
    },
  ],
  { basename: `${baseUrl}` }
); // Dynamic url base depending on enviroment

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
