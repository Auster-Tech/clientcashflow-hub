
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyUser, Status } from '@/types';
import { Building2, Users, Mail, Phone, MapPin, Edit, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/contexts/TranslationContext';
import { useClients, useClientUsers } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const ClientDetails = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const clientId = parseInt(id || '0', 10);

  // Edit client state
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editClient, setEditClient] = useState({ taxId: '', companyName: '', industry: '', email: '', phone: '', address: '', fiscalYearEnd: '' });

  // Add user state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', is_admin: false });

  const { useGetById, useUpdate } = useClients();
  const { data: client, isLoading: clientLoading } = useGetById(clientId);
  const updateClientMutation = useUpdate();

  const { useGetAll: useGetUsers, useCreate: useCreateUser } = useClientUsers(clientId);
  const { data: users = [], isLoading: usersLoading } = useGetUsers();
  const createUserMutation = useCreateUser();

  // Edit user state
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<{ index: number; name: string; email: string; is_admin: boolean } | null>(null);

  const openEditClient = () => {
    if (!client) return;
    setEditClient({
      taxId: (client as any).taxId || client.tax_id || '',
      companyName: (client as any).companyName || client.company_name || '',
      industry: client.industry || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      fiscalYearEnd: (client as any).fiscalYearEnd || client.fiscal_year_end || '',
    });
    setIsEditClientOpen(true);
  };

  const handleUpdateClient = () => {
    updateClientMutation.mutate({ id: clientId, data: { ...editClient, status: client?.status ?? Status.ACTIVE } }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Client updated successfully." });
        setIsEditClientOpen(false);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleAddUser = () => {
    createUserMutation.mutate({ name: newUser.name, email: newUser.email, isAdmin: newUser.is_admin, status: Status.ACTIVE }, {
      onSuccess: () => {
        toast({ title: "Success", description: "User added successfully." });
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', is_admin: false });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  if (clientLoading) {
    return (
      <DashboardLayout userRole="accountant">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{(client as any)?.companyName || client?.company_name || 'Client'}</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="gap-2" onClick={openEditClient}><Edit className="h-4 w-4" />{t('clients.editClient')}</Button>
            <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />{t('clientDetails.companyInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t('clients.industry')}</p>
                      <p className="font-medium">{client?.industry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{t('clients.fiscalYear')}</p>
                      <p className="font-medium">{client?.fiscal_year_end}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tax ID</p>
                      <p className="font-medium">{client?.tax_id}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{client?.email}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{client?.phone}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-sm text-muted-foreground">{t('clients.address')}</p><p className="font-medium">{client?.address}</p></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{t('clientDetails.clientUsers')}</CardTitle>
                  <CardDescription>{t('clientDetails.usersAssociated')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users.map((user: CompanyUser, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge>{user.is_admin ? 'Admin' : 'User'}</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2" onClick={() => setIsAddUserOpen(true)}><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('clientDetails.clientUsers')}</CardTitle>
                  <CardDescription>{t('clientDetails.manageUsers')}</CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: CompanyUser, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={user.is_admin ? 'default' : 'outline'}>{user.is_admin ? 'Admin' : 'User'}</Badge>
                        <Button variant="outline" size="sm">{t('accounts.manage')}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('common.edit')} Client</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Tax ID</Label><Input value={editClient.taxId} onChange={(e) => setEditClient(p => ({ ...p, taxId: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Company Name</Label><Input value={editClient.companyName} onChange={(e) => setEditClient(p => ({ ...p, companyName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Industry</Label><Input value={editClient.industry} onChange={(e) => setEditClient(p => ({ ...p, industry: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={editClient.email} onChange={(e) => setEditClient(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={editClient.phone} onChange={(e) => setEditClient(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Fiscal Year End</Label><Input value={editClient.fiscalYearEnd} onChange={(e) => setEditClient(p => ({ ...p, fiscalYearEnd: e.target.value }))} /></div>
            <div className="space-y-2 col-span-2"><Label>Address</Label><Input value={editClient.address} onChange={(e) => setEditClient(p => ({ ...p, address: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleUpdateClient} disabled={updateClientMutation.isPending}>
              {updateClientMutation.isPending ? 'Saving...' : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{t('clientDetails.addUser')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input placeholder="User name" value={newUser.name} onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="user@example.com" value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Checkbox id="is-admin" checked={newUser.is_admin} onCheckedChange={(checked) => setNewUser(p => ({ ...p, is_admin: !!checked }))} />
              <Label htmlFor="is-admin">Admin</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Saving...' : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientDetails;
