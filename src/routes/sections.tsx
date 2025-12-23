import type { RouteObject } from 'react-router';

import { lazy, Suspense, ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { Box } from '@mui/material';

import { usePathname } from 'src/routes/hooks';

import { getMenu } from 'src/utils/permissions-functions';

import { useAuth } from 'src/context/auth';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { SelectedClientProvider } from 'src/context/selected-client';

import { Loading } from 'src/components/loading';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));

export const PersonalRegistration = lazy(() => import('src/pages/personal-registration'));
export const ClientRegistration = lazy(() => import('src/pages/client-registration'));
export const ItemCoding = lazy(() => import('src/pages/item-coding'));

export const LoginPage = lazy(() => import('src/pages/login'));

const renderFallback = () => <Loading />;

const loadingView = (
  <Box
    sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      backgroundImage: `linear-gradient(45deg, #ffffff80, #0c653380)`,
    }}
  >
    <img
      src={import.meta.env.VITE_BASE_URL + 'assets/imgs/dagelec.png'}
      alt="Dagelec Logo"
      style={{ width: '300px' }}
    />
  </Box>
);

const LoginRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return loadingView;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, token, isLoggedOut } = useAuth();
  const pathname = usePathname();
  const permissions = getMenu();
  const postLoginPath = localStorage.getItem('postLoginPath');

  let hasPermission = true;

  if (isLoading || (token && !isAuthenticated)) {
    return loadingView;
  }

  if (pathname !== '/dashboard' && isAuthenticated) {
    hasPermission = Boolean(
      permissions.find((element: any) => `/dashboard/${element.path}` === pathname)
    );
  }

  if (!isAuthenticated) {
    if (
      pathname.startsWith('/dashboard') &&
      pathname !== '/dashboard' &&
      pathname !== '/login' &&
      !isLoggedOut
    )
      localStorage.setItem('postLoginPath', pathname);
    return <Navigate to="/login" state={{ from: pathname }} replace />;
  }

  if (isAuthenticated && postLoginPath) {
    if (pathname === postLoginPath) localStorage.removeItem('postLoginPath');
    return <Navigate to={postLoginPath} replace />;
  }

  return hasPermission ? children : <Navigate to="/dashboard" replace />;
};

const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return loadingView;
  return <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />;
};

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: (
      <LoginRoute>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </LoginRoute>
    ),
  },
  {
    path: 'dashboard',
    element: (
      <PrivateRoute>
        <SelectedClientProvider>
          <DashboardLayout>
            <Suspense fallback={renderFallback()}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </SelectedClientProvider>
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'personal-registration', element: <PersonalRegistration /> },
      { path: 'client-registration', element: <ClientRegistration /> },
      { path: 'item-coding', element: <ItemCoding /> },
    ],
  },
  { path: '*', element: <RootRedirect /> },
];
