
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Building2, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Users, 
  ExternalLink 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientCompany } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Mock data for clients
const mockClients: ClientCompany[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'info@acme.com',
    phone: '(555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    accountantId: '1',
    fiscalYear: 'January-December',
    industry: 'Technology',
  },
  {
    id: '2',
    name: 'Globex Industries',
    email: 'contact@globex.com',
    phone: '(555) 987-6543',
    address: '456 Park Ave, San Francisco, CA 94107',
    accountantId: '1',
    fiscalYear: 'July-June',
    industry: 'Manufacturing',
  },
  {
    id: '3',
    name: 'Stark Enterprises',
    email: 'hello@stark.com',
    phone: '(555) 321-7890',
    address: '789 Tower Rd, Chicago, IL 60601',
    accountantId: '1',
    fiscalYear: 'January-December',
    industry: 'Energy',
  },
  {
    id: '4',
    name: 'Wayne Industries',
    email: 'contact@wayne.com',
    phone: '(555) 456-7890',
    address: '1007 Mountain Dr, Gotham City, NJ 08701',
    accountantId: '1',
    fiscalYear: 'April-March',
    industry: 'Aerospace',
  },
  {
    id: '5',
    name: 'Oscorp',
    email: 'info@oscorp.com',
    phone: '(555) 789-0123',
    address: '5th Ave, New York, NY 10003',
    accountantId: '1',
    fiscalYear: 'January-December',
    industry: 'Biotech',
  },
];

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientCompany | null>(null);
  const { toast } = useToast();

  const handleDeleteClient = () => {
    // In a real app, this would call an API to delete the client
    toast({
      title: "Client deleted",
      description: `${clientToDelete?.name} has been removed from your clients.`,
    });
    setIsDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Company',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
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
    {
      accessorKey: 'fiscalYear',
      header: 'Fiscal Year',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: () => (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          Active
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/clients/${row.original.id}`} className="flex items-center cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  setClientToDelete(row.original);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Filter clients based on search query
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client companies and their users
            </p>
          </div>
          <Button onClick={() => setIsAddClientOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredClients} 
        />
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Company Details</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" placeholder="Enter industry" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="company@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter company address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal-year">Fiscal Year</Label>
                  <Input id="fiscal-year" placeholder="e.g. January-December" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin User Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@company.com" />
                <p className="text-xs text-muted-foreground mt-1">
                  This user will receive an invitation to set up their account and will have admin privileges.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsAddClientOpen(false);
              toast({
                title: "Client added",
                description: "The new client has been added successfully.",
              });
            }}>
              Save Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <span className="font-semibold">{clientToDelete?.name}</span>?
              This action cannot be undone and all associated data will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clients;
