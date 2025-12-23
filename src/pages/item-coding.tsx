import { CONFIG } from 'src/config-global';

import { ItemCodingView } from 'src/sections/item-coding';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Base de datos de productos - ${CONFIG.appName}`}</title>

      <ItemCodingView />
    </>
  );
}
