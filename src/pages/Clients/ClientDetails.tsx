import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyUser } from '@/types';
import { Building2, Users, FileText, Mail, Phone, MapPin, Calendar, Tag, Edit, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/contexts/TranslationContext';
import { useClients, useClientUsers } from '@/hooks/useApi';

const ClientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const clientId = parseInt(id || '0', 10);

  const { useGetById } = useClients();
  const { data: client, isLoading: clientLoading } = useGetById(clientId);

  const { useGetAll: useGetUsers } = useClientUsers(clientId);
  const { data: users = [], isLoading: usersLoading } = useGetUsers();

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
            <h1 className="text-3xl font-bold tracking-tight">{client?.company_name || 'Client'}</h1>
            <p className="text-muted-foreground">Client ID: {id}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="gap-2"><Edit className="h-4 w-4" />{t('clients.editClient')}</Button>
            <Button className="gap-2"><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
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
                  <Button variant="outline" className="w-full gap-2"><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
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
                <Button className="gap-2"><Plus className="h-4 w-4" />{t('clientDetails.addUser')}</Button>
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
    </DashboardLayout>
  );
};

export default ClientDetails;
