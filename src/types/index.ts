
export type UserRole = "accountant" | "client-admin" | "client-user";

export interface Account {
  id: string;
  name: string;
  type: string;
  institution?: string;
  balance?: number;
  currency?: string;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  description?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string | Date;
  dueDate: string | Date;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  partnerId: string;
  description?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  description: string;
  type: "income" | "expense" | "transfer";
  accountId: string;
  categoryId: string;
  costCenterId?: string;
  partnerId?: string;
  notes?: string;
  status?: "completed" | "pending";
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  industry?: string;
  status: "active" | "inactive";
  createdAt: string;
  notes?: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  accountantId: string;
  fiscalYear: string;
  industry: string;
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
