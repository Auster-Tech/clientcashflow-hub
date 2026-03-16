
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types';
import { useClients } from '@/hooks/useApi';

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clients: Client[];
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { useGetAll } = useClients();
  const { data: clients = [], isLoading } = useGetAll();

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
