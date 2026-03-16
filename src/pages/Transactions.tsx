
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
import { useTransactions, useAccounts, useCategories, useCostCenters, usePartners, useImportTransactionsCSV } from "@/hooks/useApi";

interface TransactionsProps {
  userRole: UserRole;
}

const Transactions = ({ userRole }: TransactionsProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isUploadCSVOpen, setIsUploadCSVOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("all");
  const { toast } = useToast();

  const { useGetAll: useGetTransactions, useDelete: useDeleteTransaction } = useTransactions();
  const { data: transactions = [] } = useGetTransactions();
  const deleteTransactionMutation = useDeleteTransaction();

  const { useGetAll: useGetAccounts } = useAccounts();
  const { data: accounts = [] } = useGetAccounts();

  const { useGetAll: useGetCategories } = useCategories();
  const { data: categories = [] } = useGetCategories();

  const { useGetAll: useGetCostCenters } = useCostCenters();
  const { data: costCenters = [] } = useGetCostCenters();

  const { useGetAll: useGetPartners } = usePartners();
  const { data: partners = [] } = useGetPartners();

  const importCSVMutation = useImportTransactionsCSV();

  const columns = [
    {
      accessorKey: "date",
      header: ({ column }: any) => (
        <div className="flex items-center">
          {t('common.date')}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        </div>
      ),
    },
    { accessorKey: "description", header: t('common.description') },
    {
      accessorKey: "amount",
      header: ({ column }: any) => (
        <div className="flex items-center">
          {t('common.amount')}
          <ArrowUpDown className="ml-2 h-4 w-4 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />
        </div>
      ),
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
        return <div className={type === "expense" ? "text-red-600" : "text-green-600"}>{type === "expense" ? "-" : "+"}{formatted}</div>;
      },
    },
    { accessorKey: "category", header: t('transactions.category') },
    { accessorKey: "account", header: t('transactions.account') },
    {
      accessorKey: "status",
      header: t('common.status'),
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant="outline" className={status === "completed" ? "bg-green-50 text-green-700 hover:bg-green-50" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"}>
            {status === "completed" ? t('transactions.completed') : t('transactions.pending')}
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
              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer"><FileText className="mr-2 h-4 w-4" />{t('transactions.viewDetails')}</DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer"><Edit className="mr-2 h-4 w-4" />{t('transactions.editTransaction')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  deleteTransactionMutation.mutate(row.original.id, {
                    onSuccess: () => toast({ title: t('toast.transactionDeleted'), description: t('toast.transactionDeletedDesc') }),
                  });
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
      (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.account || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = transactionType === "all" || transaction.type === transactionType;
    return matchesSearch && matchesType;
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

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder={t('common.search') + "..."} className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Select defaultValue={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Transaction type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('transactions.allTransactions')}</SelectItem>
                <SelectItem value="income">{t('transactions.income')}</SelectItem>
                <SelectItem value="expense">{t('transactions.expenses')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />{t('transactions.moreFilters')}</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t('common.export')}</Button>
          </div>
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
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual">{t('transactions.manualEntry')}</TabsTrigger>
              <TabsTrigger value="upload">{t('transactions.uploadCSV')}</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <TransactionForm 
                onSubmit={() => { setIsAddTransactionOpen(false); toast({ title: t('toast.transactionAdded'), description: t('toast.transactionAddedDesc') }); }}
                onCancel={() => setIsAddTransactionOpen(false)}
                accounts={accounts.map((a: any) => ({ id: a.id, name: a.name, type: a.type }))}
                categories={categories.map((c: any) => ({ id: c.id, name: c.name, type: c.type }))}
                costCenters={costCenters.map((cc: any) => ({ id: cc.id, name: cc.name }))}
                partners={partners.map((p: any) => ({ id: p.id, name: p.name, type: p.type }))}
              />
            </TabsContent>
            <TabsContent value="upload">
              <UploadCSV 
                onUpload={(data) => {
                  importCSVMutation.mutate(data, {
                    onSuccess: () => { setIsAddTransactionOpen(false); toast({ title: t('toast.csvUploaded'), description: t('toast.csvUploadedDesc') }); },
                  });
                }}
                onCancel={() => setIsAddTransactionOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadCSVOpen} onOpenChange={setIsUploadCSVOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{t('transactions.importTransactionsFromCSV')}</DialogTitle></DialogHeader>
          <UploadCSV 
            onUpload={(data) => {
              importCSVMutation.mutate(data, {
                onSuccess: () => { setIsUploadCSVOpen(false); toast({ title: t('toast.csvUploaded'), description: t('toast.csvUploadedDesc') }); },
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
