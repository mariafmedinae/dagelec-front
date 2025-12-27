import { CONFIG } from 'src/config-global';

import { VendorRegistrationView } from 'src/sections/vendor-registration';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Registro proveedores - ${CONFIG.appName}`}</title>

      <VendorRegistrationView />
    </>
  );
}
