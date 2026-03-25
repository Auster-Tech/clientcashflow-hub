const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Clients
export const clientsApi = {
  getAll: () => request<any[]>('/clients/'),
  getById: (id: number) => request<any>(`/clients/${id}`),
  create: (data: any) => request<any>('/clients/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
};

// Client Users
export const clientUsersApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/users/`),
  getById: (clientId: number, userId: number) => request<any>(`/clients/${clientId}/users/${userId}`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/users/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, userId: number, data: any) => request<any>(`/clients/${clientId}/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, userId: number) => request<void>(`/clients/${clientId}/users/${userId}`, { method: 'DELETE' }),
};

// Account Types
export const accountTypesApi = {
  getAll: () => request<any[]>('/account-types/'),
  create: (data: any) => request<any>('/account-types/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/account-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/account-types/${id}`, { method: 'DELETE' }),
};

// Account Currencies
export const accountCurrenciesApi = {
  getAll: () => request<any[]>('/account-currencies/'),
  create: (data: any) => request<any>('/account-currencies/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/account-currencies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/account-currencies/${id}`, { method: 'DELETE' }),
};

// Financial Accounts (scoped to client)
export const accountsApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/accounts/`),
  getById: (clientId: number, accountId: number) => request<any>(`/clients/${clientId}/accounts/${accountId}`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/accounts/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, accountId: number, data: any) => request<any>(`/clients/${clientId}/accounts/${accountId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, accountId: number) => request<void>(`/clients/${clientId}/accounts/${accountId}`, { method: 'DELETE' }),
};

// Account Balance
export const accountBalanceApi = {
  getAll: () => request<any[]>('/account-balance/'),
  getByAccount: (accountId: number) => request<any[]>(`/account-balance/${accountId}`),
  getById: (accountId: number, balanceId: number) => request<any>(`/account-balance/${accountId}/${balanceId}`),
  create: (accountId: number, data: any) => request<any>(`/account-balance/${accountId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (accountId: number, balanceId: number, data: any) => request<any>(`/account-balance/${accountId}/${balanceId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (accountId: number, balanceId: number) => request<void>(`/account-balance/${accountId}/${balanceId}`, { method: 'DELETE' }),
};

// Categories (scoped to client)
export const categoriesApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/category/`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/category/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, id: number, data: any) => request<any>(`/clients/${clientId}/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, id: number) => request<void>(`/clients/${clientId}/category/${id}`, { method: 'DELETE' }),
};

// Partners (scoped to client)
export const partnersApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/partner/`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/partner/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, id: number, data: any) => request<any>(`/clients/${clientId}/partner/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, id: number) => request<void>(`/clients/${clientId}/partner/${id}`, { method: 'DELETE' }),
};

// Cost Centers (scoped to client)
export const costCentersApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/cost-center/`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/cost-center/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, id: number, data: any) => request<any>(`/clients/${clientId}/cost-center/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, id: number) => request<void>(`/clients/${clientId}/cost-center/${id}`, { method: 'DELETE' }),
};

// Invoices (scoped to client)
export const invoicesApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/invoice/`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/invoice/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, id: number, data: any) => request<any>(`/clients/${clientId}/invoice/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, id: number) => request<void>(`/clients/${clientId}/invoice/${id}`, { method: 'DELETE' }),
};

// Transaction Status (scoped to client)
export const transactionStatusApi = {
  getAll: (clientId: number) => request<any[]>(`/clients/${clientId}/transaction-status/`),
  create: (clientId: number, data: any) => request<any>(`/clients/${clientId}/transaction-status/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (clientId: number, id: number, data: any) => request<any>(`/clients/${clientId}/transaction-status/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (clientId: number, id: number) => request<void>(`/clients/${clientId}/transaction-status/${id}`, { method: 'DELETE' }),
};

// Transactions (scoped to account)
export const transactionsApi = {
  getAll: () => request<any[]>('/transactions/'),
  getByAccount: (accountId: number) => request<any[]>(`/transactions/${accountId}`),
  getById: (accountId: number, transactionId: number) => request<any>(`/transactions/${accountId}/${transactionId}`),
  create: (accountId: number, data: any) => request<any>(`/transactions/${accountId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (accountId: number, transactionId: number, data: any) => request<any>(`/transactions/${accountId}/${transactionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (accountId: number, transactionId: number) => request<void>(`/transactions/${accountId}/${transactionId}`, { method: 'DELETE' }),
};
