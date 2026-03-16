import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Generic CRUD hook factory
function useCrudHooks(key: string, api: any) {
  const queryClient = useQueryClient();

  const useGetAll = () => useQuery({ queryKey: [key], queryFn: api.getAll });
  const useGetById = (id: string) => useQuery({ queryKey: [key, id], queryFn: () => api.getById(id), enabled: !!id });

  const useCreate = () => useMutation({
    mutationFn: api.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  const useUpdate = () => useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  const useDelete = () => useMutation({
    mutationFn: api.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });

  return { useGetAll, useGetById, useCreate, useUpdate, useDelete };
}

// Resource hooks
export const useAccounts = () => useCrudHooks('accounts', accountsApi);
export const useCategories = () => useCrudHooks('categories', categoriesApi);
export const useCostCenters = () => useCrudHooks('costCenters', costCentersApi);
export const usePartners = () => useCrudHooks('partners', partnersApi);
export const useInvoices = () => useCrudHooks('invoices', invoicesApi);
export const useTransactions = () => useCrudHooks('transactions', transactionsApi);
export const useClients = () => useCrudHooks('clients', clientsApi);
export const useClientCompanies = () => useCrudHooks('clientCompanies', clientCompaniesApi);

// Import CSV mutations
export const useImportInvoicesCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.importCSV,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
};

export const useImportTransactionsCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.importCSV,
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
