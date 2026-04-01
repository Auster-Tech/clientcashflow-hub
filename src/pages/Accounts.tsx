import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserRole, Status } from "@/types";
import { Plus, Wallet, Search, ArrowRight, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAccounts } from "@/hooks/useApi";
import { useClient } from "@/contexts/ClientContext";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { useQuery } from "@tanstack/react-query";
import { accountTypesApi, accountCurrenciesApi } from "@/lib/api";

interface AccountsProps {
  userRole: UserRole;
}

const emptyForm = {
  name: "",
  institution: "",
  account_type_id: "",
  account_currency_id: "",
};

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
  const [formData, setFormData] = useState(emptyForm);
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

  const openAdd = () => {
    setFormData(emptyForm);
    setIsAddOpen(true);
  };

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

  const openDelete = (account: any) => {
    setDeletingAccount(account);
    setIsDeleteOpen(true);
  };

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
          setFormData(emptyForm);
        },
        onError: (error: any) => {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        },
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
        onError: (error: any) => {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        },
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
      onError: (error: any) => {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      },
    });
  };

  const getTypeName = (id: number) =>
    (accountTypes as any[]).find((type) => type.id === id)?.name || "—";

  const getCurrencyCode = (id: number) =>
    (accountCurrencies as any[]).find((cur) => cur.id === id)?.code || "—";

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

  // ── Shared form fields ────────────────────────────────────────────────────
  const AccountFormFields = () => (
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
        <Label>{t("accounts.accountType")}
        <Select
          value={formData.account_type_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, account_type_id: v }))}
          name="acc-type"
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
        </Label>
      </div>

      <div className="space-y-2">
        <Label>{t("accounts.currency")}
        <Select
          value={formData.account_currency_id}
          onValueChange={(v) => setFormData((p) => ({ ...p, account_currency_id: v }))}
          name="acc-currency"
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
        </Label>
      </div>
    </div>
  );

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
          <div className="flex items-center gap-3">
            {userRole === "accountant" && <ClientSelector userRole={userRole} />}
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("accounts.addAccount")}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("accounts.searchAccounts")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Carregando contas…</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredAccounts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Wallet className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "Nenhuma conta encontrada para esta busca."
                : "Nenhuma conta cadastrada ainda."}
            </p>
            {!searchQuery && (
              <Button variant="outline" onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("accounts.addAccount")}
              </Button>
            )}
          </div>
        )}

        {/* Accounts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((account: any) => (
            <Card
              key={account.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0 p-1.5 rounded-full bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-tight truncate">
                        {account.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5 truncate">
                        {account.institution}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 ml-2 bg-green-50 text-green-700 hover:bg-green-50 text-xs"
                  >
                    {t("accounts.active")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
                  <span className="bg-muted px-2 py-0.5 rounded-md">
                    {getTypeName(account.account_type_id)}
                  </span>
                  <span className="bg-muted px-2 py-0.5 rounded-md font-mono">
                    {getCurrencyCode(account.account_currency_id)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs"
                    onClick={() => navigate(`/transactions?accountId=${account.id}`)}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    {t("accounts.viewTransactions")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    onClick={() => openEdit(account)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    {t("accounts.manage")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openDelete(account)}
                    title={t("common.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Add Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("accounts.addNewAccount")}</DialogTitle>
          </DialogHeader>
          <AccountFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !isFormValid()}
            >
              {createMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("common.edit")} — {editingAccount?.name}
            </DialogTitle>
          </DialogHeader>
          <AccountFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !isFormValid()}
            >
              {updateMutation.isPending ? "Salvando…" : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")} conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a conta{" "}
              <span className="font-semibold">{deletingAccount?.name}</span>? Esta
              ação não poderá ser desfeita.
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
