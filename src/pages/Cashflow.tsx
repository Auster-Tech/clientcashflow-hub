
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSelector } from "@/components/ui/ClientSelector";
import { useClient } from "@/contexts/ClientContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { UserRole } from "@/types";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, CalendarRange, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CashflowProps {
  userRole: UserRole;
}

// Mock data for cashflow
const mockData = [
  { month: "Jan", income: 12000, expenses: 8000, profit: 4000 },
  { month: "Feb", income: 13500, expenses: 7800, profit: 5700 },
  { month: "Mar", income: 15000, expenses: 9200, profit: 5800 },
  { month: "Apr", income: 14000, expenses: 8700, profit: 5300 },
  { month: "May", income: 16500, expenses: 9800, profit: 6700 },
  { month: "Jun", income: 19000, expenses: 10500, profit: 8500 },
  { month: "Jul", income: 17500, expenses: 11000, profit: 6500 },
  { month: "Aug", income: 18000, expenses: 10200, profit: 7800 },
  { month: "Sep", income: 21000, expenses: 12000, profit: 9000 },
  { month: "Oct", income: 20000, expenses: 12500, profit: 7500 },
  { month: "Nov", income: 19500, expenses: 11800, profit: 7700 },
  { month: "Dec", income: 23000, expenses: 14000, profit: 9000 },
];

const Cashflow = ({ userRole }: CashflowProps) => {
  const { selectedClient } = useClient();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("yearly");
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Show message for accountants who haven't selected a client
  if (userRole === 'accountant' && !selectedClient) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('nav.cashflow')}</h1>
              <p className="text-muted-foreground">
                Track income, expenses, and profit over time
              </p>
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

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <CalendarRange className="h-4 w-4" />
                  <span>{t('common.filter')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" className="h-8 gap-1 self-start">
            <Download className="h-4 w-4" />
            <span>{t('common.export')}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$235,000</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                14.5% from last year
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$126,000</div>
              <div className="flex items-center text-sm text-red-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                8.2% from last year
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$109,000</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                21.8% from last year
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>
                  Income vs. Expenses vs. Profit ({period} view)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Income & Expense Breakdown</CardTitle>
                <CardDescription>Monthly distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#3b82f6" />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Cashflow;
