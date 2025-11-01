import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType, TransactionStatus } from '../types';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from './icons';
import Tooltip from './Tooltip';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
    const isCleared = status === 'cleared';
    const bgColor = isCleared ? 'bg-green-100 dark:bg-green-500/10' : 'bg-amber-100 dark:bg-amber-500/10';
    const textColor = isCleared ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300';
    const Icon = isCleared ? CheckCircleIcon : ClockIcon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{isCleared ? 'Lunas' : 'Belum Lunas'}</span>
        </div>
    );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, addTransaction, deleteTransaction, updateTransaction }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TransactionStatus>('all');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (categoryMap.get(t.categoryId) || '').toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = filterType === 'all' || t.type === filterType;
        const categoryMatch = filterCategory === 'all' || t.categoryId === filterCategory;
        const statusMatch = filterStatus === 'all' || t.status === filterStatus;
        
        let dateMatch = true;
        if (dateRange.start && dateRange.end) {
            dateMatch = t.date >= dateRange.start && t.date <= dateRange.end;
        } else if (dateRange.start) {
            dateMatch = t.date >= dateRange.start;
        } else if (dateRange.end) {
            dateMatch = t.date <= dateRange.end;
        }

        return searchMatch && typeMatch && categoryMatch && statusMatch && dateMatch;
      });
  }, [transactions, searchTerm, filterType, filterCategory, filterStatus, dateRange, categoryMap]);

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
  
  const InputField: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => (
      <div className={`w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 flex items-center gap-2 ${className}`}>
        {children}
      </div>
  );
  
  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Semua Transaksi</h2>
        <button onClick={handleAddClick} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-px">
          <PlusIcon />
          <span className="font-semibold text-sm">Tambah Rekod Baru</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="md:col-span-3 lg:col-span-2">
                <InputField>
                    <SearchIcon className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari keterangan atau kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent focus:outline-none"
                    />
                </InputField>
            </div>
            
            <InputField>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full bg-transparent focus:outline-none appearance-none">
                    <option value="all">Semua Status</option>
                    <option value={'cleared'}>Lunas</option>
                    <option value={'pending'}>Belum Lunas</option>
                </select>
            </InputField>

            <InputField>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full bg-transparent focus:outline-none appearance-none">
                    <option value="all">Semua Jenis</option>
                    <option value={TransactionType.INCOME}>Masuk</option>
                    <option value={TransactionType.EXPENSE}>Keluar</option>
                </select>
            </InputField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
             <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Kategori</label>
                <InputField>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent focus:outline-none appearance-none">
                        <option value="all">Semua Kategori</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </InputField>
            </div>
            <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Dari Tarikh</label>
                <InputField>
                    <CalendarIcon className="text-slate-400" />
                    <input type="date" name="start" value={dateRange.start} onChange={handleDateRangeChange} className="w-full bg-transparent focus:outline-none"/>
                </InputField>
            </div>
            <div>
                 <label className="text-xs text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Hingga Tarikh</label>
                <InputField>
                    <CalendarIcon className="text-slate-400" />
                    <input type="date" name="end" value={dateRange.end} onChange={handleDateRangeChange} className="w-full bg-transparent focus:outline-none"/>
                </InputField>
            </div>
            <div className="flex gap-2 justify-start md:justify-end">
                <button onClick={() => setDatePreset('this_month')} className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">Bulan Ini</button>
                <button onClick={() => setDatePreset('this_year')} className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">Tahun Ini</button>
                <button onClick={() => setDatePreset('all')} className="px-3 py-2 text-sm bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">Semua</button>
            </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase">
              <th className="py-3 px-4 font-semibold">Tarikh</th>
              <th className="py-3 px-4 font-semibold">Keterangan</th>
              <th className="py-3 px-4 font-semibold hidden lg:table-cell">Status</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Kategori</th>
              <th className="py-3 px-4 font-semibold text-right">Jumlah (RM)</th>
              <th className="py-3 px-4 font-semibold text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
              <tr key={t.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                <td className="py-3 px-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                  <div>{t.description}</div>
                  <div className="md:hidden mt-1">
                     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300'}`}>
                        {t.type === 'income' ? 'Masuk' : 'Keluar'}
                     </span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell"><StatusBadge status={t.status} /></td>
                <td className="py-3 px-4 hidden sm:table-cell">{categoryMap.get(t.categoryId) || 'N/A'}</td>
                <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('ms-MY', {minimumFractionDigits: 2})}
                </td>
                <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                        <Tooltip text="Kemaskini">
                          <button onClick={() => handleEditClick(t)} className="p-2 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 dark:hover:text-blue-400 dark:hover:bg-slate-700/60"><EditIcon /></button>
                        </Tooltip>
                        <Tooltip text="Padam">
                          <button onClick={() => handleDeleteClick(t.id)} className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-slate-200/60 dark:hover:text-red-400 dark:hover:bg-slate-700/60"><TrashIcon /></button>
                        </Tooltip>
                    </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-lg">Tiada Transaksi Ditemui</p>
                  <p className="text-sm mt-1">Cuba laraskan penapis carian anda.</p>
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
