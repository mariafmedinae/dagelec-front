import { CONFIG } from 'src/config-global';

import { ItemCodingView } from 'src/sections/item-coding';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Codificación productos y servicios - ${CONFIG.appName}`}</title>

      <ItemCodingView />
    </>
  );
}
