
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
import { UploadCSV } from "@/components/ui/UploadCSV";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { Plus, Search, MoreHorizontal, FileText, Trash, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useTransactions, useCategories, useCostCenters, usePartners, useAccounts, useInvoices } from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionsProps {
  userRole: UserRole;
}

interface TransactionFormState {
  date: Date | undefined;
  amount: string;
  description: string;
  categoryId: string;
  accountId: string;
  costCenterId: string;
  partnerId: string;
  invoiceId: string;
  notes: string;
}

const emptyForm: TransactionFormState = {
  date: new Date(),
  amount: "",
  description: "",
  categoryId: "",
  accountId: "",
  costCenterId: "",
  partnerId: "",
  invoiceId: "",
  notes: "",
};

// ── Inline transaction form (no react-hook-form, no external component) ──────
interface TransactionFormProps {
  form: TransactionFormState;
  setForm: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  categories: any[];
  accounts: any[];
  costCenters: any[];
  partners: any[];
  invoices: any[];
  t: (k: string) => string;
}

const TransactionFormFields = ({
  form, setForm, categories, accounts, costCenters, partners, invoices, t,
}: TransactionFormProps) => (
  <div className="space-y-4">
    {/* Date */}
    <div className="space-y-2">
      <Label>{t('common.date')}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {form.date ? format(form.date, "PPP") : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={form.date}
            onSelect={(d) => setForm((p) => ({ ...p, date: d }))}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>

    {/* Amount + Description side by side */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tx-amount">{t('common.amount')}</Label>
        <Input
          id="tx-amount"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tx-description">{t('common.description')}</Label>
        <Input
          id="tx-description"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
    </div>

    {/* Account */}
    <div className="space-y-2">
      <Label>{t('transactions.account')}</Label>
      <Select value={form.accountId} onValueChange={(v) => setForm((p) => ({ ...p, accountId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma conta" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((a: any) => (
            <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Category */}
    <div className="space-y-2">
      <Label>{t('transactions.category')}</Label>
      <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c: any) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Cost Center (optional) */}
    <div className="space-y-2">
      <Label>{t('nav.costCenters')} <span className="text-muted-foreground text-xs">({t('form.optional')})</span></Label>
      <Select value={form.costCenterId} onValueChange={(v) => setForm((p) => ({ ...p, costCenterId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um centro de custo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {costCenters.map((cc: any) => (
            <SelectItem key={cc.id} value={String(cc.id)}>{cc.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Partner (optional) */}
    <div className="space-y-2">
      <Label>{t('nav.partners')} <span className="text-muted-foreground text-xs">({t('form.optional')})</span></Label>
      <Select value={form.partnerId} onValueChange={(v) => setForm((p) => ({ ...p, partnerId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um parceiro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {partners.map((p: any) => (
            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Invoice (optional) */}
    <div className="space-y-2">
      <Label>{t('nav.invoices')} <span className="text-muted-foreground text-xs">({t('form.optional')})</span></Label>
      <Select value={form.invoiceId} onValueChange={(v) => setForm((p) => ({ ...p, invoiceId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma fatura" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma</SelectItem>
          {invoices.map((inv: any) => (
            <SelectItem key={inv.id} value={String(inv.id)}>
              {inv.invoice_number} — ${Number(inv.amount).toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Notes (optional) */}
    <div className="space-y-2">
      <Label htmlFor="tx-notes">Notas <span className="text-muted-foreground text-xs">({t('form.optional')})</span></Label>
      <Textarea
        id="tx-notes"
        placeholder="Observações adicionais"
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
      />
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const Transactions = ({ userRole }: TransactionsProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isUploadCSVOpen, setIsUploadCSVOpen] = useState(false);
  const [form, setForm] = useState<TransactionFormState>(emptyForm);
  const { toast } = useToast();

  const clientId = selectedClient?.id ?? undefined;

  const { useGetAll: useGetTransactions, useCreate: useCreateTransaction, useDelete: useDeleteTransaction } = useTransactions();
  const { data: transactions = [] } = useGetTransactions();
  const createTransactionMutation = useCreateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // All dropdown data scoped to the selected client
  const { useGetAll: useGetCategories } = useCategories(clientId);
  const { data: categories = [] } = useGetCategories();

  const { useGetAll: useGetCostCenters } = useCostCenters(clientId);
  const { data: costCenters = [] } = useGetCostCenters();

  const { useGetAll: useGetPartners } = usePartners(clientId);
  const { data: partners = [] } = useGetPartners();

  const { useGetAll: useGetInvoices } = useInvoices(clientId);
  const { data: invoices = [] } = useGetInvoices();

  // Accounts are scoped to client via path param
  const { useGetAll: useGetAccounts } = useAccounts(clientId ?? 0);
  const { data: accounts = [] } = useGetAccounts();

  const isFormValid = () =>
    !!form.date &&
    form.amount.trim() !== "" &&
    !isNaN(Number(form.amount)) &&
    Number(form.amount) > 0 &&
    form.description.trim() !== "" &&
    form.categoryId !== "" &&
    form.accountId !== "";

  const handleAddTransaction = () => {
    if (!isFormValid()) return;
    const acctId = Number(form.accountId);
    const payload = {
      date: format(form.date!, "yyyy-MM-dd"),
      description: form.description,
      amount: Number(form.amount),
      categoryId: Number(form.categoryId),
      financialAccountId: acctId,
      transactionStatusId: 1, // default status
      ...(form.costCenterId && form.costCenterId !== "none" ? { costCenterId: Number(form.costCenterId) } : {}),
      ...(form.partnerId && form.partnerId !== "none" ? { partnerId: Number(form.partnerId) } : {}),
      ...(form.invoiceId && form.invoiceId !== "none" ? { invoiceId: Number(form.invoiceId) } : {}),
      status: 1,
    };

    createTransactionMutation.mutate({ acctId, data: payload }, {
      onSuccess: () => {
        toast({ title: t('toast.transactionAdded'), description: t('toast.transactionAddedDesc') });
        setIsAddTransactionOpen(false);
        setForm(emptyForm);
      },
      onError: (err: any) => {
        toast({ title: "Erro", description: err.message, variant: "destructive" });
      },
    });
  };

  const columns = [
    { accessorKey: "transaction_date", header: t('common.date'),
      cell: ({ row }: any) => {
        try { return format(new Date(row.original.transaction_date || row.original.date), "MMM dd, yyyy"); }
        catch { return row.original.transaction_date || row.original.date || "—"; }
      }
    },
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
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />{t('transactions.viewDetails')}
              </DropdownMenuItem>
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

  const filteredTransactions = transactions.filter((transaction: any) =>
    (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // No client selected guard (accountant view)
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
              <p className="text-muted-foreground">{t('transactions.subtitle')}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Selecione um cliente para visualizar as transações.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
            <p className="text-muted-foreground">
              {t('transactions.subtitle')}
              {selectedClient && ` — ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsUploadCSVOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />{t('transactions.importCSV')}
              </Button>
              <Button onClick={() => { setForm(emptyForm); setIsAddTransactionOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />{t('transactions.addTransaction')}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('common.search') + "..."}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('transactions.transactionHistory')}</CardTitle>
            <CardDescription>
              {t('transactions.showingTransactions').replace('{count}', filteredTransactions.length.toString())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredTransactions} />
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('transactions.addTransaction')}</DialogTitle>
          </DialogHeader>

          <TransactionFormFields
            form={form}
            setForm={setForm}
            categories={categories}
            accounts={accounts}
            costCenters={costCenters}
            partners={partners}
            invoices={invoices}
            t={t}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddTransaction}
              disabled={createTransactionMutation.isPending || !isFormValid()}
            >
              {createTransactionMutation.isPending ? "Salvando…" : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={isUploadCSVOpen} onOpenChange={setIsUploadCSVOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('transactions.importTransactionsFromCSV')}</DialogTitle>
          </DialogHeader>
          <UploadCSV
            onUpload={() => { setIsUploadCSVOpen(false); toast({ title: t('toast.csvUploaded'), description: t('toast.csvUploadedDesc') }); }}
            onCancel={() => setIsUploadCSVOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
