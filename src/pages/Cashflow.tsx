
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { useClient } from "@/contexts/ClientContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

interface CashflowProps {
  userRole: UserRole;
}

const Cashflow = ({ userRole }: CashflowProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("yearly");

  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('nav.cashflow')}</h1>
              <p className="text-muted-foreground">Track income, expenses, and profit over time</p>
            </div>
            <ClientSelector userRole={userRole} />
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select a client to view cashflow data.</p>
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
            <h1 className="text-3xl font-bold tracking-tight">{t('nav.cashflow')}</h1>
            <p className="text-muted-foreground">
              Track income, expenses, and profit over time
              {selectedClient && ` ${t('common.client')}: ${selectedClient.name}`}
            </p>
          </div>
          <ClientSelector userRole={userRole} />
        </div>

        <div className="flex justify-between gap-4">
          <Select defaultValue={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-[150px]"><SelectValue placeholder="Select period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-4 w-4" /><span>{t('common.export')}</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Analysis</CardTitle>
            <CardDescription>Connect your backend API to see cashflow data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No cashflow data available. This page will display data from your transaction records.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cashflow;
