import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import {
  accountsApi,
  categoriesApi,
  costCentersApi,
  partnersApi,
  invoicesApi,
  transactionsApi,
  clientsApi,
  clientCompaniesApi,
  cashflowApi,
  dashboardApi,
} from '@/lib/api';
import { Account, Category, CostCenter, Partner, Invoice, Transaction, Client, ClientCompany } from '@/types';

// Generic CRUD hook factory
function useCrudHooks<T extends { id: string }>(key: string, api: {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: any) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  delete: (id: string) => Promise<void>;
}) {
  const queryClient = useQueryClient();

  const useGetAll = (): UseQueryResult<T[]> => useQuery<T[]>({ queryKey: [key], queryFn: api.getAll });
  const useGetById = (id: string) => useQuery<T>({ queryKey: [key, id], queryFn: () => api.getById(id), enabled: !!id });

  const useCreate = () => useMutation({
    mutationFn: (data: Omit<T, 'id'>) => api.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  const useUpdate = () => useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => api.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  const useDelete = () => useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  return { useGetAll, useGetById, useCreate, useUpdate, useDelete };
}

// Resource hooks
export const useAccounts = () => useCrudHooks<Account>('accounts', accountsApi as any);
export const useCategories = () => useCrudHooks<Category>('categories', categoriesApi as any);
export const useCostCenters = () => useCrudHooks<CostCenter>('costCenters', costCentersApi as any);
export const usePartners = () => useCrudHooks<Partner>('partners', partnersApi as any);
export const useInvoices = () => useCrudHooks<Invoice>('invoices', invoicesApi as any);
export const useTransactions = () => useCrudHooks<Transaction>('transactions', transactionsApi as any);
export const useClients = () => useCrudHooks<Client>('clients', clientsApi as any);
export const useClientCompanies = () => useCrudHooks<ClientCompany>('clientCompanies', clientCompaniesApi as any);

// Import CSV mutations
export const useImportInvoicesCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => invoicesApi.importCSV(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useImportTransactionsCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => transactionsApi.importCSV(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
};

// Cashflow hooks
export const useCashflowData = (period?: string) =>
  useQuery({ queryKey: ['cashflow', period], queryFn: () => cashflowApi.getData(period) });

export const useCashflowSummary = () =>
  useQuery({ queryKey: ['cashflow', 'summary'], queryFn: cashflowApi.getSummary });

// Dashboard hooks
export const useDashboardStats = (userRole: string) =>
  useQuery({ queryKey: ['dashboard', 'stats', userRole], queryFn: () => dashboardApi.getStats(userRole) });

export const useDashboardCashflowChart = () =>
  useQuery({ queryKey: ['dashboard', 'cashflow-chart'], queryFn: dashboardApi.getCashflowChart });

export const useDashboardCategoryChart = () =>
  useQuery({ queryKey: ['dashboard', 'category-chart'], queryFn: dashboardApi.getCategoryChart });

export const useDashboardRecentActivity = () =>
  useQuery({ queryKey: ['dashboard', 'recent-activity'], queryFn: dashboardApi.getRecentActivity });

export const useDashboardRecentTransactions = () =>
  useQuery({ queryKey: ['dashboard', 'recent-transactions'], queryFn: dashboardApi.getRecentTransactions });
