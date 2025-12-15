import { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signIn,
  signOut,
} from 'aws-amplify/auth';

import { useRouter } from 'src/routes/hooks';

import AuthService from 'src/services/auth/auth-service';

// ----------------------------------------------------------------------

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const router = useRouter();

  const [user, setUser] = useState<(AuthUser & { attributes?: Record<string, any> }) | null>(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const [loginError, setLoginError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    if (token) {
      const restoreUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          setUser({ ...currentUser, attributes });
        } catch {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      restoreUser();
    } else setIsLoading(false);
  }, [token]);

  const login = async (credentials: any) => {
    setLoginError('');

    try {
      // To singIn to work correctly is necessary to activate USER_SRP_AUTH in AWS Cognito
      await signIn({
        ...credentials,
      });

      let authRes;
      try {
        authRes = await AuthService.getAuth();
        localStorage.setItem('permissions', JSON.stringify(authRes?.data ?? null));
      } catch (err) {
        setLoginError('Algo salió mal. Intente nuevamente');
        await logout();
        return;
      }

      if (!authRes || !authRes.data) {
        setLoginError('Algo salió mal. Intente nuevamente');
        await logout();
        return;
      }

      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({ ...currentUser, attributes });

      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      setToken(idToken ?? null);
      localStorage.setItem('authToken', idToken || '');
      setIsLoggedOut(false);
    } catch (error: any) {
      if (
        error.name === 'NotAuthorizedException' ||
        error.name === 'UserNotFoundException' ||
        error.name === 'ResourceNotFoundException'
      )
        setLoginError('Usuario o contraseña incorrectos');
      else setLoginError('Algo salió mal. Intente nuevamente');
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsLoggedOut(true);
      localStorage.removeItem('authToken');
      localStorage.removeItem('permissions');
      setToken(null);
      setUser(null);
    } catch (error) {
      setLogoutError('Se produjo un error al cerrar sesión. Intente nuevamente.');
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    loginError,
    logoutError,
    isLoading,
    isLoggedOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export async function getFreshIdToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}
