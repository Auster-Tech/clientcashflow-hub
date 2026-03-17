
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight, ArrowDownRight, BarChart, DollarSign, Users, Building2, FileText, Plus, CreditCard
} from 'lucide-react';
import { UserRole } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useTranslation();
  const isClient = userRole === 'client-admin' || userRole === 'client-user';

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')} {userRole === 'accountant' ? t('dashboard.clientsAndBusiness') : t('dashboard.financialMetrics')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'accountant' ? (
              <Button className="gap-2"><Plus className="h-4 w-4" />{t('dashboard.addClient')}</Button>
            ) : (
              <Button className="gap-2"><Plus className="h-4 w-4" />{t('dashboard.newTransaction')}</Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userRole === 'accountant' ? (
            <>
              <StatsCard title={t('dashboard.totalClients')} value="0" icon={Building2} />
              <StatsCard title={t('dashboard.activeProjects')} value="0" icon={FileText} />
              <StatsCard title={t('dashboard.monthlyRevenue')} value="$0" icon={DollarSign} />
              <StatsCard title={t('dashboard.clientRetention')} value="0%" icon={Users} />
            </>
          ) : (
            <>
              <StatsCard title={t('dashboard.cashBalance')} value="$0" icon={CreditCard} />
              <StatsCard title={t('dashboard.monthlyIncome')} value="$0" icon={ArrowUpRight} />
              <StatsCard title={t('dashboard.monthlyExpenses')} value="$0" icon={ArrowDownRight} />
              <StatsCard title={t('dashboard.netProfit')} value="$0" icon={BarChart} />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{userRole === 'accountant' ? t('dashboard.recentClientActivity') : t('dashboard.recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No data available. Connect your backend API to see live data.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
