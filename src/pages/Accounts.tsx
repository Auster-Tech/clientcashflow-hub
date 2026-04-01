import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserRole, Status } from "@/types";
import { Plus, Wallet, Search, ArrowRight, Settings, Trash2, Tag, DollarSign, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAccounts } from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountTypesApi, accountCurrenciesApi } from "@/lib/api";

interface AccountsProps {
  userRole: UserRole;
}

const emptyAccountForm = { name: "", institution: "", account_type_id: "", account_currency_id: "" };
const emptyTypeForm = { name: "" };
const emptyCurrencyForm = { code: "", name: "" };

// ── Account Types section ────────────────────────────────────────────────────
function AccountTypesSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(emptyTypeForm);

  const { data: accountTypes = [], isLoading } = useQuery({
    queryKey: ["accountTypes"],
    queryFn: accountTypesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => accountTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      toast({ title: "Tipo de conta criado com sucesso." });
      setIsFormOpen(false);
      setForm(emptyTypeForm);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => accountTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      toast({ title: "Tipo de conta atualizado com sucesso." });
      setIsFormOpen(false);
      setEditing(null);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      toast({ title: "Tipo de conta removido com sucesso." });
      setIsDeleteOpen(false);
      setDeleting(null);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm(emptyTypeForm); setIsFormOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.name || "" }); setIsFormOpen(true); };
  const openDelete = (item: any) => { setDeleting(item); setIsDeleteOpen(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, status: Status.ACTIVE };
    editing
      ? updateMutation.mutate({ id: editing.id, data: payload })
      : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Tipos de Conta
          </CardTitle>
          <CardDescription>Categorias para classificar as contas financeiras</CardDescription>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Adicionar Tipo
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>
        )}
        {!isLoading && (accountTypes as any[]).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Tag className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum tipo de conta cadastrado ainda.</p>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Tipo
            </Button>
          </div>
        )}
        {(accountTypes as any[]).map((item: any, idx: number) => (
          <React.Fragment key={item.id}>
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Tag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">ID {item.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                  Ativo
                </Badge>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Tipo de Conta" : "Novo Tipo de Conta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="type-name">Nome</Label>
              <Input
                id="type-name"
                placeholder="ex: Conta Corrente"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.name.trim()}>
              {isPending ? "Salvando…" : editing ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tipo de conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <span className="font-semibold">{deleting?.name}</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleting?.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo…" : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ── Account Currencies section ───────────────────────────────────────────────
function AccountCurrenciesSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(emptyCurrencyForm);

  const { data: accountCurrencies = [], isLoading } = useQuery({
    queryKey: ["accountCurrencies"],
    queryFn: accountCurrenciesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => accountCurrenciesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountCurrencies"] });
      toast({ title: "Moeda criada com sucesso." });
      setIsFormOpen(false);
      setForm(emptyCurrencyForm);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => accountCurrenciesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountCurrencies"] });
      toast({ title: "Moeda atualizada com sucesso." });
      setIsFormOpen(false);
      setEditing(null);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountCurrenciesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountCurrencies"] });
      toast({ title: "Moeda removida com sucesso." });
      setIsDeleteOpen(false);
      setDeleting(null);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(null); setForm(emptyCurrencyForm); setIsFormOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ code: item.code || "", name: item.name || "" }); setIsFormOpen(true); };
  const openDelete = (item: any) => { setDeleting(item); setIsDeleteOpen(true); };

  const isFormValid = () => form.code.trim() !== "" && form.name.trim() !== "";

  const handleSubmit = () => {
    if (!isFormValid()) return;
    const payload = { code: form.code.toUpperCase(), name: form.name, status: Status.ACTIVE };
    editing
      ? updateMutation.mutate({ id: editing.id, data: payload })
      : createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Moedas
          </CardTitle>
          <CardDescription>Moedas disponíveis para uso nas contas financeiras</CardDescription>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Adicionar Moeda
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>
        )}
        {!isLoading && (accountCurrencies as any[]).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <DollarSign className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhuma moeda cadastrada ainda.</p>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Moeda
            </Button>
          </div>
        )}
        {(accountCurrencies as any[]).map((item: any, idx: number) => (
          <React.Fragment key={item.id}>
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {item.code}
                </Badge>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Moeda" : "Nova Moeda"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cur-code">Código (ex: BRL)</Label>
              <Input
                id="cur-code"
                placeholder="BRL"
                value={form.code}
                maxLength={5}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cur-name">Nome</Label>
              <Input
                id="cur-name"
                placeholder="ex: Real Brasileiro"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={isPending || !isFormValid()}>
              {isPending ? "Salvando…" : editing ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover moeda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-semibold">{deleting?.name} ({deleting?.code})</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleting?.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo…" : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface AccountFormData {
  name: string;
  institution: string;
  account_type_id: string;
  account_currency_id: string;
}

interface AccountFormFieldsProps {
  formData: AccountFormData;
  setFormData: React.Dispatch<React.SetStateAction<AccountFormData>>;
  accountTypes: any[];
  accountCurrencies: any[];
  t: (key: string) => string;
}

const AccountFormFields = ({
  formData,
  setFormData,
  accountTypes,
  accountCurrencies,
  t,
}: AccountFormFieldsProps) => (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="acc-name">{t("accounts.accountName")}</Label>
        <Input
          id="acc-name"
          placeholder="ex: Conta Corrente Principal"
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="acc-institution">{t("accounts.institution")}</Label>
        <Input
          id="acc-institution"
          placeholder={t("accounts.enterInstitution")}
          value={formData.institution}
          onChange={(e) => setFormData((p) => ({ ...p, institution: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>{t("accounts.accountType")}</Label>
        <Select
          value={formData.account_type_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, account_type_id: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("accounts.selectAccountType")} />
          </SelectTrigger>
          <SelectContent>
            {(accountTypes as any[]).map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("accounts.currency")}</Label>
        <Select
          value={formData.account_currency_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, account_currency_id: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("accounts.selectCurrency")} />
          </SelectTrigger>
          <SelectContent>
            {(accountCurrencies as any[]).map((cur) => (
              <SelectItem key={cur.id} value={String(cur.id)}>
                {cur.code} — {cur.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

// ── Main Accounts page ───────────────────────────────────────────────────────
const Accounts = ({ userRole }: AccountsProps) => {
  const { t } = useTranslation();
  const { selectedClient } = useClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deletingAccount, setDeletingAccount] = useState<any>(null);
  const [formData, setFormData] = useState(emptyAccountForm);
  const { toast } = useToast();

  const clientId = selectedClient?.id || 0;
  const { useGetAll, useCreate, useUpdate, useDelete } = useAccounts(clientId);
  const { data: accounts = [], isLoading } = useGetAll();
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const { data: accountTypes = [] } = useQuery({
    queryKey: ["accountTypes"],
    queryFn: accountTypesApi.getAll,
  });

  const { data: accountCurrencies = [] } = useQuery({
    queryKey: ["accountCurrencies"],
    queryFn: accountCurrenciesApi.getAll,
  });

  const filteredAccounts = accounts.filter((account: any) =>
    (account.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.institution || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => { setFormData(emptyAccountForm); setIsAddOpen(true); };

  const openEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name || "",
      institution: account.institution || "",
      account_type_id: String(account.account_type_id || ""),
      account_currency_id: String(account.account_currency_id || ""),
    });
    setIsEditOpen(true);
  };

  const openDelete = (account: any) => { setDeletingAccount(account); setIsDeleteOpen(true); };

  const isFormValid = () =>
    formData.name.trim() !== "" &&
    formData.institution.trim() !== "" &&
    formData.account_type_id !== "" &&
    formData.account_currency_id !== "";

  const handleCreate = () => {
    if (!isFormValid()) return;
    createMutation.mutate(
      {
        name: formData.name,
        institution: formData.institution,
        account_type_id: Number(formData.account_type_id),
        account_currency_id: Number(formData.account_currency_id),
        client_id: clientId,
        status: Status.ACTIVE,
      },
      {
        onSuccess: () => {
          toast({ title: t("toast.accountAdded"), description: t("toast.accountAddedDesc") });
          setIsAddOpen(false);
          setFormData(emptyAccountForm);
        },
        onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
      }
    );
  };

  const handleUpdate = () => {
    if (!isFormValid() || !editingAccount) return;
    updateMutation.mutate(
      {
        accountId: editingAccount.id,
        data: {
          name: formData.name,
          institution: formData.institution,
          account_type_id: Number(formData.account_type_id),
          account_currency_id: Number(formData.account_currency_id),
          client_id: clientId,
          status: editingAccount.status ?? Status.ACTIVE,
        },
      },
      {
        onSuccess: () => {
          toast({ title: t("common.edit"), description: "Conta atualizada com sucesso." });
          setIsEditOpen(false);
          setEditingAccount(null);
        },
        onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingAccount) return;
    deleteMutation.mutate(deletingAccount.id, {
      onSuccess: () => {
        toast({ title: t("common.delete"), description: "Conta removida com sucesso." });
        setIsDeleteOpen(false);
        setDeletingAccount(null);
      },
      onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
    });
  };

  const getTypeName = (id: number) =>
    (accountTypes as any[]).find((type) => type.id === id)?.name || "—";

  const getCurrencyCode = (id: number) =>
    (accountCurrencies as any[]).find((cur) => cur.id === id)?.code || "—";

  // ── Account form fields (shared between Add and Edit) ─────────────────────
  

  // ── No client selected (accountant view) ─────────────────────────────────
  if (userRole === "accountant" && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("accounts.title")}</h1>
              <p className="text-muted-foreground">{t("accounts.subtitle")}</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">{t("common.selectClient")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sharedFormProps = {
    formData,
    setFormData,
    accountTypes: accountTypes as any[],
    accountCurrencies: accountCurrencies as any[],
    t,
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("accounts.title")}</h1>
            <p className="text-muted-foreground">
              {t("accounts.subtitle")}
              {selectedClient && ` — ${selectedClient.name}`}
            </p>
          </div>
          {userRole === "accountant" && (
            <ClientSelector userRole={userRole} />
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="accounts">{t("accounts.title")}</TabsTrigger>
            <TabsTrigger value="types">Tipos de Conta</TabsTrigger>
            <TabsTrigger value="currencies">Moedas</TabsTrigger>
          </TabsList>

          {/* ── Tab: Accounts ────────────────────────────────────────────── */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Contas Financeiras
                  </CardTitle>
                  <CardDescription>
                    Gerencie as contas financeiras
                    {selectedClient ? ` de ${selectedClient.name}` : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("accounts.searchAccounts")}
                      className="pl-8 w-52"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={openAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("accounts.addAccount")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && (
                  <p className="text-sm text-muted-foreground py-4 text-center">Carregando…</p>
                )}
                {!isLoading && filteredAccounts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Wallet className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "Nenhuma conta encontrada." : "Nenhuma conta cadastrada ainda."}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" size="sm" onClick={openAdd} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t("accounts.addAccount")}
                      </Button>
                    )}
                  </div>
                )}
                {filteredAccounts.map((account: any, idx: number) => (
                  <React.Fragment key={account.id}>
                    {idx > 0 && <Separator />}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.institution}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs hidden sm:flex">
                          {getTypeName(account.account_type_id)}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono hidden sm:flex">
                          {getCurrencyCode(account.account_currency_id)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => navigate(`/transactions?accountId=${account.id}`)}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          {t("accounts.viewTransactions")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(account)}
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDelete(account)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Account Types ───────────────────────────────────────── */}
          <TabsContent value="types" className="space-y-6">
            <AccountTypesSection />
          </TabsContent>

          {/* ── Tab: Account Currencies ──────────────────────────────────── */}
          <TabsContent value="currencies" className="space-y-6">
            <AccountCurrenciesSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Add Account Dialog ──────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("accounts.addNewAccount")}</DialogTitle>
          </DialogHeader>
          <AccountFormFields {...sharedFormProps} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending || !isFormValid()}>
              {createMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Account Dialog ─────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.edit")} — {editingAccount?.name}</DialogTitle>
          </DialogHeader>
          <AccountFormFields {...sharedFormProps} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !isFormValid()}>
              {updateMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Account Confirm ──────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")} conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a conta{" "}
              <span className="font-semibold">{deletingAccount?.name}</span>?
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
              {deleteMutation.isPending ? "Removendo…" : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Accounts;
