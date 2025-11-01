
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  description: string;
  amount: number;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export type View = 'dashboard' | 'transactions' | 'reports';

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}
