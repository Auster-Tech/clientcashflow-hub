
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClient } from '@/contexts/ClientContext';
import { UserRole } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';

interface ClientSelectorProps {
  userRole: UserRole;
}

export function ClientSelector({ userRole }: ClientSelectorProps) {
  const { selectedClient, setSelectedClient, clients } = useClient();
  const { t } = useTranslation();

  // Only show client selector for accountants
  if (userRole !== 'accountant') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{t('common.client')}:</span>
      <Select
        value={selectedClient?.id || ''}
        onValueChange={(value) => {
          const client = clients.find(c => c.id === value);
          setSelectedClient(client || null);
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder={t('common.selectClient')} />
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
