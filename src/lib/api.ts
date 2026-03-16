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

  return response.json();
}

// Accounts
export const accountsApi = {
  getAll: () => request<any[]>('/accounts'),
  getById: (id: string) => request<any>(`/accounts/${id}`),
  create: (data: any) => request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/accounts/${id}`, { method: 'DELETE' }),
};

// Categories
export const categoriesApi = {
  getAll: () => request<any[]>('/categories'),
  getById: (id: string) => request<any>(`/categories/${id}`),
  create: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// Cost Centers
export const costCentersApi = {
  getAll: () => request<any[]>('/cost-centers'),
  getById: (id: string) => request<any>(`/cost-centers/${id}`),
  create: (data: any) => request<any>('/cost-centers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/cost-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/cost-centers/${id}`, { method: 'DELETE' }),
};

// Partners
export const partnersApi = {
  getAll: () => request<any[]>('/partners'),
  getById: (id: string) => request<any>(`/partners/${id}`),
  create: (data: any) => request<any>('/partners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/partners/${id}`, { method: 'DELETE' }),
};

// Invoices
export const invoicesApi = {
  getAll: () => request<any[]>('/invoices'),
  getById: (id: string) => request<any>(`/invoices/${id}`),
  create: (data: any) => request<any>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/invoices/${id}`, { method: 'DELETE' }),
  importCSV: (data: any[]) => request<any[]>('/invoices/import', { method: 'POST', body: JSON.stringify(data) }),
};

// Transactions
export const transactionsApi = {
  getAll: () => request<any[]>('/transactions'),
  getById: (id: string) => request<any>(`/transactions/${id}`),
  create: (data: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  importCSV: (data: any[]) => request<any[]>('/transactions/import', { method: 'POST', body: JSON.stringify(data) }),
};

// Clients
export const clientsApi = {
  getAll: () => request<any[]>('/clients'),
  getById: (id: string) => request<any>(`/clients/${id}`),
  create: (data: any) => request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
};

// Client Companies (for accountant view)
export const clientCompaniesApi = {
  getAll: () => request<any[]>('/client-companies'),
  getById: (id: string) => request<any>(`/client-companies/${id}`),
  create: (data: any) => request<any>('/client-companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/client-companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/client-companies/${id}`, { method: 'DELETE' }),
};

// Cashflow
export const cashflowApi = {
  getData: (period?: string) => request<any[]>(`/cashflow${period ? `?period=${period}` : ''}`),
  getSummary: () => request<any>('/cashflow/summary'),
};

// Dashboard
export const dashboardApi = {
  getStats: (userRole: string) => request<any>(`/dashboard/stats?role=${userRole}`),
  getCashflowChart: () => request<any[]>('/dashboard/cashflow-chart'),
  getCategoryChart: () => request<any[]>('/dashboard/category-chart'),
  getRecentActivity: () => request<any[]>('/dashboard/recent-activity'),
  getRecentTransactions: () => request<any[]>('/dashboard/recent-transactions'),
};
