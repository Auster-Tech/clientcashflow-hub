
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClient } from '@/contexts/ClientContext';
import { UserRole } from '@/types';

interface ClientSelectorProps {
  userRole: UserRole;
}

export function ClientSelector({ userRole }: ClientSelectorProps) {
  const { selectedClient, setSelectedClient, clients } = useClient();

  // Only show client selector for accountants
  if (userRole !== 'accountant') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Client:</span>
      <Select
        value={selectedClient?.id || ''}
        onValueChange={(value) => {
          const client = clients.find(c => c.id === value);
          setSelectedClient(client || null);
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
