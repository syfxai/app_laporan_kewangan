import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CalendarIcon } from './icons';
import Tooltip from './Tooltip';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, addTransaction, deleteTransaction, updateTransaction }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        // Filter by text search
        const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        // Filter by transaction type
        const typeMatch = filterType === 'all' || t.type === filterType;
        // Filter by category
        const categoryMatch = filterCategory === 'all' || t.categoryId === filterCategory;
        
        // Filter by date range
        let dateMatch = true;
        if (dateRange.start && dateRange.end) {
            dateMatch = t.date >= dateRange.start && t.date <= dateRange.end;
        } else if (dateRange.start) {
            dateMatch = t.date >= dateRange.start;
        } else if (dateRange.end) {
            dateMatch = t.date <= dateRange.end;
        }

        return searchMatch && typeMatch && categoryMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, dateRange]);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Anda pasti mahu memadam transaksi ini?")) {
      deleteTransaction(id);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const setDatePreset = (preset: 'this_month' | 'this_year' | 'all') => {
      const today = new Date();
      if (preset === 'this_month') {
          const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
          setDateRange({ start, end });
      } else if (preset === 'this_year') {
          const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          const end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
          setDateRange({ start, end });
      } else if (preset === 'all') {
          setDateRange({ start: '', end: '' });
      }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Semua Transaksi</h2>
        <button onClick={handleAddClick} className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md">
          <PlusIcon />
          <span>Tambah Rekod Baru</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
            <input
                type="text"
                placeholder="Cari keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-gray-400" />
            </div>
            </div>

            <div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">Semua Jenis</option>
                <option value={TransactionType.INCOME}>Masuk</option>
                <option value={TransactionType.EXPENSE}>Keluar</option>
            </select>
            </div>
            
            <div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
                <label className="text-xs text-gray-500 dark:text-gray-400">Dari Tarikh:</label>
                <input type="date" name="start" value={dateRange.start} onChange={handleDateRangeChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                <div className="absolute bottom-2.5 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="text-gray-400" />
                </div>
            </div>
            <div className="relative">
                <label className="text-xs text-gray-500 dark:text-gray-400">Hingga Tarikh:</label>
                <input type="date" name="end" value={dateRange.end} onChange={handleDateRangeChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                 <div className="absolute bottom-2.5 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="text-gray-400" />
                </div>
            </div>
            <div className="lg:col-span-2 flex gap-2 justify-start md:justify-end">
                <button onClick={() => setDatePreset('this_month')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600">Bulan Ini</button>
                <button onClick={() => setDatePreset('this_year')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600">Tahun Ini</button>
                <button onClick={() => setDatePreset('all')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600">Semua</button>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 uppercase">
              <th className="py-3 px-4 font-semibold">Tarikh</th>
              <th className="py-3 px-4 font-semibold">Keterangan</th>
              <th className="py-3 px-4 font-semibold hidden md:table-cell">Jenis</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Kategori</th>
              <th className="py-3 px-4 font-semibold text-right">Jumlah (RM)</th>
              <th className="py-3 px-4 font-semibold text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
              <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4">{t.date}</td>
                <td className="py-3 px-4">{t.description}</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {t.type === 'income' ? 'Masuk' : 'Keluar'}
                  </span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">{categoryMap.get(t.categoryId) || 'N/A'}</td>
                <td className={`py-3 px-4 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <Tooltip text="Kemaskini">
                          <button onClick={() => handleEditClick(t)} className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"><EditIcon /></button>
                        </Tooltip>
                        <Tooltip text="Padam">
                          <button onClick={() => handleDeleteClick(t.id)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300"><TrashIcon /></button>
                        </Tooltip>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Tiada transaksi yang sepadan dengan carian anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <TransactionForm 
          categories={categories}
          onSubmit={(data) => {
            if (editingTransaction) {
              updateTransaction({ ...editingTransaction, ...data });
            } else {
              addTransaction(data);
            }
            setModalOpen(false);
          }}
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
};

export default TransactionList;