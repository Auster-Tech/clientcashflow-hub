
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart, 
  DollarSign, 
  Users, 
  Building2, 
  FileText,
  Plus,
  CreditCard
} from 'lucide-react';
import { UserRole } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';
import { useTranslation } from '@/contexts/TranslationContext';

// Dummy data for charts
const cashflowData = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const categoryData = [
  { name: 'Rent', value: 35 },
  { name: 'Salaries', value: 40 },
  { name: 'Marketing', value: 15 },
  { name: 'Utilities', value: 10 },
];

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useTranslation();
  
  // Helper function to check if the user is a client
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dashboard.addClient')}
              </Button>
            ) : (
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('dashboard.newTransaction')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userRole === 'accountant' ? (
            <>
              <StatsCard
                title={t('dashboard.totalClients')}
                value="24"
                icon={Building2}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title={t('dashboard.activeProjects')}
                value="18"
                icon={FileText}
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title={t('dashboard.monthlyRevenue')}
                value="$24,935"
                icon={DollarSign}
                trend={{ value: 7, isPositive: true }}
              />
              <StatsCard
                title={t('dashboard.clientRetention')}
                value="97%"
                icon={Users}
                trend={{ value: 2, isPositive: true }}
              />
            </>
          ) : (
            <>
              <StatsCard
                title={t('dashboard.cashBalance')}
                value="$12,435"
                icon={CreditCard}
                trend={{ value: 3, isPositive: true }}
              />
              <StatsCard
                title={t('dashboard.monthlyIncome')}
                value="$8,294"
                icon={ArrowUpRight}
                trend={{ value: 5, isPositive: true }}
              />
              <StatsCard
                title={t('dashboard.monthlyExpenses')}
                value="$5,219"
                icon={ArrowDownRight}
                trend={{ value: 2, isPositive: false }}
              />
              <StatsCard
                title={t('dashboard.netProfit')}
                value="$3,075"
                icon={BarChart}
                trend={{ value: 10, isPositive: true }}
              />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="animated-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                {userRole === 'accountant' ? t('dashboard.revenueOverview') : t('dashboard.cashFlowOverview')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {t('dashboard.viewDetails')}
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cashflowData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, undefined]}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="rgb(59, 130, 246)"
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="1"
                      stroke="rgb(248, 113, 113)"
                      fill="rgba(248, 113, 113, 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="animated-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                {userRole === 'accountant' ? t('dashboard.clientIndustryDistribution') : t('dashboard.expenseCategories')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {t('dashboard.viewDetails')}
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={categoryData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, undefined]}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="rgb(59, 130, 246)" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {userRole === 'accountant' && (
          <Card className="animated-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                {t('dashboard.recentClientActivity')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {t('dashboard.viewAll')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">Acme Corporation</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {i === 1 ? t('dashboard.updatedTaxDocuments') : i === 2 ? t('dashboard.addedNewTransactionRecords') : t('dashboard.requestedFinancialReport')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      {t('dashboard.view')}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isClient && (
          <Card className="animated-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                {t('dashboard.recentTransactions')}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {t('dashboard.viewAll')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`rounded-full p-2 ${i % 2 === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {i % 2 === 0 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {i === 1 ? t('dashboard.officeSupplies') : i === 2 ? t('dashboard.clientPayment') : t('dashboard.utilitiesBill')}
                        </p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {i === 1 ? t('dashboard.officeDepot') : i === 2 ? t('dashboard.techSolutionsInc') : t('dashboard.cityPowerCo')}
                      </p>
                    </div>
                    <p className={`shrink-0 font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {i % 2 === 0 ? '+$1,200.00' : '-$345.65'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
