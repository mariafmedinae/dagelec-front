import { CONFIG } from 'src/config-global';

import { IngredientCodingView } from 'src/sections/ingredient-coding';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Base de datos de productos - ${CONFIG.appName}`}</title>

      <IngredientCodingView />
    </>
  );
}
