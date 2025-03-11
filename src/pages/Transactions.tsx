
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRole } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TransactionForm } from "@/components/ui/TransactionForm";
import { UploadCSV } from "@/components/ui/UploadCSV";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Edit, 
  Trash, 
  Upload, 
  Download, 
  ArrowUpDown 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Mock data for transactions
const mockTransactions = [
  {
    id: "1",
    date: "2023-05-12",
    description: "Office supplies purchase",
    amount: 249.99,
    type: "expense",
    category: "Office Supplies",
    account: "Business Checking",
    status: "completed",
  },
  {
    id: "2",
    date: "2023-05-10",
    description: "Client payment - ABC Corp",
    amount: 1500.00,
    type: "income",
    category: "Services",
    account: "Business Checking",
    status: "completed",
  },
  {
    id: "3",
    date: "2023-05-08",
    description: "Monthly rent",
    amount: 2000.00,
    type: "expense",
    category: "Rent",
    account: "Business Checking",
    status: "completed",
  },
  {
    id: "4",
    date: "2023-05-05",
    description: "Software subscription",
    amount: 49.99,
    type: "expense",
    category: "Software",
    account: "Business Credit Card",
    status: "completed",
  },
  {
    id: "5",
    date: "2023-05-01",
    description: "Client retainer - XYZ Ltd",
    amount: 2500.00,
    type: "income",
    category: "Retainer",
    account: "Business Checking",
    status: "completed",
  },
  {
    id: "6",
    date: "2023-04-28",
    description: "Marketing campaign",
    amount: 750.00,
    type: "expense",
    category: "Marketing",
    account: "Business Credit Card",
    status: "pending",
  },
  {
    id: "7",
    date: "2023-04-25",
    description: "Utility bills",
    amount: 312.45,
    type: "expense",
    category: "Utilities",
    account: "Business Checking",
    status: "completed",
  },
];

interface TransactionsProps {
  userRole: UserRole;
}

const Transactions = ({ userRole }: TransactionsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isUploadCSVOpen, setIsUploadCSVOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("all");
  const { toast } = useToast();

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }: any) => (
        <div className="flex items-center">
          Date
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "amount",
      header: ({ column }: any) => (
        <div className="flex items-center">
          Amount
          <ArrowUpDown 
            className="ml-2 h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return (
          <div className={type === "expense" ? "text-red-600" : "text-green-600"}>
            {type === "expense" ? "-" : "+"}{formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "account",
      header: "Account",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge 
            variant="outline" 
            className={
              status === "completed" 
                ? "bg-green-50 text-green-700 hover:bg-green-50" 
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
            }
          >
            {status === "completed" ? "Completed" : "Pending"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
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
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Transaction
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  toast({
                    title: "Transaction deleted",
                    description: "The transaction has been removed successfully.",
                  });
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Filter transactions based on search query and transaction type
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      transactionType === "all" || 
      transaction.type === transactionType;
    
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage all financial transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsUploadCSVOpen(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setIsAddTransactionOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select defaultValue={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={filteredTransactions} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <TransactionForm 
                onSubmit={() => {
                  setIsAddTransactionOpen(false);
                  toast({
                    title: "Transaction added",
                    description: "The transaction has been added successfully.",
                  });
                }}
                onCancel={() => setIsAddTransactionOpen(false)}
              />
            </TabsContent>
            
            <TabsContent value="upload">
              <UploadCSV 
                onUpload={() => {
                  setIsAddTransactionOpen(false);
                  toast({
                    title: "CSV uploaded",
                    description: "The transactions have been imported successfully.",
                  });
                }}
                onCancel={() => setIsAddTransactionOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={isUploadCSVOpen} onOpenChange={setIsUploadCSVOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Transactions from CSV</DialogTitle>
          </DialogHeader>
          <UploadCSV 
            onUpload={() => {
              setIsUploadCSVOpen(false);
              toast({
                title: "CSV uploaded",
                description: "The transactions have been imported successfully.",
              });
            }}
            onCancel={() => setIsUploadCSVOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
