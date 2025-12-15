import { createContext, useContext, useState } from 'react';

// ----------------------------------------------------------------------

const SelectedClientContext = createContext<any>(null);

export function SelectedClientProvider({ children }: { children: React.ReactNode }) {
  const [selectedClient, setSelectedClient] = useState('');

  return (
    <SelectedClientContext.Provider value={{ selectedClient, setSelectedClient }}>
      {children}
    </SelectedClientContext.Provider>
  );
}

export function useSelectedClient() {
  return useContext(SelectedClientContext);
}
