
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TransactionForm } from "@/components/ui/TransactionForm";
import { UploadCSV } from "@/components/ui/UploadCSV";
import { Plus, Search, Filter, MoreHorizontal, FileText, Edit, Trash, Upload, Download, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useTransactions, useCategories, useCostCenters, usePartners } from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";

interface TransactionsProps {
  userRole: UserRole;
}

const Transactions = ({ userRole }: TransactionsProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isUploadCSVOpen, setIsUploadCSVOpen] = useState(false);
  const { toast } = useToast();

  const clientId = selectedClient?.id ?? 0;

  const { useGetAll: useGetTransactions, useDelete: useDeleteTransaction } = useTransactions();
  const { data: transactions = [] } = useGetTransactions();
  const deleteTransactionMutation = useDeleteTransaction();

  const { useGetAll: useGetCategories } = useCategories(clientId);
  const { data: categories = [] } = useGetCategories();

  const { useGetAll: useGetCostCenters } = useCostCenters(clientId);
  const { data: costCenters = [] } = useGetCostCenters();

  const { useGetAll: useGetPartners } = usePartners(clientId);
  const { data: partners = [] } = useGetPartners();

  const columns = [
    { accessorKey: "date", header: t('common.date') },
    { accessorKey: "description", header: t('common.description') },
    {
      accessorKey: "amount", header: t('common.amount'),
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Math.abs(amount));
        return <div className={amount < 0 ? "text-red-600" : "text-green-600"}>{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer"><FileText className="mr-2 h-4 w-4" />{t('transactions.viewDetails')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  const acctId = row.original.financialAccountId || row.original.account_id;
                  const txnId = row.original.id;
                  if (acctId && txnId) {
                    deleteTransactionMutation.mutate({ acctId, transactionId: txnId }, {
                      onSuccess: () => toast({ title: t('toast.transactionDeleted'), description: t('toast.transactionDeletedDesc') }),
                    });
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" />{t('transactions.deleteTransaction')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch =
      (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
            <p className="text-muted-foreground">{t('transactions.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadCSVOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />{t('transactions.importCSV')}
            </Button>
            <Button onClick={() => setIsAddTransactionOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />{t('transactions.addTransaction')}
            </Button>
          </div>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t('common.search') + "..."} className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('transactions.transactionHistory')}</CardTitle>
            <CardDescription>{t('transactions.showingTransactions').replace('{count}', filteredTransactions.length.toString())}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('transactions.addTransaction')}</DialogTitle></DialogHeader>
          <TransactionForm
            onSubmit={() => { setIsAddTransactionOpen(false); toast({ title: t('toast.transactionAdded'), description: t('toast.transactionAddedDesc') }); }}
            onCancel={() => setIsAddTransactionOpen(false)}
            accounts={[]}
            categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
            costCenters={costCenters.map((cc: any) => ({ id: cc.id, name: cc.name }))}
            partners={partners.map((p: any) => ({ id: p.id, name: p.name }))}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadCSVOpen} onOpenChange={setIsUploadCSVOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{t('transactions.importTransactionsFromCSV')}</DialogTitle></DialogHeader>
          <UploadCSV
            onUpload={(data) => { setIsUploadCSVOpen(false); toast({ title: t('toast.csvUploaded'), description: t('toast.csvUploadedDesc') }); }}
            onCancel={() => setIsUploadCSVOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
