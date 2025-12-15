import { CONFIG } from 'src/config-global';

import { ClientRegistrationView } from 'src/sections/client-registration';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Registro cliente - ${CONFIG.appName}`}</title>

      <ClientRegistrationView />
    </>
  );
}
