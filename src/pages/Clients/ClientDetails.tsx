
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { FileText, Users, CreditCard, Settings, Activity, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ClientCompany } from "@/types";

// Mock data for a single client
const mockClient: ClientCompany = {
  id: "1",
  name: "Acme Corporation",
  email: "info@acme.com",
  phone: "(555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  accountantId: "1",
  fiscalYear: "January-December",
  industry: "Technology",
};

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // In a real app, fetch the client data based on the ID
  const client = mockClient;

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-muted-foreground">{client.industry}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Client</Button>
            <Button variant="default">Add User</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{client.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{client.address}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p>{client.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fiscal Year</p>
                    <p>{client.fiscalYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client ID</p>
                    <p>{client.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Recent actions for this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </Avatar>
                    <div>
                      <p className="font-medium">Transaction added</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </Avatar>
                    <div>
                      <p className="font-medium">User invited</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </Avatar>
                    <div>
                      <p className="font-medium">Settings updated</p>
                      <p className="text-sm text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>View and manage client transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Transaction history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users associated with this client</CardDescription>
              </CardHeader>
              <CardContent>
                <p>User management interface will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>View and manage client documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Document management interface will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure client settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Client settings interface will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetails;
