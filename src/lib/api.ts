const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Token store — set by AuthContext, read by request()
let _getToken: (() => string | null) | null = null;
let _refreshToken: (() => Promise<string | null>) | null = null;
let _onUnauthorized: (() => void) | null = null;

export function configureApi(opts: {
  getToken: () => string | null;
  refreshToken: () => Promise<string | null>;
  onUnauthorized: () => void;
}) {
  _getToken = opts.getToken;
  _refreshToken = opts.refreshToken;
  _onUnauthorized = opts.onUnauthorized;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const doRequest = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  let token = _getToken ? _getToken() : null;
  let response = await doRequest(token);

  if (response.status === 401 && _refreshToken) {
    const newToken = await _refreshToken();
    if (newToken) {
      response = await doRequest(newToken);
    } else {
      if (_onUnauthorized) _onUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `API Error: ${response.status} ${response.statusText}`);
  }

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

// Auth admin
export const authAdminApi = {
  setClientUserPassword: (userId: number, newPassword: string) =>
    request<void>(`/auth/admin/set-client-user-password?user_id=${userId}&new_password=${encodeURIComponent(newPassword)}`, { method: 'POST' }),
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

// Categories (scoped to client via query param)
export const categoriesApi = {
  getAll: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/category/${qs}`);
  },
  create: (data: any) => request<any>('/category/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/category/${id}`, { method: 'DELETE' }),
};

// Partners (scoped to client via query param)
export const partnersApi = {
  getAll: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/partner/${qs}`);
  },
  create: (data: any) => request<any>('/partner/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/partner/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/partner/${id}`, { method: 'DELETE' }),
};

// Cost Centers (scoped to client via query param)
export const costCentersApi = {
  getAll: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/cost-center/${qs}`);
  },
  create: (data: any) => request<any>('/cost-center/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/cost-center/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/cost-center/${id}`, { method: 'DELETE' }),
};

// Invoices (scoped to client via query param)
export const invoicesApi = {
  getAll: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/invoice/${qs}`);
  },
  create: (data: any) => request<any>('/invoice/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/invoice/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/invoice/${id}`, { method: 'DELETE' }),
};

// Transaction Status (scoped to client via query param)
export const transactionStatusApi = {
  getAll: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : '';
    return request<any[]>(`/transaction-status/${qs}`);
  },
  create: (data: any) => request<any>('/transaction-status/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/transaction-status/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/transaction-status/${id}`, { method: 'DELETE' }),
};

// Transactions
export const transactionsApi = {
  getAll: () => request<any[]>('/transactions/'),
  getByAccount: (accountId: number) => request<any[]>(`/transactions/${accountId}`),
  getById: (accountId: number, transactionId: number) => request<any>(`/transactions/${accountId}/${transactionId}`),
  create: (accountId: number, data: any) => request<any>(`/transactions/${accountId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (accountId: number, transactionId: number, data: any) => request<any>(`/transactions/${accountId}/${transactionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (accountId: number, transactionId: number) => request<void>(`/transactions/${accountId}/${transactionId}`, { method: 'DELETE' }),

  getByClient: (
    clientId: number,
    startDate?: string,
    endDate?: string,
  ) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('start_date', startDate);
    if (endDate)   qs.set('end_date',   endDate);
    const query = qs.toString() ? `?${qs}` : '';
    return request<any[]>(`/clients/${clientId}/transactions/${query}`);
  },
};
