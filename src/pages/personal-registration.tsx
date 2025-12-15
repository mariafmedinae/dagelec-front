import { CONFIG } from 'src/config-global';

import { PersonalRegistrationView } from 'src/sections/personal-registration';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Registro personal - ${CONFIG.appName}`}</title>

      <PersonalRegistrationView />
    </>
  );
}
