
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClientResponse } from '@/types';
import { useClients } from '@/hooks/useApi';

interface ClientContextType {
  selectedClient: (ClientResponse & { name: string }) | null;
  setSelectedClient: (client: any) => void;
  clients: (ClientResponse & { name: string })[];
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { useGetAll } = useClients();
  const { data: rawClients = [], isLoading } = useGetAll();

  // Map backend response to include a `name` field for display
  const clients = rawClients.map((c: any) => ({
    ...c,
    name: c.companyName || c.company_name || c.name || '',
  }));

  return (
    <ClientContext.Provider value={{
      selectedClient,
      setSelectedClient,
      clients,
      isLoading
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
