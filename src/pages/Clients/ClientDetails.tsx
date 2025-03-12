
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText, 
  Users, 
  BarChart4, 
  CreditCard, 
  FilePlus, 
  Edit, 
  Trash2 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

// Mock client data
const mockClient = {
  id: "1",
  name: "Acme Corporation",
  logo: "https://placehold.co/100x100/112233/FFFFFF.png?text=ACME",
  email: "contact@acmecorp.com",
  phone: "(555) 123-4567",
  address: "123 Business Avenue, San Francisco, CA 94107",
  taxId: "123-45-6789",
  industry: "Technology",
  status: "active",
  createdAt: "2022-03-15",
  users: [
    { id: "u1", name: "John Smith", email: "john@acmecorp.com", role: "Admin" },
    { id: "u2", name: "Jane Doe", email: "jane@acmecorp.com", role: "User" }
  ],
  notes: "Acme Corporation is a leading technology company specializing in software development and cloud solutions.",
};

// Transaction history data
const transactionHistory = [
  { id: "t1", date: "2023-05-12", description: "Monthly services", amount: 1500, type: "income" },
  { id: "t2", date: "2023-04-10", description: "Project fee", amount: 5000, type: "income" },
  { id: "t3", date: "2023-03-15", description: "Consulting", amount: 2500, type: "income" },
];

// Documents data
const documents = [
  { id: "d1", name: "Contract.pdf", date: "2023-01-15", type: "contract" },
  { id: "d2", name: "Invoice-2023-04.pdf", date: "2023-04-05", type: "invoice" },
  { id: "d3", name: "Tax-Documentation.pdf", date: "2023-02-20", type: "tax" },
];

// User form schema
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(1, { message: "Please select a role." }),
});

const ClientDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "User",
    },
  });

  function onSubmitUser(values: z.infer<typeof userFormSchema>) {
    toast({
      title: "User added",
      description: "The user has been added to this client.",
    });
    setIsAddUserOpen(false);
    form.reset();
  }

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{mockClient.name}</h1>
            <p className="text-muted-foreground">
              Client ID: {id} • {mockClient.industry}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Client
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Client
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      <img src={mockClient.logo} alt={`${mockClient.name} logo`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          Active
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Client since {new Date(mockClient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Email Address</div>
                        <div className="text-sm text-muted-foreground">{mockClient.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Phone Number</div>
                        <div className="text-sm text-muted-foreground">{mockClient.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">{mockClient.address}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Tax ID</div>
                        <div className="text-sm text-muted-foreground">{mockClient.taxId}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Total Revenue (YTD)</div>
                      <div className="text-2xl font-bold">$48,500.00</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Outstanding Balance</div>
                      <div className="text-2xl font-bold">$3,250.00</div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Last Transaction</div>
                      <div className="text-xl font-bold">$1,500.00</div>
                      <div className="text-sm text-muted-foreground">May 12, 2023</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      View Financial Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{mockClient.notes}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Users</CardTitle>
                <Button onClick={() => setIsAddUserOpen(true)} className="gap-2">
                  <Users className="h-4 w-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {mockClient.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "Admin" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
                <Button className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  All Transactions
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {transactionHistory.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-medium text-green-600">
                        +${transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Documents</CardTitle>
                <Button className="gap-2">
                  <FilePlus className="h-4 w-4" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(document.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      Assign "Admin" or "User" role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientDetails;
