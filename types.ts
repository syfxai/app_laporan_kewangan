export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type TransactionStatus = 'cleared' | 'pending';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  description: string;
  amount: number;
  categoryId: string;
  status: TransactionStatus;
}

export interface Category {
  id: string;
  name: string;
}

export type View = 'dashboard' | 'transactions' | 'reports';
