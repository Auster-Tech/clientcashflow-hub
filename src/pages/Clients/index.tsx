
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Search, Building2, MoreHorizontal, Edit, Trash, Users, ExternalLink } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientResponse, Status } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { useClients } from '@/hooks/useApi';

const Clients = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(null);
  const { toast } = useToast();
  const { useGetAll, useCreate, useDelete } = useClients();
  const { data: clientList = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const deleteMutation = useDelete();

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
              <DropdownMenuItem className="flex items-center cursor-pointer"><Edit className="mr-2 h-4 w-4" />{t('common.edit')}</DropdownMenuItem>
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

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('common.add')} New Client</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="tax-id">Tax ID</Label><Input id="tax-id" placeholder="Enter tax ID" /></div>
              <div className="space-y-2"><Label htmlFor="company-name">Company Name</Label><Input id="company-name" placeholder="Enter company name" /></div>
              <div className="space-y-2"><Label htmlFor="industry">Industry</Label><Input id="industry" placeholder="Enter industry" /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="company@example.com" /></div>
              <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" placeholder="(555) 123-4567" /></div>
              <div className="space-y-2"><Label htmlFor="fiscal-year">Fiscal Year End</Label><Input id="fiscal-year" placeholder="e.g. December" /></div>
              <div className="space-y-2 col-span-2"><Label htmlFor="address">Address</Label><Input id="address" placeholder="Enter company address" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              setIsAddClientOpen(false);
              toast({ title: t('common.add'), description: "Client added successfully." });
            }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
