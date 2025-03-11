
// User roles
export type UserRole = 'accountant' | 'client';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
}

// Company types
export interface AccountingCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountantId: string;
  fiscalYear: string;
  industry: string;
}

// Financial types
export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'other';
  institution?: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  companyId: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer' | 'other';
  companyId: string;
}

export interface CostCenter {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'company' | 'person';
  identifier: string; // Tax ID, SSN, etc.
  email?: string;
  phone?: string;
  companyId: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  categoryId: string;
  costCenterId?: string;
  partnerId?: string;
  documentIds?: string[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  transactionId: string;
  companyId: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  partnerId: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  companyId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Dashboard types
export interface CashflowData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CashflowReport {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    startingBalance: number;
    endingBalance: number;
  };
  data: CashflowData[];
}
