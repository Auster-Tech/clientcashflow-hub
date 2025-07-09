
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

// Mock data for invoices
const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 5000,
    status: 'sent',
    partnerId: '1',
    description: 'Monthly consulting services',
    notes: 'Net 30 payment terms'
  },
  {
    id: '2',
    number: 'INV-2024-002',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    amount: 2500,
    status: 'paid',
    partnerId: '2',
    description: 'Software development project',
    notes: 'Paid via bank transfer'
  },
  {
    id: '3',
    number: 'INV-2024-003',
    date: '2024-02-01',
    dueDate: '2024-03-01',
    amount: 7500,
    status: 'draft',
    partnerId: '1',
    description: 'Web application development'
  },
  {
    id: '4',
    number: 'INV-2024-004',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    amount: 3000,
    status: 'overdue',
    partnerId: '3',
    description: 'Marketing campaign design',
    notes: 'Follow up required'
  }
];

const Invoices = ({ userRole = 'accountant' }: InvoicesProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  // Show message for accountants who haven't selected a client
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('invoices.title')}</h1>
              <p className="text-muted-foreground">
                {t('invoices.manageClientInvoices')}
              </p>
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

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleUploadCSV = () => {
    setIsUploadOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
    toast({
      title: t('toast.invoiceDeleted'),
      description: t('toast.invoiceDeletedDesc'),
    });
  };

  const handleFormSubmit = (invoiceData: Omit<Invoice, 'id'>) => {
    if (editingInvoice) {
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === editingInvoice.id 
            ? { ...editingInvoice, ...invoiceData }
            : invoice
        )
      );
      toast({
        title: t('toast.invoiceUpdated'),
        description: t('toast.invoiceUpdatedDesc'),
      });
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        ...invoiceData
      };
      setInvoices(prev => [...prev, newInvoice]);
      toast({
        title: t('toast.invoiceCreated'),
        description: t('toast.invoiceCreatedDesc'),
      });
    }
    setIsFormOpen(false);
    setEditingInvoice(null);
  };

  const handleCSVUpload = (csvData: any[]) => {
    const newInvoices: Invoice[] = csvData.map((row, index) => ({
      id: `csv-${Date.now()}-${index}`,
      number: row.number || row.Number || `INV-${Date.now()}-${index}`,
      date: row.date || row.Date || new Date().toISOString().split('T')[0],
      dueDate: row.dueDate || row.DueDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(row.amount || row.Amount || '0'),
      status: (row.status || row.Status || 'draft').toLowerCase() as Invoice['status'],
      partnerId: row.partnerId || row.PartnerId || '1',
      description: row.description || row.Description || '',
      notes: row.notes || row.Notes || ''
    })).filter(invoice => invoice.number);

    setInvoices(prev => [...prev, ...newInvoices]);
    setIsUploadOpen(false);
    
    toast({
      title: t('toast.invoicesImported'),
      description: t('toast.invoicesImportedDesc').replace('{count}', newInvoices.length.toString()),
    });
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'number',
      header: t('invoices.number'),
    },
    {
      accessorKey: 'date',
      header: t('invoices.date'),
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return format(new Date(date), 'MMM dd, yyyy');
      },
    },
    {
      accessorKey: 'dueDate',
      header: t('invoices.dueDate'),
      cell: ({ row }) => {
        const date = row.getValue('dueDate') as string;
        return format(new Date(date), 'MMM dd, yyyy');
      },
    },
    {
      accessorKey: 'amount',
      header: t('invoices.amount'),
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        return `$${amount.toLocaleString()}`;
      },
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
    {
      accessorKey: 'description',
      header: t('common.description'),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteInvoice(invoice.id)}
                className="text-red-600"
              >
                {t('common.delete')}
              </DropdownMenuItem>
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
        {/* Header */}
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
                <Upload className="h-4 w-4" />
                {t('common.upload')}
              </Button>
              <Button onClick={handleAddInvoice} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('invoices.add')}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title={t('invoices.total')}
            value={invoices.length}
            icon={FileText}
            description={t('invoices.allInvoices')}
          />
          <StatsCard
            title={t('invoices.amount')}
            value={`$${totalAmount.toLocaleString()}`}
            icon={DollarSign}
            description={t('invoices.totalInvoiceValue')}
          />
          <StatsCard
            title={t('invoices.paid')}
            value={paidInvoices.length}
            icon={FileText}
            description={t('invoices.successfullyPaid')}
            trend={{
              value: `${Math.round((paidInvoices.length / invoices.length) * 100)}%`,
              label: t('invoices.ofTotal')
            }}
          />
          <StatsCard
            title={t('invoices.overdue')}
            value={overdueInvoices.length}
            icon={Clock}
            description={t('invoices.needsAttention')}
            trend={{
              value: `${Math.round((overdueInvoices.length / invoices.length) * 100)}%`,
              label: t('invoices.ofTotal')
            }}
          />
        </div>

        {/* Invoices Table */}
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={invoices}
            searchColumn="number"
            searchPlaceholder={t('invoices.searchInvoices')}
          />
        </div>

        {/* Invoice Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? t('invoices.editInvoice') : t('invoices.addNewInvoice')}
              </DialogTitle>
            </DialogHeader>
            <InvoiceForm
              invoice={editingInvoice}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* CSV Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('invoices.uploadInvoicesCSV')}</DialogTitle>
            </DialogHeader>
            <UploadCSV
              onUpload={handleCSVUpload}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
