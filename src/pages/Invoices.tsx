
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { ClientSelector } from '@/components/ui/ClientSelector';
import { useClient } from '@/contexts/ClientContext';
import { UserRole, Invoice } from '@/types';
import { useInvoices, useImportInvoicesCSV } from '@/hooks/useApi';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, FileText, DollarSign, Clock, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from '@/contexts/TranslationContext';

interface InvoicesProps {
  userRole?: UserRole;
}

const Invoices = ({ userRole = 'accountant' }: InvoicesProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const { useGetAll, useCreate, useUpdate, useDelete } = useInvoices();
  const { data: invoices = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const importCSVMutation = useImportInvoicesCSV();
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

  const handleAddInvoice = () => { setEditingInvoice(null); setIsFormOpen(true); };
  const handleUploadCSV = () => { setIsUploadOpen(true); };
  const handleEditInvoice = (invoice: Invoice) => { setEditingInvoice(invoice); setIsFormOpen(true); };

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteMutation.mutate(invoiceId, {
      onSuccess: () => toast({ title: t('toast.invoiceDeleted'), description: t('toast.invoiceDeletedDesc') }),
    });
  };

  const handleFormSubmit = (invoiceData: Omit<Invoice, 'id'>) => {
    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: invoiceData }, {
        onSuccess: () => {
          toast({ title: t('toast.invoiceUpdated'), description: t('toast.invoiceUpdatedDesc') });
          setIsFormOpen(false);
          setEditingInvoice(null);
        },
      });
    } else {
      createMutation.mutate(invoiceData as any, {
        onSuccess: () => {
          toast({ title: t('toast.invoiceCreated'), description: t('toast.invoiceCreatedDesc') });
          setIsFormOpen(false);
          setEditingInvoice(null);
        },
      });
    }
  };

  const handleCSVUpload = (csvData: any[]) => {
    importCSVMutation.mutate(csvData, {
      onSuccess: () => {
        setIsUploadOpen(false);
        toast({ title: t('toast.invoicesImported'), description: t('toast.invoicesImportedDesc').replace('{count}', csvData.length.toString()) });
      },
    });
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'number', header: t('invoices.number') },
    {
      accessorKey: 'date',
      header: t('invoices.date'),
      cell: ({ row }) => format(new Date(row.getValue('date') as string), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'dueDate',
      header: t('invoices.dueDate'),
      cell: ({ row }) => format(new Date(row.getValue('dueDate') as string), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'amount',
      header: t('invoices.amount'),
      cell: ({ row }) => `$${(row.getValue('amount') as number).toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors = {
          draft: 'bg-gray-100 text-gray-800',
          sent: 'bg-blue-100 text-blue-800',
          paid: 'bg-green-100 text-green-800',
          overdue: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {t(`invoices.${status}`)}
          </span>
        );
      },
    },
    { accessorKey: 'description', header: t('common.description') },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>{t('common.edit')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600">{t('common.delete')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('invoices.title')}</h1>
            <p className="text-muted-foreground">
              {t('invoices.manageClientInvoices')}
              {selectedClient && ` for ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button onClick={handleUploadCSV} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />{t('common.upload')}
              </Button>
              <Button onClick={handleAddInvoice} className="gap-2">
                <Plus className="h-4 w-4" />{t('invoices.add')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard title={t('invoices.total')} value={invoices.length} icon={FileText} description={t('invoices.allInvoices')} />
          <StatsCard title={t('invoices.amount')} value={`$${totalAmount.toLocaleString()}`} icon={DollarSign} description={t('invoices.totalInvoiceValue')} />
          <StatsCard title={t('invoices.paid')} value={paidInvoices.length} icon={FileText} description={t('invoices.successfullyPaid')}
            trend={{ value: `${invoices.length ? Math.round((paidInvoices.length / invoices.length) * 100) : 0}%`, label: t('invoices.ofTotal') }} />
          <StatsCard title={t('invoices.overdue')} value={overdueInvoices.length} icon={Clock} description={t('invoices.needsAttention')}
            trend={{ value: `${invoices.length ? Math.round((overdueInvoices.length / invoices.length) * 100) : 0}%`, label: t('invoices.ofTotal') }} />
        </div>

        <div className="space-y-4">
          <DataTable columns={columns} data={invoices} searchColumn="number" searchPlaceholder={t('invoices.searchInvoices')} />
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? t('invoices.editInvoice') : t('invoices.addNewInvoice')}</DialogTitle>
            </DialogHeader>
            <InvoiceForm invoice={editingInvoice} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('invoices.uploadInvoicesCSV')}</DialogTitle>
            </DialogHeader>
            <UploadCSV onUpload={handleCSVUpload} onCancel={() => setIsUploadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
