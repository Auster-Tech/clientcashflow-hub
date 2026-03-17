
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { PartnerForm } from '@/components/forms/PartnerForm';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserRole, Partner, Status } from '@/types';
import { usePartners } from '@/hooks/useApi';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Tag, Upload } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PartnersProps {
  userRole?: UserRole;
}

const Partners = ({ userRole = 'accountant' }: PartnersProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const { useGetAll, useCreate, useUpdate, useDelete } = usePartners();
  const { data: partners = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { toast } = useToast();

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('partners.title')}</h1>
              <p className="text-muted-foreground">{t('partners.subtitle')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('partners.selectClient')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDeletePartner = (partnerId: number) => {
    deleteMutation.mutate(partnerId, {
      onSuccess: () => { toast({ title: t('partners.title'), description: t('common.delete') }); },
    });
  };

  const handleFormSubmit = (partnerData: Omit<Partner, 'id'>) => {
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: partnerData }, {
        onSuccess: () => { toast({ title: t('partners.update'), description: t('common.update') }); setIsFormOpen(false); setEditingPartner(null); },
      });
    } else {
      createMutation.mutate(partnerData, {
        onSuccess: () => { toast({ title: t('partners.create'), description: t('common.create') }); setIsFormOpen(false); setEditingPartner(null); },
      });
    }
  };

  const handleCSVUpload = (csvData: any[]) => {
    csvData.forEach((row) => {
      createMutation.mutate({
        name: row.name || row.Name || '',
        contact_info: row.contact_info || row.email || '',
        status: Status.ACTIVE,
      });
    });
    setIsUploadOpen(false);
    toast({ title: t('partners.title'), description: t('common.upload') });
  };

  const columns: ColumnDef<Partner>[] = [
    { accessorKey: 'name', header: t('partners.name') },
    { accessorKey: 'contact_info', header: 'Contact Info' },
    {
      id: 'actions', header: t('common.actions'),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingPartner(row.original); setIsFormOpen(true); }}>{t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeletePartner(row.original.id)} className="text-red-600">{t('common.delete')}</DropdownMenuItem>
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
            <h1 className="text-3xl font-bold tracking-tight">{t('partners.title')}</h1>
            <p className="text-muted-foreground">{t('partners.subtitle')}{selectedClient && ` ${t('common.client')}: ${selectedClient.name}`}</p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="gap-2"><Upload className="h-4 w-4" />{t('common.upload')}</Button>
              <Button onClick={() => { setEditingPartner(null); setIsFormOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{t('partners.add')}</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard title={t('partners.total')} value={partners.length} icon={Tag} description={t('partners.total')} />
        </div>
        <DataTable columns={columns} data={partners} searchColumn="name" searchPlaceholder={t('common.search')} />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editingPartner ? t('partners.edit') : t('partners.add')}</DialogTitle></DialogHeader>
            <PartnerForm partner={editingPartner} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t('common.upload')}</DialogTitle></DialogHeader>
            <UploadCSV onUpload={handleCSVUpload} onCancel={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Partners;
