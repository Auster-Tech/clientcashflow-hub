import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAccounts } from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";
import { ClientSelector } from "@/components/ui/ClientSelector";

interface AccountsProps {
  userRole: UserRole;
}

const Accounts = ({ userRole }: AccountsProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountInstitution, setNewAccountInstitution] = useState("");
  const { toast } = useToast();
  
  const clientId = selectedClient?.id || 0;
  const { useGetAll, useCreate } = useAccounts(clientId);
  const { data: accounts = [], isLoading } = useGetAll();
  const createMutation = useCreate();

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('accounts.title')}</h1>
              <p className="text-muted-foreground">{t('accounts.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">{t('common.selectClient')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredAccounts = accounts.filter((account: any) =>
    (account.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.institution || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('accounts.title')}</h1>
            <p className="text-muted-foreground">{t('accounts.subtitle')}</p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />{t('accounts.addAccount')}
          </Button>
        </div>

        {userRole === 'accountant' && (
          <div className="flex items-center gap-2">
            <ClientSelector userRole={userRole} />
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t('accounts.searchAccounts')} className="pl-8"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((account: any) => (
            <Card key={account.id || account.name} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-green-100"><Wallet size={20} /></div>
                    {account.name}
                  </CardTitle>
                  <CardDescription>{account.institution}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  {t('accounts.active')}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline">{t('accounts.viewTransactions')}</Button>
                  <Button size="sm">{t('accounts.manage')}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{t('accounts.addNewAccount')}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">{t('accounts.accountName')}</Label>
              <Input id="account-name" placeholder="e.g. Business Checking" className="col-span-3"
                value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">{t('accounts.institution')}</Label>
              <Input id="institution" placeholder={t('accounts.enterInstitution')} className="col-span-3"
                value={newAccountInstitution} onChange={(e) => setNewAccountInstitution(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              createMutation.mutate({ name: newAccountName, institution: newAccountInstitution, status: 1 }, {
                onSuccess: () => {
                  toast({ title: t('toast.accountAdded'), description: t('toast.accountAddedDesc') });
                  setIsAddAccountOpen(false);
                  setNewAccountName("");
                  setNewAccountInstitution("");
                },
                onError: (error: any) => {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                },
              });
            }} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : t('accounts.addAccount')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Accounts;
