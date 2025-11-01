import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, TransactionStatus } from '../types';
import Tooltip from './Tooltip';
import { InformationCircleIcon, ChevronDownIcon } from './icons';

type TransactionFormData = Omit<Transaction, 'id'>;

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ categories, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.EXPENSE,
    description: '',
    amount: 0,
    categoryId: categories[0]?.id || '',
    status: 'cleared',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        type: initialData.type,
        description: initialData.description,
        amount: initialData.amount,
        categoryId: initialData.categoryId,
        status: initialData.status || 'cleared', // Default to cleared for old data
      });
    } else {
        // Reset form for new entry
        setFormData({
            date: new Date().toISOString().split('T')[0],
            type: TransactionType.EXPENSE,
            description: '',
            amount: 0,
            categoryId: categories[0]?.id || '',
            status: 'cleared',
        });
    }
  }, [initialData, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };
  
  const handleTypeChange = (type: TransactionType) => {
      setFormData(prev => ({...prev, type}));
  }

  const handleStatusChange = (status: TransactionStatus) => {
      setFormData(prev => ({...prev, status}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
        alert("Jumlah mesti lebih besar dari 0.");
        return;
    }
    if (!formData.description.trim()) {
        alert("Sila masukkan keterangan.");
        return;
    }
     if (!formData.categoryId) {
        alert("Sila pilih kategori.");
        return;
    }
    onSubmit(formData);
  };
  
  const inputBaseClasses = "block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900";
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{initialData ? 'Kemaskini Transaksi' : 'Tambah Transaksi Baru'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Transaksi</label>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 text-sm ${formData.type === TransactionType.INCOME ? 'bg-white dark:bg-slate-800 shadow text-green-600' : 'text-slate-600 dark:text-slate-300'}`}>
                    Duit Masuk
                </button>
                <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 text-sm ${formData.type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-800 shadow text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
                    Duit Keluar
                </button>
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <button type="button" onClick={() => handleStatusChange('cleared')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 text-sm ${formData.status === 'cleared' ? 'bg-white dark:bg-slate-800 shadow text-green-600' : 'text-slate-600 dark:text-slate-300'}`}>
                    Lunas
                </button>
                <button type="button" onClick={() => handleStatusChange('pending')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 text-sm ${formData.status === 'pending' ? 'bg-white dark:bg-slate-800 shadow text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}>
                    Belum Lunas
                </button>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah (RM)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount === 0 ? '' : formData.amount}
            placeholder="0.00"
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className={`${inputBaseClasses} mt-1`}
          />
        </div>
         <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tarikh</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={`${inputBaseClasses} mt-1`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Keterangan
            <Tooltip text="Contoh: Bayaran sewa pejabat, sumbangan dari syarikat ABC.">
                <InformationCircleIcon className="text-slate-400" />
            </Tooltip>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Cth: Bayaran bil elektrik"
          className={`${inputBaseClasses} mt-1`}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</label>
        <div className="relative mt-1">
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className={`${inputBaseClasses} appearance-none pr-8`}
            >
              <option value="" disabled>-- Sila pilih kategori --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDownIcon />
            </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-all duration-200 transform hover:-translate-y-px">
          {initialData ? 'Simpan Perubahan' : 'Tambah Rekod'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;