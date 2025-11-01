
import { Transaction, TransactionType } from '../types';

export const generateSampleData = (): Transaction[] => {
  const sampleTransactions: Omit<Transaction, 'id'>[] = [
    { date: '2023-10-25', type: TransactionType.INCOME, description: 'Sumbangan Ahli Bulanan', amount: 1500, categoryId: '5' },
    { date: '2023-10-28', type: TransactionType.EXPENSE, description: 'Bayaran bil elektrik & air', amount: 250, categoryId: '1' },
    { date: '2023-11-01', type: TransactionType.EXPENSE, description: 'Bayaran sewa pejabat', amount: 800, categoryId: '3' },
    { date: '2023-11-05', type: TransactionType.INCOME, description: 'Dana dari program amal', amount: 3200, categoryId: '5' },
    { date: '2023-11-15', type: TransactionType.EXPENSE, description: 'Belian peralatan untuk acara', amount: 550, categoryId: '4' },
    { date: '2023-11-20', type: TransactionType.EXPENSE, description: 'Gaji pekerja', amount: 1200, categoryId: '2' },
    { date: '2023-11-25', type: TransactionType.INCOME, description: 'Sumbangan ahli', amount: 500, categoryId: '5' },
    { date: '2023-12-01', type: TransactionType.EXPENSE, description: 'Bayaran sewa pejabat', amount: 800, categoryId: '3' },
    { date: '2023-12-10', type: TransactionType.EXPENSE, description: 'Jamuan akhir tahun', amount: 700, categoryId: '4' },
    { date: '2023-12-20', type: TransactionType.EXPENSE, description: 'Gaji pekerja', amount: 1200, categoryId: '2' },
  ];

  return sampleTransactions.map(t => ({...t, id: crypto.randomUUID()})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
