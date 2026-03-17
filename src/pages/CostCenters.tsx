
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { CostCenterForm } from '@/components/forms/CostCenterForm';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserRole, CostCenter } from '@/types';
import { useCostCenters } from '@/hooks/useApi';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Tag } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CostCentersProps {
  userRole?: UserRole;
}

const CostCenters = ({ userRole = 'accountant' }: CostCentersProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const { useGetAll, useCreate, useUpdate, useDelete } = useCostCenters();
  const { data: costCenters = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const { toast } = useToast();

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('costCenters.title')}</h1>
              <p className="text-muted-foreground">{t('costCenters.subtitle')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('costCenters.selectClient')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDeleteCostCenter = (costCenterId: number) => {
    deleteMutation.mutate(costCenterId, {
      onSuccess: () => { toast({ title: t('costCenters.title'), description: t('common.delete') }); },
    });
  };

  const handleFormSubmit = (costCenterData: Omit<CostCenter, 'id'>) => {
    if (editingCostCenter) {
      updateMutation.mutate({ id: editingCostCenter.id, data: costCenterData }, {
        onSuccess: () => { toast({ title: t('costCenters.update'), description: t('common.update') }); setIsFormOpen(false); setEditingCostCenter(null); },
      });
    } else {
      createMutation.mutate(costCenterData, {
        onSuccess: () => { toast({ title: t('costCenters.create'), description: t('common.create') }); setIsFormOpen(false); setEditingCostCenter(null); },
      });
    }
  };

  const columns: ColumnDef<CostCenter>[] = [
    { accessorKey: 'name', header: t('common.name') },
    { accessorKey: 'description', header: t('common.description') },
    {
      id: 'actions', header: t('common.actions'),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingCostCenter(row.original); setIsFormOpen(true); }}>{t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteCostCenter(row.original.id)} className="text-red-600">{t('common.delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('costCenters.title')}</h1>
            <p className="text-muted-foreground">{t('costCenters.subtitle')}{selectedClient && ` ${t('common.client')}: ${selectedClient.name}`}</p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <Button onClick={() => { setEditingCostCenter(null); setIsFormOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{t('costCenters.add')}</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title={t('costCenters.total')} value={costCenters.length} icon={Tag} description={t('costCenters.total')} />
        </div>
        <DataTable columns={columns} data={costCenters} searchColumn="name" searchPlaceholder={t('common.search')} />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingCostCenter ? t('costCenters.edit') : t('costCenters.add')}</DialogTitle></DialogHeader>
            <CostCenterForm costCenter={editingCostCenter} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CostCenters;
