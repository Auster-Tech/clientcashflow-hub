
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CreditCard, 
  Building, 
  Wallet, 
  DollarSign, 
  Landmark, 
  PiggyBank,
  Banknote, 
  CircleDollarSign, 
  Search 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for accounts
const mockAccounts = [
  {
    id: "1",
    name: "Business Checking",
    type: "checking",
    institution: "First National Bank",
    balance: 24500.00,
    currency: "USD",
    status: "active",
  },
  {
    id: "2",
    name: "Business Savings",
    type: "savings",
    institution: "First National Bank",
    balance: 85000.00,
    currency: "USD",
    status: "active",
  },
  {
    id: "3",
    name: "Company Credit Card",
    type: "credit",
    institution: "Chase",
    balance: -3250.75,
    currency: "USD",
    status: "active",
  },
  {
    id: "4",
    name: "Investment Account",
    type: "investment",
    institution: "Vanguard",
    balance: 150000.00,
    currency: "USD",
    status: "active",
  },
  {
    id: "5",
    name: "Petty Cash",
    type: "cash",
    institution: "Office",
    balance: 500.00,
    currency: "USD",
    status: "active",
  },
  {
    id: "6",
    name: "Tax Reserve",
    type: "savings",
    institution: "First National Bank",
    balance: 30000.00,
    currency: "USD",
    status: "active",
  },
];

interface AccountsProps {
  userRole: UserRole;
}

const Accounts = ({ userRole }: AccountsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const { toast } = useToast();

  // Calculate total balances
  const totalAssets = mockAccounts
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalLiabilities = Math.abs(mockAccounts
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + account.balance, 0));

  const netWorth = totalAssets - totalLiabilities;

  // Filter accounts based on search query
  const filteredAccounts = mockAccounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get icon for account type
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <CreditCard className="h-5 w-5" />;
      case "savings":
        return <PiggyBank className="h-5 w-5" />;
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "investment":
        return <CircleDollarSign className="h-5 w-5" />;
      case "cash":
        return <Banknote className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">
              Manage your financial accounts
            </p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Assets"
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalAssets)}
            icon={<DollarSign className="h-4 w-4" />}
            description="Sum of all positive balances"
            trend={{ 
              value: "+5.2%", 
              label: "from last month",
              positive: true
            }}
          />
          
          <StatsCard 
            title="Total Liabilities"
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalLiabilities)}
            icon={<DollarSign className="h-4 w-4" />}
            description="Sum of all negative balances"
            trend={{ 
              value: "-2.1%", 
              label: "from last month",
              positive: true
            }}
          />
          
          <StatsCard 
            title="Net Worth"
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(netWorth)}
            icon={<Wallet className="h-4 w-4" />}
            description="Assets minus Liabilities"
            trend={{ 
              value: "+8.4%", 
              label: "from last month",
              positive: true
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search accounts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${account.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {getAccountIcon(account.type)}
                    </div>
                    {account.name}
                  </CardTitle>
                  <CardDescription>
                    {account.institution}
                  </CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className="bg-green-50 text-green-700 hover:bg-green-50"
                >
                  Active
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: account.currency,
                    }).format(account.balance)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline">
                    View Transactions
                  </Button>
                  <Button size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                Name
              </Label>
              <Input
                id="account-name"
                placeholder="e.g. Business Checking"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-type" className="text-right">
                Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">
                Institution
              </Label>
              <Input
                id="institution"
                placeholder="e.g. Bank of America"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initial-balance" className="text-right">
                Balance
              </Label>
              <Input
                id="initial-balance"
                placeholder="0.00"
                type="number"
                step="0.01"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select defaultValue="USD">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsAddAccountOpen(false);
              toast({
                title: "Account added",
                description: "The new account has been added successfully.",
              });
            }}>
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Accounts;
