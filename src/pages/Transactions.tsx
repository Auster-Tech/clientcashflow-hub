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
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UploadCSV } from "@/components/ui/UploadCSV";
import { ClientSelector } from "@/components/ui/ClientSelector";
import {
  Plus, Search, MoreHorizontal, FileText, Trash, Upload,
  Tag, Edit, Trash2, Calendar, AlignLeft, Layers,
  Landmark, Users, FolderKanban, Receipt, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  useTransactions, useCategories, useCostCenters,
  usePartners, useAccounts, useInvoices, useTransactionStatuses,
} from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionsProps {
  userRole: UserRole;
}

// ── Types ─────────────────────────────────────────────────────────────────────
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
}

const emptyForm: TransactionFormState = {
  date: new Date(),
  amount: "",
  description: "",
  categoryId: "",
  accountId: "",
  transactionStatusId: "",
  costCenterId: "none",
  partnerId: "none",
  invoiceId: "none",
};

// ── Utility formatters ────────────────────────────────────────────────────────
const formatCurrency = (value: any) => {
  const n = parseFloat(value);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(n));
};

const formatDate = (raw: any) => {
  if (!raw) return "—";
  try { return format(new Date(raw), "dd/MM/yyyy"); }
  catch { return String(raw); }
};

// ── Detail row component ──────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
  mono?: boolean;
}) {
  if (value == null || value === "" || value === "—") return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5 shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium break-words", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}

// ── Transaction form fields (shared by Create and Edit) ───────────────────────
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
  form, setForm, categories, accounts, transactionStatuses,
  costCenters, partners, invoices, t,
}: TransactionFormFieldsProps) => (
  <div className="space-y-4">
    {/* Date */}
    <div className="space-y-2">
      <Label>{t("common.date")}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {form.date ? format(form.date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
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
        <Label htmlFor="tx-amount">{t("common.amount")}</Label>
        <Input
          id="tx-amount"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tx-description">{t("common.description")}</Label>
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
      <Label>{t("transactions.account")}</Label>
      <Select value={form.accountId} onValueChange={(v) => setForm((p) => ({ ...p, accountId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
        <SelectContent>
          {accounts.map((a: any) => (
            <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Category */}
    <div className="space-y-2">
      <Label>{t("transactions.category")}</Label>
      <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
        <SelectContent>
          {categories.map((c: any) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Transaction Status */}
    <div className="space-y-2">
      <Label>Status da Transação</Label>
      <Select value={form.transactionStatusId} onValueChange={(v) => setForm((p) => ({ ...p, transactionStatusId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione um status" /></SelectTrigger>
        <SelectContent>
          {transactionStatuses.map((s: any) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Cost Center */}
    <div className="space-y-2">
      <Label>
        {t("nav.costCenters")}{" "}
        <span className="text-muted-foreground text-xs">({t("form.optional")})</span>
      </Label>
      <Select value={form.costCenterId} onValueChange={(v) => setForm((p) => ({ ...p, costCenterId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione um centro de custo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {costCenters.map((cc: any) => (
            <SelectItem key={cc.id} value={String(cc.id)}>{cc.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Partner */}
    <div className="space-y-2">
      <Label>
        {t("nav.partners")}{" "}
        <span className="text-muted-foreground text-xs">({t("form.optional")})</span>
      </Label>
      <Select value={form.partnerId} onValueChange={(v) => setForm((p) => ({ ...p, partnerId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione um parceiro" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {partners.map((p: any) => (
            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Invoice */}
    <div className="space-y-2">
      <Label>
        {t("nav.invoices")}{" "}
        <span className="text-muted-foreground text-xs">({t("form.optional")})</span>
      </Label>
      <Select value={form.invoiceId} onValueChange={(v) => setForm((p) => ({ ...p, invoiceId: v }))}>
        <SelectTrigger><SelectValue placeholder="Selecione uma fatura" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma</SelectItem>
          {invoices.map((inv: any) => (
            <SelectItem key={inv.id} value={String(inv.id)}>
              {inv.invoice_number} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(inv.amount))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

// ── Transaction Status CRUD section ──────────────────────────────────────────
const emptyStatusForm = { name: "", description: "" };

const TransactionStatusSection = ({
  clientId,
  t,
  toast,
}: {
  clientId: number | undefined;
  t: (k: string) => string;
  toast: any;
}) => {
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
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.name || "", description: item.description || "" }); setIsFormOpen(true); };
  const openDelete = (item: any) => { setDeleting(item); setIsDeleteOpen(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, description: form.description, status: Status.ACTIVE, client_id: clientId };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { toast({ title: "Status atualizado." }); setIsFormOpen(false); setEditing(null); },
        onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast({ title: "Status criado." }); setIsFormOpen(false); setForm(emptyStatusForm); },
        onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      });
    }
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
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" />Adicionar Status</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>}
        {!isLoading && (statuses as any[]).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Tag className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum status cadastrado ainda.</p>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Adicionar Status</Button>
          </div>
        )}
        {(statuses as any[]).map((item: any, idx: number) => (
          <React.Fragment key={item.id}>
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2"><Tag className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Ativo</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => openDelete(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Editar Status" : "Novo Status"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Nome</Label>
              <Input id="s-name" placeholder="ex: Pendente" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-desc">Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input id="s-desc" placeholder="Breve descrição" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>{isPending ? "Salvando…" : editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover status</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover <span className="font-semibold">{deleting?.name}</span>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleting?.id, { onSuccess: () => { toast({ title: "Status removido." }); setIsDeleteOpen(false); setDeleting(null); }, onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }) })} className="bg-destructive hover:bg-destructive/90" disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Removendo…" : "Remover"}</AlertDialogAction>
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

  // dialog open states
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // target transaction for each action
  const [selectedTx,  setSelectedTx]  = useState<any>(null);
  const [editingTx,   setEditingTx]   = useState<any>(null);
  const [deletingTx,  setDeletingTx]  = useState<any>(null);

  // separate form states so dialogs don't interfere
  const [addForm,  setAddForm]  = useState<TransactionFormState>(emptyForm);
  const [editForm, setEditForm] = useState<TransactionFormState>(emptyForm);

  const clientId = selectedClient?.id ?? undefined;

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { useGetAll: useGetTx, useCreate: useCreateTx, useUpdate: useUpdateTx, useDelete: useDeleteTx } = useTransactions();
  const { data: transactions = [] } = useGetTx();
  const createMutation = useCreateTx();
  const updateMutation = useUpdateTx();
  const deleteMutation = useDeleteTx();

  const { useGetAll: useGetCats }      = useCategories(clientId);
  const { data: categories = [] }      = useGetCats();
  const { useGetAll: useGetCCs }       = useCostCenters(clientId);
  const { data: costCenters = [] }     = useGetCCs();
  const { useGetAll: useGetParts }     = usePartners(clientId);
  const { data: partners = [] }        = useGetParts();
  const { useGetAll: useGetInvs }      = useInvoices(clientId);
  const { data: invoices = [] }        = useGetInvs();
  const { useGetAll: useGetStatuses }  = useTransactionStatuses(clientId);
  const { data: transactionStatuses = [] } = useGetStatuses();
  const { useGetAll: useGetAccts }     = useAccounts(clientId ?? 0);
  const { data: accounts = [] }        = useGetAccts();

  // ── Lookup helpers ────────────────────────────────────────────────────────
  const lookup = (list: any[], id: any, field = "name") =>
    id != null ? ((list as any[]).find((i) => i.id === Number(id))?.[field] ?? null) : null;

  const getCategoryName   = (id: any) => lookup(categories, id);
  const getAccountName    = (id: any) => lookup(accounts, id);
  const getStatusName     = (id: any) => lookup(transactionStatuses, id);
  const getCostCenterName = (id: any) => lookup(costCenters, id);
  const getPartnerName    = (id: any) => lookup(partners, id);
  const getInvoiceNumber  = (id: any) => lookup(invoices, id, "invoice_number");

  // ── Form validation ───────────────────────────────────────────────────────
  const isFormValid = (form: TransactionFormState) =>
    !!form.date &&
    form.amount.trim() !== "" &&
    !isNaN(Number(form.amount)) &&
    Number(form.amount) > 0 &&
    form.description.trim() !== "" &&
    form.categoryId !== "" &&
    form.accountId !== "" &&
    form.transactionStatusId !== "";

  // ── Build API payload ─────────────────────────────────────────────────────
  const buildPayload = (form: TransactionFormState) => ({
    date: format(form.date!, "yyyy-MM-dd"),
    description: form.description,
    amount: Number(form.amount),
    categoryId: Number(form.categoryId),
    financialAccountId: Number(form.accountId),
    transactionStatusId: Number(form.transactionStatusId),
    ...(form.costCenterId && form.costCenterId !== "none" ? { costCenterId: Number(form.costCenterId) } : {}),
    ...(form.partnerId    && form.partnerId    !== "none" ? { partnerId:    Number(form.partnerId)    } : {}),
    ...(form.invoiceId    && form.invoiceId    !== "none" ? { invoiceId:    Number(form.invoiceId)    } : {}),
    status: Status.ACTIVE,
  });

  // ── Map existing transaction → form state ─────────────────────────────────
  const txToForm = (tx: any): TransactionFormState => ({
    date:                tx.transaction_date ? new Date(tx.transaction_date) : new Date(),
    amount:              String(tx.amount ?? ""),
    description:         tx.description ?? "",
    categoryId:          tx.category_id != null ? String(tx.category_id) : "",
    accountId:           tx.account_id  != null ? String(tx.account_id)  : "",
    transactionStatusId: tx.transaction_status_id != null ? String(tx.transaction_status_id) : "",
    costCenterId:        tx.cost_center_id != null ? String(tx.cost_center_id) : "none",
    partnerId:           tx.partner_id    != null ? String(tx.partner_id)      : "none",
    invoiceId:           tx.invoice_id    != null ? String(tx.invoice_id)      : "none",
  });

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!isFormValid(addForm)) return;
    createMutation.mutate({ acctId: Number(addForm.accountId), data: buildPayload(addForm) }, {
      onSuccess: () => {
        toast({ title: t("toast.transactionAdded"), description: t("toast.transactionAddedDesc") });
        setIsAddOpen(false);
        setAddForm(emptyForm);
      },
      onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleUpdate = () => {
    if (!isFormValid(editForm) || !editingTx) return;
    updateMutation.mutate(
      { acctId: Number(editForm.accountId), transactionId: editingTx.id, data: buildPayload(editForm) },
      {
        onSuccess: () => {
          toast({ title: "Transação atualizada com sucesso." });
          setIsEditOpen(false);
          setEditingTx(null);
        },
        onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingTx) return;
    const acctId = deletingTx.account_id ?? deletingTx.financialAccountId;
    deleteMutation.mutate({ acctId, transactionId: deletingTx.id }, {
      onSuccess: () => {
        toast({ title: t("toast.transactionDeleted"), description: t("toast.transactionDeletedDesc") });
        setIsDeleteOpen(false);
        setDeletingTx(null);
      },
      onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const openDetail = (tx: any) => { setSelectedTx(tx);  setIsDetailOpen(true); };
  const openEdit   = (tx: any) => { setEditingTx(tx);   setEditForm(txToForm(tx)); setIsEditOpen(true); };
  const openDelete = (tx: any) => { setDeletingTx(tx);  setIsDeleteOpen(true); };

  // ── Shared form props ─────────────────────────────────────────────────────
  const sharedProps = { categories, accounts, transactionStatuses, costCenters, partners, invoices, t };

  // ── Table columns — all transaction fields ────────────────────────────────
  const columns = [
    {
      accessorKey: "transaction_date",
      header: t("common.date"),
      cell: ({ row }: any) => (
        <span className="whitespace-nowrap text-sm">{formatDate(row.original.transaction_date)}</span>
      ),
    },
    {
      accessorKey: "description",
      header: t("common.description"),
      cell: ({ row }: any) => (
        <span className="text-sm max-w-[160px] block truncate" title={row.original.description}>
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("common.amount"),
      cell: ({ row }: any) => {
        const n = parseFloat(row.original.amount);
        return (
          <span className={cn("font-medium text-sm whitespace-nowrap", n < 0 ? "text-red-600" : "text-green-600")}>
            {n < 0 ? "− " : ""}{formatCurrency(Math.abs(n))}
          </span>
        );
      },
    },
    {
      accessorKey: "account_id",
      header: t("transactions.account"),
      cell: ({ row }: any) => {
        const name = getAccountName(row.original.account_id);
        return name
          ? <Badge variant="outline" className="text-xs font-normal">{name}</Badge>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: "category_id",
      header: t("transactions.category"),
      cell: ({ row }: any) => {
        const name = getCategoryName(row.original.category_id);
        return name
          ? <Badge variant="outline" className="text-xs font-normal">{name}</Badge>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: "transaction_status_id",
      header: t("common.status"),
      cell: ({ row }: any) => {
        const name = getStatusName(row.original.transaction_status_id);
        return name
          ? <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">{name}</Badge>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: "cost_center_id",
      header: t("nav.costCenters"),
      cell: ({ row }: any) => {
        const name = getCostCenterName(row.original.cost_center_id);
        return name
          ? <span className="text-xs">{name}</span>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: "partner_id",
      header: t("nav.partners"),
      cell: ({ row }: any) => {
        const name = getPartnerName(row.original.partner_id);
        return name
          ? <span className="text-xs">{name}</span>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: "invoice_id",
      header: t("nav.invoices"),
      cell: ({ row }: any) => {
        const num = getInvoiceNumber(row.original.invoice_id);
        return num
          ? <Badge variant="outline" className="text-xs font-mono">{num}</Badge>
          : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => openDetail(row.original)}>
                <FileText className="mr-2 h-4 w-4" />{t("transactions.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => openEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />{t("transactions.editTransaction")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                onClick={() => openDelete(row.original)}
              >
                <Trash className="mr-2 h-4 w-4" />{t("transactions.deleteTransaction")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredTransactions = (transactions as any[]).filter((tx: any) =>
    (tx.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── No client guard ───────────────────────────────────────────────────────
  if (userRole === "accountant" && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("transactions.title")}</h1>
              <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("transactions.title")}</h1>
            <p className="text-muted-foreground">
              {t("transactions.subtitle")}
              {selectedClient && ` — ${selectedClient.name}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ClientSelector userRole={userRole} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />{t("transactions.importCSV")}
              </Button>
              <Button onClick={() => { setAddForm(emptyForm); setIsAddOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />{t("transactions.addTransaction")}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="transactions">{t("transactions.title")}</TabsTrigger>
            <TabsTrigger value="statuses">Status de Transação</TabsTrigger>
          </TabsList>

          {/* Transactions tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("common.search") + "..."}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t("transactions.transactionHistory")}</CardTitle>
                <CardDescription>
                  {t("transactions.showingTransactions").replace("{count}", String(filteredTransactions.length))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={filteredTransactions} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statuses tab */}
          <TabsContent value="statuses" className="space-y-6">
            <TransactionStatusSection clientId={clientId} t={t} toast={toast} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── View Details ──────────────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Detalhes da Transação
            </DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-1">
              {/* Amount highlight */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 mb-1">
                <span className="text-sm text-muted-foreground font-medium">Valor</span>
                <span className={cn(
                  "text-2xl font-bold",
                  parseFloat(selectedTx.amount) < 0 ? "text-red-600" : "text-green-600"
                )}>
                  {parseFloat(selectedTx.amount) < 0 ? "− " : ""}
                  {formatCurrency(Math.abs(parseFloat(selectedTx.amount)))}
                </span>
              </div>

              <Separator />

              <DetailRow icon={Calendar}     label="Data"            value={formatDate(selectedTx.transaction_date)} />
              <DetailRow icon={AlignLeft}    label="Descrição"       value={selectedTx.description} />
              <DetailRow icon={Landmark}     label="Conta"           value={getAccountName(selectedTx.account_id)} />
              <DetailRow icon={Tag}          label="Categoria"       value={getCategoryName(selectedTx.category_id)} />
              <DetailRow icon={CheckCircle2} label="Status"          value={getStatusName(selectedTx.transaction_status_id)} />
              <DetailRow icon={FolderKanban} label="Centro de Custo" value={getCostCenterName(selectedTx.cost_center_id)} />
              <DetailRow icon={Users}        label="Parceiro"        value={getPartnerName(selectedTx.partner_id)} />
              <DetailRow icon={Receipt}      label="Fatura"          value={getInvoiceNumber(selectedTx.invoice_id)} />
              <DetailRow icon={Layers}       label="ID"              value={String(selectedTx.id)} mono />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { setIsDetailOpen(false); openEdit(selectedTx); }}
            >
              <Edit className="h-4 w-4" />Editar
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => { setIsDetailOpen(false); openDelete(selectedTx); }}
            >
              <Trash2 className="h-4 w-4" />Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create ───────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("transactions.addTransaction")}</DialogTitle>
          </DialogHeader>
          <TransactionFormFields form={addForm} setForm={setAddForm} {...sharedProps} />
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !isFormValid(addForm)}>
              {createMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit ─────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              {t("transactions.editTransaction")}
            </DialogTitle>
          </DialogHeader>
          <TransactionFormFields form={editForm} setForm={setEditForm} {...sharedProps} />
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !isFormValid(editForm)}>
              {updateMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transactions.deleteTransaction")}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação{" "}
              <span className="font-semibold">"{deletingTx?.description}"</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo…" : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Upload CSV ───────────────────────────────────────────────────── */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("transactions.importTransactionsFromCSV")}</DialogTitle>
          </DialogHeader>
          <UploadCSV
            onUpload={() => {
              setIsUploadOpen(false);
              toast({ title: t("toast.csvUploaded"), description: t("toast.csvUploadedDesc") });
            }}
            onCancel={() => setIsUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
