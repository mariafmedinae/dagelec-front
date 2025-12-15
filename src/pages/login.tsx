import { CONFIG } from 'src/config-global';

import { LoginView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Inicio de sesión - ${CONFIG.appName}`}</title>
      
      <LoginView />
    </>
  );
}