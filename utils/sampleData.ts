import { Transaction, TransactionType } from '../types';

export const generateSampleData = (): Transaction[] => {
  const sampleTransactions: Omit<Transaction, 'id'>[] = [
    // 2024 Data
    { date: '2024-01-15', type: TransactionType.INCOME, description: 'Sumbangan Tahun Baru', amount: 2000, categoryId: '5', status: 'cleared' },
    { date: '2024-02-10', type: TransactionType.EXPENSE, description: 'Bayaran internet & telefon', amount: 300, categoryId: '1', status: 'cleared' },
    
    // 2023 Full Year Data
    { date: '2023-01-20', type: TransactionType.INCOME, description: 'Geran Awal Tahun', amount: 5000, categoryId: '5', status: 'cleared' },
    { date: '2023-02-15', type: TransactionType.EXPENSE, description: 'Gaji pekerja (Feb)', amount: 1200, categoryId: '2', status: 'cleared' },
    { date: '2023-03-05', type: TransactionType.EXPENSE, description: 'Cenderahati penceramah', amount: 350, categoryId: '4', status: 'cleared' },
    { date: '2023-04-10', type: TransactionType.INCOME, description: 'Kutipan Pesta Amal', amount: 2800, categoryId: '4', status: 'cleared' },
    { date: '2023-05-18', type: TransactionType.EXPENSE, description: 'Penyelenggaraan penghawa dingin', amount: 450, categoryId: '1', status: 'pending' },
    { date: '2023-06-25', type: TransactionType.EXPENSE, description: 'Bayaran sewa (Jun)', amount: 800, categoryId: '3', status: 'cleared' },
    { date: '2023-07-08', type: TransactionType.INCOME, description: 'Sumbangan syarikat', amount: 1500, categoryId: '5', status: 'cleared' },
    { date: '2023-08-11', type: TransactionType.EXPENSE, description: 'Percetakan bahan mesyuarat', amount: 150, categoryId: '6', status: 'cleared' },
    { date: '2023-09-22', type: TransactionType.EXPENSE, description: 'Pembelian perisian', amount: 600, categoryId: '6', status: 'pending' },
    { date: '2023-10-25', type: TransactionType.INCOME, description: 'Sumbangan Ahli Bulanan', amount: 1500, categoryId: '5', status: 'cleared' },
    { date: '2023-10-28', type: TransactionType.EXPENSE, description: 'Bayaran bil elektrik & air', amount: 250, categoryId: '1', status: 'cleared' },
    { date: '2023-11-01', type: TransactionType.EXPENSE, description: 'Bayaran sewa pejabat', amount: 800, categoryId: '3', status: 'cleared' },
    { date: '2023-11-05', type: TransactionType.INCOME, description: 'Dana dari program amal', amount: 3200, categoryId: '5', status: 'cleared' },
    { date: '2023-11-15', type: TransactionType.EXPENSE, description: 'Belian peralatan untuk acara', amount: 550, categoryId: '4', status: 'cleared' },
    { date: '2023-11-20', type: TransactionType.EXPENSE, description: 'Gaji pekerja', amount: 1200, categoryId: '2', status: 'pending' },
    { date: '2023-11-25', type: TransactionType.INCOME, description: 'Sumbangan ahli', amount: 500, categoryId: '5', status: 'cleared' },
    { date: '2023-12-01', type: TransactionType.EXPENSE, description: 'Bayaran sewa pejabat', amount: 800, categoryId: '3', status: 'cleared' },
    { date: '2023-12-10', type: TransactionType.EXPENSE, description: 'Jamuan akhir tahun', amount: 700, categoryId: '4', status: 'cleared' },
    { date: '2023-12-20', type: TransactionType.EXPENSE, description: 'Gaji pekerja', amount: 1200, categoryId: '2', status: 'cleared' },
  ];

  return sampleTransactions.map(t => ({...t, id: crypto.randomUUID()})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};