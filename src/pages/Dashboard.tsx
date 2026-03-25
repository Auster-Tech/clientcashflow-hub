
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ArrowUpRight, ArrowDownRight, BarChart, DollarSign, Users, Building2, FileText, Plus, CreditCard
} from 'lucide-react';
import { UserRole, Status } from '@/types';
import { useTranslation } from '@/contexts/TranslationContext';
import { useClients } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  userRole: UserRole;
}

const emptyClient = { taxId: '', companyName: '', industry: '', email: '', phone: '', address: '', fiscalYearEnd: '' };

const Dashboard = ({ userRole }: DashboardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isClient = userRole === 'client-admin' || userRole === 'client-user';
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState(emptyClient);

  const { useCreate } = useClients();
  const createMutation = useCreate();

  const handleCreateClient = () => {
    createMutation.mutate({ ...newClient, status: Status.ACTIVE }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Client added successfully." });
        setIsAddClientOpen(false);
        setNewClient(emptyClient);
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

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
              <Button className="gap-2" onClick={() => setIsAddClientOpen(true)}><Plus className="h-4 w-4" />{t('dashboard.addClient')}</Button>
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

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{t('dashboard.addClient')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Tax ID</Label><Input placeholder="Enter tax ID" value={newClient.taxId} onChange={(e) => setNewClient(p => ({ ...p, taxId: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Company Name</Label><Input placeholder="Enter company name" value={newClient.companyName} onChange={(e) => setNewClient(p => ({ ...p, companyName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Industry</Label><Input placeholder="Enter industry" value={newClient.industry} onChange={(e) => setNewClient(p => ({ ...p, industry: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="company@example.com" value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="(555) 123-4567" value={newClient.phone} onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Fiscal Year End</Label><Input placeholder="e.g. December" value={newClient.fiscalYearEnd} onChange={(e) => setNewClient(p => ({ ...p, fiscalYearEnd: e.target.value }))} /></div>
            <div className="space-y-2 col-span-2"><Label>Address</Label><Input placeholder="Enter company address" value={newClient.address} onChange={(e) => setNewClient(p => ({ ...p, address: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateClient} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
