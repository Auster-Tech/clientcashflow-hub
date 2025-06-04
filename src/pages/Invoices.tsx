
import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Upload, FileText, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { UploadCSV } from '@/components/ui/UploadCSV';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { Invoice, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface InvoicesProps {
  userRole: UserRole;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-001',
    date: '2024-06-01',
    dueDate: '2024-06-30',
    amount: 1500.00,
    status: 'paid',
    partnerId: '1',
    description: 'Consulting services',
    notes: 'Payment received on time',
  },
  {
    id: '2',
    number: 'INV-002',
    date: '2024-06-02',
    dueDate: '2024-07-02',
    amount: 2750.50,
    status: 'sent',
    partnerId: '2',
    description: 'Software development',
  },
  {
    id: '3',
    number: 'INV-003',
    date: '2024-05-15',
    dueDate: '2024-06-15',
    amount: 890.00,
    status: 'overdue',
    partnerId: '3',
    description: 'Design services',
    notes: 'Follow up required',
  },
  {
    id: '4',
    number: 'INV-004',
    date: '2024-06-03',
    dueDate: '2024-07-03',
    amount: 3200.00,
    status: 'draft',
    partnerId: '1',
    description: 'Monthly retainer',
  },
];

const mockPartners = [
  { id: '1', name: 'ABC Corp' },
  { id: '2', name: 'XYZ Ltd' },
  { id: '3', name: 'Tech Solutions Inc' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    case 'draft':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getPartnerName = (partnerId: string) => {
  const partner = mockPartners.find(p => p.id === partnerId);
  return partner?.name || 'Unknown Partner';
};

export default function Invoices({ userRole }: InvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'number',
      header: 'Invoice Number',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.getValue('dueDate') as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'partnerId',
      header: 'Partner',
      cell: ({ row }) => {
        const partnerId = row.getValue('partnerId') as string;
        return getPartnerName(partnerId);
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        return `$${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={getStatusVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
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
              <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(invoice.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreate = () => {
    setEditingInvoice(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted.",
    });
  };

  const handleSubmit = (invoiceData: Omit<Invoice, 'id'>) => {
    if (editingInvoice) {
      setInvoices(invoices.map(invoice => 
        invoice.id === editingInvoice.id 
          ? { ...invoiceData, id: editingInvoice.id }
          : invoice
      ));
      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated.",
      });
    } else {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: (invoices.length + 1).toString(),
      };
      setInvoices([...invoices, newInvoice]);
      toast({
        title: "Invoice created",
        description: "The invoice has been successfully created.",
      });
    }
    setIsDialogOpen(false);
    setEditingInvoice(null);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingInvoice(null);
  };

  const handleUpload = (data: any[]) => {
    const newInvoices: Invoice[] = data.map((row, index) => ({
      id: (invoices.length + index + 1).toString(),
      number: row['Invoice Number'] || row['number'] || `INV-${Date.now()}-${index}`,
      date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
      dueDate: row['Due Date'] || row['dueDate'] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: parseFloat(row['Amount'] || row['amount'] || '0'),
      status: (row['Status'] || row['status'] || 'draft') as Invoice['status'],
      partnerId: row['Partner ID'] || row['partnerId'] || '1',
      description: row['Description'] || row['description'] || '',
      notes: row['Notes'] || row['notes'] || '',
    }));

    setInvoices([...invoices, ...newInvoices]);
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Invoices imported",
      description: `${newInvoices.length} invoices have been successfully imported.`,
    });
  };

  // Calculate stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">
              Manage your invoices and billing information.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Invoice
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Invoices"
            value={totalInvoices}
            icon={FileText}
            description="All invoices in system"
          />
          <StatsCard
            title="Total Amount"
            value={`$${totalAmount.toFixed(2)}`}
            icon={DollarSign}
            description="Sum of all invoices"
          />
          <StatsCard
            title="Paid Invoices"
            value={paidInvoices}
            icon={CheckCircle}
            description="Successfully paid"
          />
          <StatsCard
            title="Overdue"
            value={overdueInvoices}
            icon={AlertTriangle}
            description="Past due date"
          />
        </div>

        <DataTable 
          columns={columns} 
          data={invoices}
          searchColumn="number"
          searchPlaceholder="Search invoices..."
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </DialogTitle>
            </DialogHeader>
            <InvoiceForm
              invoice={editingInvoice}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Invoices from CSV</DialogTitle>
            </DialogHeader>
            <UploadCSV
              onUpload={handleUpload}
              onCancel={() => setIsUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
