import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clientsApi,
  clientUsersApi,
  accountTypesApi,
  accountCurrenciesApi,
  accountsApi,
  accountBalanceApi,
  categoriesApi,
  partnersApi,
  costCentersApi,
  invoicesApi,
  transactionStatusApi,
  transactionsApi,
} from '@/lib/api';

// --- Clients ---
export const useClients = () => {
  const queryClient = useQueryClient();
  return {
    useGetAll: () => useQuery({ queryKey: ['clients'], queryFn: clientsApi.getAll }),
    useGetById: (id: number) => useQuery({ queryKey: ['clients', id], queryFn: () => clientsApi.getById(id), enabled: !!id }),
    useCreate: () => useMutation({
      mutationFn: (data: any) => clientsApi.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    }),
    useUpdate: () => useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) => clientsApi.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    }),
    useDelete: () => useMutation({
      mutationFn: (id: number) => clientsApi.delete(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    }),
  };
};

// --- Client Users ---
export const useClientUsers = (clientId: number) => {
  const queryClient = useQueryClient();
  return {
    useGetAll: () => useQuery({ queryKey: ['clientUsers', clientId], queryFn: () => clientUsersApi.getAll(clientId), enabled: !!clientId }),
    useCreate: () => useMutation({
      mutationFn: (data: any) => clientUsersApi.create(clientId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientUsers', clientId] }),
    }),
    useUpdate: () => useMutation({
      mutationFn: ({ userId, data }: { userId: number; data: any }) => clientUsersApi.update(clientId, userId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientUsers', clientId] }),
    }),
    useDelete: () => useMutation({
      mutationFn: (userId: number) => clientUsersApi.delete(clientId, userId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientUsers', clientId] }),
    }),
  };
};

// --- Client-scoped CRUD hook factory ---
function useClientScopedCrud(key: string, api: {
  getAll: (clientId?: number) => Promise<any[]>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<void>;
}, clientId?: number) {
  const queryClient = useQueryClient();
  return {
    useGetAll: () => useQuery({
      queryKey: [key, clientId],
      queryFn: () => api.getAll(clientId),
    }),
    useCreate: () => useMutation({
      mutationFn: (data: any) => api.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key, clientId] }),
    }),
    useUpdate: () => useMutation({
      mutationFn: ({ id, data }: { id: number; data: any }) => api.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key, clientId] }),
    }),
    useDelete: () => useMutation({
      mutationFn: (id: number) => api.delete(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key, clientId] }),
    }),
  };
}

export const useCategories = (clientId?: number) => useClientScopedCrud('categories', categoriesApi, clientId);
export const usePartners = (clientId?: number) => useClientScopedCrud('partners', partnersApi, clientId);
export const useCostCenters = (clientId?: number) => useClientScopedCrud('costCenters', costCentersApi, clientId);
export const useInvoices = (clientId?: number) => useClientScopedCrud('invoices', invoicesApi, clientId);
export const useTransactionStatuses = (clientId?: number) => useClientScopedCrud('transactionStatuses', transactionStatusApi, clientId);

// --- Financial Accounts (scoped to client) ---
export const useAccounts = (clientId: number) => {
  const queryClient = useQueryClient();
  return {
    useGetAll: () => useQuery({
      queryKey: ['accounts', clientId],
      queryFn: () => accountsApi.getAll(clientId),
      enabled: !!clientId,
    }),
    useGetById: (accountId: number) => useQuery({
      queryKey: ['accounts', clientId, accountId],
      queryFn: () => accountsApi.getById(clientId, accountId),
      enabled: !!clientId && !!accountId,
    }),
    useCreate: () => useMutation({
      mutationFn: (data: any) => accountsApi.create(clientId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', clientId] }),
    }),
    useUpdate: () => useMutation({
      mutationFn: ({ accountId, data }: { accountId: number; data: any }) =>
        accountsApi.update(clientId, accountId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', clientId] }),
    }),
    useDelete: () => useMutation({
      mutationFn: (accountId: number) => accountsApi.delete(clientId, accountId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', clientId] }),
    }),
  };
};

// --- Account Balance ---
export const useAccountBalances = (accountId?: number) => {
  const queryClient = useQueryClient();
  return {
    useGetAll: () => useQuery({
      queryKey: ['accountBalances', accountId],
      queryFn: () => accountId ? accountBalanceApi.getByAccount(accountId) : accountBalanceApi.getAll(),
    }),
    useCreate: () => useMutation({
      mutationFn: (data: any) => accountBalanceApi.create(accountId!, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accountBalances'] }),
    }),
  };
};

// --- Transactions ---
// When clientId is provided the hook fetches from /clients/{clientId}/transactions/
// (all accounts for that client). When accountId is provided it fetches by account.
// When neither is provided it fetches all transactions.
export const useTransactions = (clientId?: number, accountId?: number) => {
  const queryClient = useQueryClient();

  const queryKey = clientId
    ? ['transactions', 'client', clientId]
    : accountId
    ? ['transactions', 'account', accountId]
    : ['transactions'];

  const queryFn = () => {
    if (clientId) return transactionsApi.getByClient(clientId);
    if (accountId) return transactionsApi.getByAccount(accountId);
    return transactionsApi.getAll();
  };

  return {
    useGetAll: () => useQuery({ queryKey, queryFn }),
    useCreate: () => useMutation({
      mutationFn: ({ acctId, data }: { acctId: number; data: any }) => transactionsApi.create(acctId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    }),
    useUpdate: () => useMutation({
      mutationFn: ({ acctId, transactionId, data }: { acctId: number; transactionId: number; data: any }) =>
        transactionsApi.update(acctId, transactionId, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    }),
    useDelete: () => useMutation({
      mutationFn: ({ acctId, transactionId }: { acctId: number; transactionId: number }) =>
        transactionsApi.delete(acctId, transactionId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    }),
  };
};
