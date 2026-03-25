
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Search, Building2, MoreHorizontal, Edit, Trash, ExternalLink } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClientResponse, Status } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { useClients } from '@/hooks/useApi';

const emptyClient = { taxId: '', companyName: '', industry: '', email: '', phone: '', address: '', fiscalYearEnd: '' };

const Clients = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(null);
  const [clientToEdit, setClientToEdit] = useState<ClientResponse | null>(null);
  const [newClient, setNewClient] = useState(emptyClient);
  const [editClient, setEditClient] = useState(emptyClient);
  const { toast } = useToast();
  const { useGetAll, useCreate, useUpdate, useDelete } = useClients();
  const { data: clientList = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const handleCreateClient = () => {
    createMutation.mutate({ ...newClient, status: Status.ACTIVE }, {
      onSuccess: () => {
        toast({ title: t('common.add'), description: "Client added successfully." });
        setIsAddClientOpen(false);
        setNewClient(emptyClient);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleEditClient = () => {
    if (!clientToEdit) return;
    updateMutation.mutate({ id: clientToEdit.id, data: { ...editClient, status: clientToEdit.status } }, {
      onSuccess: () => {
        toast({ title: t('common.edit'), description: "Client updated successfully." });
        setIsEditClientOpen(false);
        setClientToEdit(null);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  const openEditDialog = (client: ClientResponse) => {
    setClientToEdit(client);
    setEditClient({
      taxId: client.tax_id || '',
      companyName: client.company_name || '',
      industry: client.industry || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      fiscalYearEnd: client.fiscal_year_end || '',
    });
    setIsEditClientOpen(true);
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete.id, {
        onSuccess: () => {
          toast({ title: t('common.delete'), description: `${clientToDelete?.company_name} has been removed.` });
          setIsDeleteDialogOpen(false);
          setClientToDelete(null);
        },
      });
    }
  };

  const columns = [
    {
      accessorKey: 'company_name',
      header: 'Company',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2"><Building2 className="h-4 w-4 text-primary" /></div>
          <div>
            <div className="font-medium">{row.original.company_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.industry}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Contact',
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.email}</div>
          <div className="text-sm text-muted-foreground">{row.original.phone}</div>
        </div>
      ),
    },
    { accessorKey: 'fiscal_year_end', header: 'Fiscal Year End' },
    {
      accessorKey: 'status',
      header: t('common.status'),
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={status === Status.ACTIVE ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
            {status === Status.ACTIVE ? 'Active' : status === Status.INACTIVE ? 'Inactive' : 'Suspended'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/clients/${row.original.id}`} className="flex items-center cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => openEditDialog(row.original)}>
                <Edit className="mr-2 h-4 w-4" />{t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => { setClientToDelete(row.original); setIsDeleteDialogOpen(true); }}
              >
                <Trash className="mr-2 h-4 w-4" />{t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredClients = clientList.filter((client: any) =>
    (client.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.industry || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clientFormFields = (values: typeof emptyClient, onChange: (v: typeof emptyClient) => void) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Tax ID</Label><Input placeholder="Enter tax ID" value={values.taxId} onChange={(e) => onChange({ ...values, taxId: e.target.value })} /></div>
      <div className="space-y-2"><Label>Company Name</Label><Input placeholder="Enter company name" value={values.companyName} onChange={(e) => onChange({ ...values, companyName: e.target.value })} /></div>
      <div className="space-y-2"><Label>Industry</Label><Input placeholder="Enter industry" value={values.industry} onChange={(e) => onChange({ ...values, industry: e.target.value })} /></div>
      <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="company@example.com" value={values.email} onChange={(e) => onChange({ ...values, email: e.target.value })} /></div>
      <div className="space-y-2"><Label>Phone</Label><Input placeholder="(555) 123-4567" value={values.phone} onChange={(e) => onChange({ ...values, phone: e.target.value })} /></div>
      <div className="space-y-2"><Label>Fiscal Year End</Label><Input placeholder="e.g. December" value={values.fiscalYearEnd} onChange={(e) => onChange({ ...values, fiscalYearEnd: e.target.value })} /></div>
      <div className="space-y-2 col-span-2"><Label>Address</Label><Input placeholder="Enter company address" value={values.address} onChange={(e) => onChange({ ...values, address: e.target.value })} /></div>
    </div>
  );

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('nav.clients')}</h1>
            <p className="text-muted-foreground">Manage your client companies</p>
          </div>
          <Button onClick={() => setIsAddClientOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />{t('common.add')} Client
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t('common.search')} className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <DataTable columns={columns} data={filteredClients} />
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('common.add')} New Client</DialogTitle></DialogHeader>
          <div className="space-y-4">{clientFormFields(newClient, setNewClient)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateClient} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('common.edit')} Client</DialogTitle></DialogHeader>
          <div className="space-y-4">{clientFormFields(editClient, setEditClient)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleEditClient} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{t('common.delete')} Client</DialogTitle></DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <span className="font-semibold">{clientToDelete?.company_name}</span>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteClient}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clients;
