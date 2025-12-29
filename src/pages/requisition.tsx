import { CONFIG } from 'src/config-global';

import { RequisitionView } from 'src/sections/requisition';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Requisiciones - ${CONFIG.appName}`}</title>

      <RequisitionView />
    </>
  );
}
