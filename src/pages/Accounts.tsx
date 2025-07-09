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
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

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
  const { t } = useTranslation();
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
        return <CreditCard size={20} />;
      case "savings":
        return <PiggyBank size={20} />;
      case "credit":
        return <CreditCard size={20} />;
      case "investment":
        return <CircleDollarSign size={20} />;
      case "cash":
        return <Banknote size={20} />;
      default:
        return <Wallet size={20} />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('accounts.title')}</h1>
            <p className="text-muted-foreground">
              {t('accounts.subtitle')}
            </p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('accounts.addAccount')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title={t('accounts.totalAssets')}
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalAssets)}
            icon={DollarSign}
            description={t('accounts.sumOfAllPositiveBalances')}
            trend={{ 
              value: "+5.2%", 
              label: t('accounts.fromLastMonth'),
              positive: true
            }}
          />
          
          <StatsCard 
            title={t('accounts.totalLiabilities')}
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalLiabilities)}
            icon={DollarSign}
            description={t('accounts.sumOfAllNegativeBalances')}
            trend={{ 
              value: "-2.1%", 
              label: t('accounts.fromLastMonth'),
              positive: true
            }}
          />
          
          <StatsCard 
            title={t('accounts.netWorth')}
            value={new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(netWorth)}
            icon={Wallet}
            description={t('accounts.assetsMinusLiabilities')}
            trend={{ 
              value: "+8.4%", 
              label: t('accounts.fromLastMonth'),
              positive: true
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('accounts.searchAccounts')}
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
                  {t('accounts.active')}
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
                    {t(`accounts.${account.type}`)} {t('accounts.account')}
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline">
                    {t('accounts.viewTransactions')}
                  </Button>
                  <Button size="sm">
                    {t('accounts.manage')}
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
            <DialogTitle>{t('accounts.addNewAccount')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                {t('accounts.accountName')}
              </Label>
              <Input
                id="account-name"
                placeholder="e.g. Business Checking"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-type" className="text-right">
                {t('accounts.accountType')}
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('accounts.selectAccountType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">{t('accounts.checking')}</SelectItem>
                  <SelectItem value="savings">{t('accounts.savings')}</SelectItem>
                  <SelectItem value="credit">{t('accounts.credit')}</SelectItem>
                  <SelectItem value="investment">{t('accounts.investment')}</SelectItem>
                  <SelectItem value="cash">{t('accounts.cash')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">
                {t('accounts.institution')}
              </Label>
              <Input
                id="institution"
                placeholder={t('accounts.enterInstitution')}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initial-balance" className="text-right">
                {t('accounts.balance')}
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
                {t('accounts.currency')}
              </Label>
              <Select defaultValue="USD">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('accounts.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">{t('accounts.usd')}</SelectItem>
                  <SelectItem value="EUR">{t('accounts.eur')}</SelectItem>
                  <SelectItem value="GBP">{t('accounts.gbp')}</SelectItem>
                  <SelectItem value="CAD">{t('accounts.cad')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => {
              setIsAddAccountOpen(false);
              toast({
                title: t('toast.accountAdded'),
                description: t('toast.accountAddedDesc'),
              });
            }}>
              {t('accounts.addAccount')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Accounts;
