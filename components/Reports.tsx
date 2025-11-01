import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { DownloadIcon, PrinterIcon } from './icons';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
}

const Reports: React.FC<ReportsProps> = ({ transactions, categories }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1);

  const years = useMemo(() => {
    const transactionYears = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    // FIX: Explicitly cast to Number to prevent type errors during arithmetic operation in sort.
    return Array.from(new Set([currentYear, ...transactionYears])).sort((a,b) => Number(b) - Number(a));
  }, [transactions, currentYear]);

  const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Mac' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Julai' }, { value: 8, name: 'Ogos' }, { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Disember' }
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const yearMatch = date.getFullYear() === selectedYear;
      const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1) === selectedMonth;
      return yearMatch && monthMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedYear, selectedMonth]);

  const reportPeriod = useMemo(() => {
    if (selectedMonth === 'all') {
      return `Tahun ${selectedYear}`;
    }
    const monthName = months.find(m => m.value === selectedMonth)?.name || '';
    return `${monthName} ${selectedYear}`;
  }, [selectedYear, selectedMonth, months]);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  
  const analysis = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [filteredTransactions]);

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      alert('Tiada data untuk dieksport.');
      return;
    }
    exportToPDF(filteredTransactions, categories, reportPeriod);
  };
  
  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      alert('Tiada data untuk dieksport.');
      return;
    }
    exportToExcel(filteredTransactions, categories, reportPeriod);
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg" data-tutorial="step-6">
      <h2 className="text-2xl font-bold mb-6">Jana Laporan Kewangan</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun:</label>
          <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="w-full sm:w-48 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bulan:</label>
          <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} className="w-full sm:w-48 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">Sepanjang Tahun</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
        </div>
      </div>
      
      {/* Report View */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h3 className="text-xl font-semibold">Laporan untuk: {reportPeriod}</h3>
                <p className="text-gray-500 dark:text-gray-400">Dihasilkan pada: {new Date().toLocaleDateString('ms-MY')}</p>
            </div>
          <div className="flex gap-2 mt-4 sm:mt-0" data-tutorial="step-7">
            <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              <PrinterIcon />
              <span>Export PDF</span>
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              <DownloadIcon />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300">Jumlah Masuk</h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">RM {analysis.totalIncome.toFixed(2)}</p>
            </div>
             <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300">Jumlah Keluar</h4>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">RM {analysis.totalExpense.toFixed(2)}</p>
            </div>
             <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">Baki</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">RM {analysis.balance.toFixed(2)}</p>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 uppercase">
                <th className="py-3 px-4 font-semibold">Tarikh</th>
                <th className="py-3 px-4 font-semibold">Keterangan</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold text-right">Masuk (RM)</th>
                <th className="py-3 px-4 font-semibold text-right">Keluar (RM)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">{t.date}</td>
                  <td className="py-3 px-4">{t.description}</td>
                  <td className="py-3 px-4">{categoryMap.get(t.categoryId) || 'N/A'}</td>
                  <td className="py-3 px-4 text-right text-green-600">
                    {t.type === TransactionType.INCOME ? t.amount.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600">
                    {t.type === TransactionType.EXPENSE ? t.amount.toFixed(2) : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Tiada transaksi untuk tempoh ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;