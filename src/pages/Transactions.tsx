
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserRole, Status } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UploadCSV } from "@/components/ui/UploadCSV";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { Plus, Search, MoreHorizontal, FileText, Trash, Upload, Tag, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  useTransactions, useCategories, useCostCenters,
  usePartners, useAccounts, useInvoices, useTransactionStatuses,
} from "@/hooks/useApi";
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
  transactionStatusId: string;
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
  transactionStatusId: "",
  costCenterId: "",
  partnerId: "",
  invoiceId: "",
  notes: "",
};

// ── Transaction form fields — defined OUTSIDE to avoid remount on keystroke ──
interface TransactionFormFieldsProps {
  form: TransactionFormState;
  setForm: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  categories: any[];
  accounts: any[];
  transactionStatuses: any[];
  costCenters: any[];
  partners: any[];
  invoices: any[];
  t: (k: string) => string;
}

const TransactionFormFields = ({
  form, setForm, categories, accounts, transactionStatuses, costCenters, partners, invoices, t,
}: TransactionFormFieldsProps) => (
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

    {/* Amount + Description */}
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

    {/* Transaction Status (required) */}
    <div className="space-y-2">
      <Label>Status da Transação</Label>
      <Select value={form.transactionStatusId} onValueChange={(v) => setForm((p) => ({ ...p, transactionStatusId: v }))}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
        <SelectContent>
          {transactionStatuses.map((s: any) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
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

// ── Transaction Status CRUD section — defined OUTSIDE main component ──────────
interface TransactionStatusSectionProps {
  clientId: number | undefined;
  t: (k: string) => string;
  toast: any;
}

const emptyStatusForm = { name: "", description: "" };

const TransactionStatusSection = ({ clientId, t, toast }: TransactionStatusSectionProps) => {
  const { useGetAll, useCreate, useUpdate, useDelete } = useTransactionStatuses(clientId);
  const { data: statuses = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(emptyStatusForm);

  const openAdd = () => { setEditing(null); setForm(emptyStatusForm); setIsFormOpen(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name || "", description: item.description || "" });
    setIsFormOpen(true);
  };
  const openDelete = (item: any) => { setDeleting(item); setIsDeleteOpen(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, description: form.description, status: Status.ACTIVE, client_id: clientId };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { toast({ title: "Status atualizado com sucesso." }); setIsFormOpen(false); setEditing(null); },
        onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast({ title: "Status criado com sucesso." }); setIsFormOpen(false); setForm(emptyStatusForm); },
        onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(deleting?.id, {
      onSuccess: () => { toast({ title: "Status removido com sucesso." }); setIsDeleteOpen(false); setDeleting(null); },
      onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Status de Transação
          </CardTitle>
          <CardDescription>Gerencie os status disponíveis para as transações</CardDescription>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Adicionar Status
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>
        )}
        {!isLoading && (statuses as any[]).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Tag className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum status cadastrado ainda.</p>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Status
            </Button>
          </div>
        )}
        {(statuses as any[]).map((item: any, idx: number) => (
          <React.Fragment key={item.id}>
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Ativo</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => openDelete(item)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </CardContent>

      {/* Form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Status" : "Novo Status"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status-name">Nome</Label>
              <Input
                id="status-name"
                placeholder="ex: Pendente"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-desc">Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input
                id="status-desc"
                placeholder="Breve descrição do status"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
              {isPending ? "Salvando…" : editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <span className="font-semibold">{deleting?.name}</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo…" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Transactions = ({ userRole }: TransactionsProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isUploadCSVOpen, setIsUploadCSVOpen] = useState(false);
  const [form, setForm] = useState<TransactionFormState>(emptyForm);

  const clientId = selectedClient?.id ?? undefined;

  const { useGetAll: useGetTransactions, useCreate: useCreateTransaction, useDelete: useDeleteTransaction } = useTransactions();
  const { data: transactions = [] } = useGetTransactions();
  const createTransactionMutation = useCreateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const { useGetAll: useGetCategories } = useCategories(clientId);
  const { data: categories = [] } = useGetCategories();

  const { useGetAll: useGetCostCenters } = useCostCenters(clientId);
  const { data: costCenters = [] } = useGetCostCenters();

  const { useGetAll: useGetPartners } = usePartners(clientId);
  const { data: partners = [] } = useGetPartners();

  const { useGetAll: useGetInvoices } = useInvoices(clientId);
  const { data: invoices = [] } = useGetInvoices();

  const { useGetAll: useGetStatuses } = useTransactionStatuses(clientId);
  const { data: transactionStatuses = [] } = useGetStatuses();

  const { useGetAll: useGetAccounts } = useAccounts(clientId ?? 0);
  const { data: accounts = [] } = useGetAccounts();

  const isFormValid = () =>
    !!form.date &&
    form.amount.trim() !== "" &&
    !isNaN(Number(form.amount)) &&
    Number(form.amount) > 0 &&
    form.description.trim() !== "" &&
    form.categoryId !== "" &&
    form.accountId !== "" &&
    form.transactionStatusId !== "";

  const handleAddTransaction = () => {
    if (!isFormValid()) return;
    const acctId = Number(form.accountId);
    const payload = {
      date: format(form.date!, "yyyy-MM-dd"),
      description: form.description,
      amount: Number(form.amount),
      categoryId: Number(form.categoryId),
      financialAccountId: acctId,
      transactionStatusId: Number(form.transactionStatusId),
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
    {
      accessorKey: "transaction_date", header: t('common.date'),
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
        {/* Header */}
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

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="transactions">{t('transactions.title')}</TabsTrigger>
            <TabsTrigger value="statuses">Status de Transação</TabsTrigger>
          </TabsList>

          {/* ── Tab: Transactions ─────────────────────────────────────────── */}
          <TabsContent value="transactions" className="space-y-4">
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
          </TabsContent>

          {/* ── Tab: Transaction Statuses ─────────────────────────────────── */}
          <TabsContent value="statuses" className="space-y-6">
            <TransactionStatusSection clientId={clientId} t={t} toast={toast} />
          </TabsContent>
        </Tabs>
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
            transactionStatuses={transactionStatuses}
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
