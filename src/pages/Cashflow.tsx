import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { useClient } from "@/contexts/ClientContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface CashflowProps {
  userRole: UserRole;
}

// ── API call ──────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function fetchCashflow(period: string, clientId?: number) {
  const qs = new URLSearchParams({ period });
  if (clientId) qs.set("client_id", String(clientId));
  const res = await fetch(`${API_BASE_URL}/cashflow/?${qs}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const fmtShort = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

function monthLabel(ym: string) {
  const [, m] = ym.split("-");
  return MONTH_LABELS[m] ?? ym;
}

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
];

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  title, value, icon: Icon, positive,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-md bg-primary/10 p-1.5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <p
          className={`text-2xl font-bold ${
            positive === true
              ? "text-green-600"
              : positive === false
              ? "text-red-600"
              : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function CashflowSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const Cashflow = ({ userRole }: CashflowProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("yearly");

  const clientId = selectedClient?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cashflow", period, clientId],
    queryFn: () => fetchCashflow(period, clientId),
    // Don't fetch when accountant hasn't selected a client
    enabled: userRole !== "accountant" || !!clientId,
  });

  // ── No client selected (accountant) ───────────────────────────────────────
  if (userRole === "accountant" && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <Header period={period} setPeriod={setPeriod} userRole={userRole} data={undefined} />
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t("common.selectClient")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <Header period={period} setPeriod={setPeriod} userRole={userRole} data={data} />

        {isLoading && <CashflowSkeleton />}

        {isError && (
          <Card>
            <CardContent className="p-6 text-center text-destructive">
              Erro ao carregar dados: {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <>
            {/* ── Totals ──────────────────────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title={t("cashflow.totalInflow")}
                value={fmt(data.totals.total_inflow)}
                icon={TrendingUp}
                positive={true}
              />
              <StatCard
                title={t("cashflow.totalOutflow")}
                value={fmt(data.totals.total_outflow)}
                icon={TrendingDown}
                positive={false}
              />
              <StatCard
                title={t("cashflow.netCashFlow")}
                value={fmt(data.totals.net_cash_flow)}
                icon={DollarSign}
                positive={data.totals.net_cash_flow >= 0}
              />
            </div>

            {/* ── Monthly bar chart ────────────────────────────────────── */}
            {data.monthly_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cashflow.monthlyBreakdown")}</CardTitle>
                  <CardDescription>
                    Entradas e saídas mês a mês no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.monthly_breakdown.map((m: any) => ({
                        ...m,
                        month: monthLabel(m.month),
                      }))}
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={72} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="inflow"  name={t("cashflow.inflow")}  fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outflow" name={t("cashflow.outflow")} fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Cumulative area chart ────────────────────────────────── */}
            {data.trend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cashflow.cashFlowTrend")}</CardTitle>
                  <CardDescription>Saldo acumulado ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={data.trend}
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(d) => {
                          try { return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }); }
                          catch { return d; }
                        }}
                      />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={72} />
                      <Tooltip
                        formatter={(v: number) => [fmt(v), "Saldo acumulado"]}
                        labelFormatter={(l) => {
                          try { return new Date(l + "T00:00:00").toLocaleDateString("pt-BR"); }
                          catch { return l; }
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative_balance"
                        name="Saldo acumulado"
                        stroke="#3b82f6"
                        fill="url(#colorBalance)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Bottom row: categories + accounts ───────────────────── */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category pie */}
              {data.category_breakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("dashboard.expenseCategories")}</CardTitle>
                    <CardDescription>Distribuição por categoria</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.category_breakdown}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {data.category_breakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {data.category_breakdown.slice(0, 6).map((c: any, i: number) => (
                        <div key={c.category_id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account balances */}
              {data.account_breakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("accounts.title")}</CardTitle>
                    <CardDescription>Saldo por conta no período</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.account_breakdown.map((acc: any) => (
                      <div
                        key={acc.account_id}
                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <BarChart2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{acc.name}</span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            acc.balance >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {fmt(acc.balance)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty state */}
            {data.monthly_breakdown.length === 0 && data.trend.length === 0 && (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  Nenhuma transação encontrada para o período selecionado.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Extracted header (period selector + client selector + export) ─────────────
function Header({
  period, setPeriod, userRole, data,
}: {
  period: string;
  setPeriod: (p: string) => void;
  userRole: UserRole;
  data: any;
}) {
  const { t } = useTranslation();

  const handleExport = () => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `cashflow-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("cashflow.title")}</h1>
        <p className="text-muted-foreground">{t("cashflow.subtitle")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ClientSelector userRole={userRole} />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9 gap-1" onClick={handleExport} disabled={!data}>
          <Download className="h-4 w-4" />
          {t("common.export")}
        </Button>
      </div>
    </div>
  );
}

export default Cashflow;
