
export type UserRole = "accountant" | "client-admin" | "client-user";

// Backend Status enum: 0=INACTIVE, 1=ACTIVE, 2=SUSPENDED, 99=DELETED
export enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
  DELETED = 99,
}

export interface ClientCreate {
  taxId: string;
  companyName: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  fiscalYearEnd: string;
  status: Status;
}

export interface ClientResponse {
  id: number;
  tax_id: string;
  company_name: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  fiscal_year_end: string;
  status: Status;
}

export interface CompanyUser {
  name: string;
  email: string;
  is_admin: boolean;
  status: Status;
}

export interface AccountType {
  name: string;
  status: Status;
}

export interface AccountCurrency {
  code: string;
  name: string;
  status: Status;
}

export interface Account {
  id?: number;
  name: string;
  institution: string;
  account_type_id: number;
  account_currency_id: number;
  client_id: number;
  status: Status;
}

export interface AccountBalance {
  account_id: number;
  balance: number;
  status: Status;
  dt_created: string;
}

export type CategoryType = "expense" | "income";

export interface Category {
  id: number;
  client_id: number;
  name: string;
  description?: string;
  type: CategoryType;
  status: Status;
}

export interface TransactionStatus {
  id: number;
  client_id: number;
  name: string;
  description?: string;
  status: Status;
}

export interface Partner {
  id: number;
  name: string;
  contact_info?: string;
  status: Status;
}

export interface CostCenter {
  id: number;
  name: string;
  description?: string;
  status: Status;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount: number;
  status: Status;
}

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  categoryId: number;
  financialAccountId: number;
  transactionStatusId: number;
  partnerId?: number;
  costCenterId?: number;
  invoiceId?: number;
  status: Status;
}

// Legacy types kept for compatibility
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  industry?: string;
  status: Status;
  fiscalYearEnd?: string;
}

export interface ClientCompany {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  industry: string;
  fiscalYear: string;
  taxId?: string;
  status: Status;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  url?: string;
  size?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string;
}
