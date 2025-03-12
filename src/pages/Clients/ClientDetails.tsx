import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientCompany, User } from '@/types';
import { 
  Building2, 
  Users, 
  FileText,
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Tag,
  Edit,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock client data for display
const mockClient: ClientCompany = {
  id: '1',
  name: 'Acme Corporation',
  email: 'info@acme.com',
  phone: '(555) 123-4567',
  address: '123 Main St, New York, NY 10001',
  accountantId: '1',
  fiscalYear: 'January-December',
  industry: 'Technology',
};

// Mock users associated with this client
const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@acme.com', 
    role: 'client-admin',
    clientId: '1'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@acme.com', 
    role: 'client-user',
    clientId: '1'
  },
];

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/clients">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mockClient.name}</h1>
            <p className="text-muted-foreground">
              Client ID: {id}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Client
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{mockClient.industry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fiscal Year</p>
                      <p className="font-medium">{mockClient.fiscalYear}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Client Since</p>
                      <p className="font-medium">January 2022</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{mockClient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{mockClient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{mockClient.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Client Users
                  </CardTitle>
                  <CardDescription>
                    Users associated with this client
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge>{user.role === 'client-admin' ? 'Admin' : 'User'}</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Recent financial activities and document updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="rounded-full bg-primary/10 p-2">
                        {i === 1 ? <FileText className="h-4 w-4 text-primary" /> :
                         i === 2 ? <Calendar className="h-4 w-4 text-primary" /> :
                         <Tag className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {i === 1 ? "Quarterly report uploaded" : 
                             i === 2 ? "Tax filing deadline approaching" : 
                             "New invoice created"}
                          </p>
                          <p className="text-xs text-muted-foreground">{i} day{i > 1 ? 's' : ''} ago</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {i === 1 ? "Q2 Financial Report.pdf" : 
                           i === 2 ? "Reminder: Tax filing due in 2 weeks" : 
                           "Invoice #39281 - $12,450.00"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Users</CardTitle>
                  <CardDescription>Manage users associated with this client</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={user.role === 'client-admin' ? 'default' : 'outline'}>
                          {user.role === 'client-admin' ? 'Admin' : 'User'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Documents</CardTitle>
                  <CardDescription>Upload and manage documents for this client</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Documents section content will go here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Review all activity for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Activity log content will go here</p>
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
