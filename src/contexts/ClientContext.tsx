
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientResponse } from '@/types';
import { useClients } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

interface ClientContextType {
  selectedClient: (ClientResponse & { name: string }) | null;
  setSelectedClient: (client: any) => void;
  clients: (ClientResponse & { name: string })[];
  isLoading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { useGetAll } = useClients();
  const { data: rawClients = [], isLoading } = useGetAll();

  const clients = (rawClients as any[]).map((c: any) => ({
    ...c,
    name: c.companyName || c.company_name || c.name || '',
  }));

  // For client roles, auto-select the client from the JWT payload
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedClient(null);
      return;
    }
    if (user && user.role !== 'accountant' && user.clientId) {
      const matched = clients.find((c) => c.id === user.clientId);
      if (matched) {
        setSelectedClient(matched);
      }
    }
  }, [isAuthenticated, user, clients.length]);

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
