
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client } from '@/types';

// Mock clients data - in a real app, this would come from an API
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    address: '123 Business St, City, State 12345',
    taxId: 'TAX123456',
    industry: 'Technology',
    status: 'active',
    createdAt: '2024-01-15',
    notes: 'Major technology client'
  },
  {
    id: '2',
    name: 'Global Industries',
    email: 'info@global.com',
    phone: '+1-555-0456',
    address: '456 Industrial Ave, City, State 67890',
    taxId: 'TAX789012',
    industry: 'Manufacturing',
    status: 'active',
    createdAt: '2024-02-01',
    notes: 'Manufacturing company'
  },
  {
    id: '3',
    name: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    phone: '+1-555-0789',
    taxId: 'TAX345678',
    industry: 'Software',
    status: 'active',
    createdAt: '2024-03-10',
    notes: 'Growing startup'
  }
];

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clients: Client[];
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <ClientContext.Provider value={{
      selectedClient,
      setSelectedClient,
      clients: mockClients
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
