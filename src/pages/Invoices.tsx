
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { UserRole, Invoice, Status } from '@/types';
import { useInvoices } from '@/hooks/useApi';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, FileText, DollarSign, Clock, Upload } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/TranslationContext';

interface InvoicesProps {
  userRole?: UserRole;
}

const Invoices = ({ userRole = 'accountant' }: InvoicesProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const clientId = selectedClient?.id ?? 0;
  const { useGetAll, useCreate, useUpdate, useDelete } = useInvoices();
  const { data: invoices = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('invoices.title')}</h1>
              <p className="text-muted-foreground">{t('invoices.manageClientInvoices')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('invoices.selectClient')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDeleteInvoice = (invoiceId: number) => {
    deleteMutation.mutate(invoiceId, {
      onSuccess: () => toast({ title: t('toast.invoiceDeleted'), description: t('toast.invoiceDeletedDesc') }),
    });
  };

  const handleFormSubmit = (invoiceData: Omit<Invoice, 'id'>) => {
    const payload = { ...invoiceData, client_id: clientId };
    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: payload }, {
        onSuccess: () => { toast({ title: t('toast.invoiceUpdated') }); setIsFormOpen(false); setEditingInvoice(null); },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast({ title: t('toast.invoiceCreated') }); setIsFormOpen(false); setEditingInvoice(null); },
      });
    }
  };

  const handleCSVUpload = (csvData: any[]) => {
    csvData.forEach((row) => {
      createMutation.mutate({
        invoice_number: row.invoice_number || row.number || '',
        issue_date: row.issue_date || row.date || '',
        due_date: row.due_date || row.dueDate || '',
        amount: parseFloat(row.amount) || 0,
        status: Status.ACTIVE,
      });
    });
    setIsUploadOpen(false);
    toast({ title: t('toast.invoicesImported') });
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoice_number', header: t('invoices.number') },
    {
      accessorKey: 'issue_date', header: t('invoices.date'),
      cell: ({ row }) => {
        try { return format(new Date(row.original.issue_date), 'MMM dd, yyyy'); }
        catch { return row.original.issue_date; }
      },
    },
    {
      accessorKey: 'due_date', header: t('invoices.dueDate'),
      cell: ({ row }) => {
        try { return format(new Date(row.original.due_date), 'MMM dd, yyyy'); }
        catch { return row.original.due_date; }
      },
    },
    {
      accessorKey: 'amount', header: t('invoices.amount'),
      cell: ({ row }) => `$${Number(row.original.amount).toLocaleString()}`,
    },
    {
      id: 'actions', header: t('common.actions'),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingInvoice(row.original); setIsFormOpen(true); }}>{t('common.edit')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteInvoice(row.original.id)} className="text-red-600">{t('common.delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalAmount = invoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('invoices.title')}</h1>
            <p className="text-muted-foreground">{t('invoices.manageClientInvoices')}{selectedClient && ` for ${selectedClient.name}`}</p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button onClick={() => setIsUploadOpen(true)} variant="outline" className="gap-2"><Upload className="h-4 w-4" />{t('common.upload')}</Button>
              <Button onClick={() => { setEditingInvoice(null); setIsFormOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />{t('invoices.add')}</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title={t('invoices.total')} value={invoices.length} icon={FileText} description={t('invoices.allInvoices')} />
          <StatsCard title={t('invoices.amount')} value={`$${totalAmount.toLocaleString()}`} icon={DollarSign} description={t('invoices.totalInvoiceValue')} />
        </div>
        <DataTable columns={columns} data={invoices} searchColumn="invoice_number" searchPlaceholder={t('invoices.searchInvoices')} />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editingInvoice ? t('invoices.editInvoice') : t('invoices.addNewInvoice')}</DialogTitle></DialogHeader>
            <InvoiceForm invoice={editingInvoice} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t('invoices.uploadInvoicesCSV')}</DialogTitle></DialogHeader>
            <UploadCSV onUpload={handleCSVUpload} onCancel={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
