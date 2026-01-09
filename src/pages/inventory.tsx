import { CONFIG } from 'src/config-global';

import { InventoryView } from 'src/sections/inventory';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Inventario - ${CONFIG.appName}`}</title>

      <InventoryView />
    </>
  );
}
