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
import { Badge } from "@/components/ui/badge";
import {
  Download, TrendingUp, TrendingDown, DollarSign, BarChart2,
  ChevronDown, ChevronRight, Landmark, FolderKanban, Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Uses the api.ts interceptor (Bearer token injected automatically)
import { request } from "@/lib/api";

interface CashflowProps {
  userRole: UserRole;
}

// ── API call via interceptor ──────────────────────────────────────────────────
async function fetchCashflow(period: string, clientId?: number): Promise<any> {
  const qs = new URLSearchParams({ period });
  if (clientId) qs.set("client_id", String(clientId));
  return request<any>(`/cashflow/?${qs}`);
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
  title, value, icon: Icon, positive, subtitle,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  positive?: boolean;
  subtitle?: string;
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
        <p className={`text-2xl font-bold ${positive === true ? "text-green-600" : positive === false ? "text-red-600" : ""}`}>
          {value}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  if (type === "income") return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs">Receita</Badge>;
  if (type === "expense") return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-xs">Despesa</Badge>;
  return <Badge variant="outline" className="text-xs">{type}</Badge>;
}

// ── Category breakdown table ──────────────────────────────────────────────────
function CategoryBreakdownTable({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return <p className="text-sm text-muted-foreground py-2">Nenhuma categoria.</p>;

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-3">
      {income.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Receitas</p>
          {income.map((c) => (
            <div key={c.category_id} className="flex items-center justify-between py-1 border-b last:border-0">
              <span className="text-sm">{c.name}</span>
              <span className="text-sm font-medium text-green-600">{fmt(c.amount)}</span>
            </div>
          ))}
        </div>
      )}
      {expense.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Despesas</p>
          {expense.map((c) => (
            <div key={c.category_id} className="flex items-center justify-between py-1 border-b last:border-0">
              <span className="text-sm">{c.name}</span>
              <span className="text-sm font-medium text-red-600">{fmt(c.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collapsible segment card ──────────────────────────────────────────────────
function SegmentCard({
  title, icon: Icon, inflow, outflow, balance, typeTotals, categoryBreakdown,
}: {
  title: string;
  icon: React.ElementType;
  inflow: number;
  outflow: number;
  balance: number;
  typeTotals: { income: number; expense: number };
  categoryBreakdown: any[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1.5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-semibold", balance >= 0 ? "text-green-600" : "text-red-600")}>
            {fmt(balance)}
          </span>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t bg-muted/10">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="text-center p-2 rounded-md bg-green-50 border border-green-100">
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-sm font-semibold text-green-600">{fmt(inflow)}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-red-50 border border-red-100">
              <p className="text-xs text-muted-foreground">Saídas</p>
              <p className="text-sm font-semibold text-red-600">{fmt(outflow)}</p>
            </div>
            <div className="text-center p-2 rounded-md bg-blue-50 border border-blue-100">
              <p className="text-xs text-muted-foreground">Líquido</p>
              <p className={cn("text-sm font-semibold", balance >= 0 ? "text-blue-600" : "text-red-600")}>{fmt(balance)}</p>
            </div>
          </div>

          {/* By type */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Por tipo de categoria</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-100">
                <span className="text-xs text-green-700">Receita</span>
                <span className="text-xs font-semibold text-green-700">{fmt(typeTotals.income)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-100">
                <span className="text-xs text-red-700">Despesa</span>
                <span className="text-xs font-semibold text-red-700">{fmt(typeTotals.expense)}</span>
              </div>
            </div>
          </div>

          {/* By category */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Por categoria</p>
            <CategoryBreakdownTable categories={categoryBreakdown} />
          </div>
        </div>
      )}
    </div>
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
    enabled: userRole !== "accountant" || !!clientId,
  });

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
            {/* ── Global totals ─────────────────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard title={t("cashflow.totalInflow")} value={fmt(data.totals.total_inflow)} icon={TrendingUp} positive={true} />
              <StatCard title={t("cashflow.totalOutflow")} value={fmt(data.totals.total_outflow)} icon={TrendingDown} positive={false} />
              <StatCard
                title={t("cashflow.netCashFlow")}
                value={fmt(data.totals.net_cash_flow)}
                icon={DollarSign}
                positive={data.totals.net_cash_flow >= 0}
              />
            </div>

            {/* ── Totals by category type ───────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Totais por tipo de categoria</CardTitle>
                <CardDescription>Soma total de receitas e despesas no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50 border-green-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Receita</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">{fmt(data.totals.by_type?.income ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-100">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Despesa</span>
                    </div>
                    <span className="text-xl font-bold text-red-700">{fmt(data.totals.by_type?.expense ?? 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Category breakdown ────────────────────────────────────── */}
            {data.category_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Totais por categoria</CardTitle>
                  <CardDescription>Valor movimentado em cada categoria no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Table */}
                    <CategoryBreakdownTable categories={data.category_breakdown} />

                    {/* Pie chart */}
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data.category_breakdown}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {data.category_breakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Monthly bar chart ─────────────────────────────────────── */}
            {data.monthly_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cashflow.monthlyBreakdown")}</CardTitle>
                  <CardDescription>Entradas e saídas mês a mês no período selecionado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.monthly_breakdown.map((m: any) => ({ ...m, month: monthLabel(m.month) }))}
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} width={72} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="inflow" name={t("cashflow.inflow")} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outflow" name={t("cashflow.outflow")} fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Cumulative trend ──────────────────────────────────────── */}
            {data.trend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("cashflow.cashFlowTrend")}</CardTitle>
                  <CardDescription>Saldo acumulado ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.trend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
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
                      <Area type="monotone" dataKey="cumulative_balance" name="Saldo acumulado" stroke="#3b82f6" fill="url(#colorBalance)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Per-account breakdown ─────────────────────────────────── */}
            {data.account_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Por conta
                  </CardTitle>
                  <CardDescription>Movimentação segmentada por conta financeira</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.account_breakdown.map((acc: any) => (
                    <SegmentCard
                      key={acc.account_id}
                      title={acc.name}
                      icon={Landmark}
                      inflow={acc.inflow}
                      outflow={acc.outflow}
                      balance={acc.balance}
                      typeTotals={acc.type_totals}
                      categoryBreakdown={acc.category_breakdown}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── Per-cost-center breakdown ─────────────────────────────── */}
            {data.cost_center_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Por centro de custo
                  </CardTitle>
                  <CardDescription>Movimentação segmentada por centro de custo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.cost_center_breakdown.map((cc: any) => (
                    <SegmentCard
                      key={cc.cost_center_id}
                      title={cc.name}
                      icon={FolderKanban}
                      inflow={cc.inflow}
                      outflow={cc.outflow}
                      balance={cc.balance}
                      typeTotals={cc.type_totals}
                      categoryBreakdown={cc.category_breakdown}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── Per-partner breakdown ─────────────────────────────────── */}
            {data.partner_breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Por parceiro
                  </CardTitle>
                  <CardDescription>Movimentação segmentada por parceiro</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.partner_breakdown.map((pt: any) => (
                    <SegmentCard
                      key={pt.partner_id}
                      title={pt.name}
                      icon={Users}
                      inflow={pt.inflow}
                      outflow={pt.outflow}
                      balance={pt.balance}
                      typeTotals={pt.type_totals}
                      categoryBreakdown={pt.category_breakdown}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

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

// ── Header ────────────────────────────────────────────────────────────────────
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
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
