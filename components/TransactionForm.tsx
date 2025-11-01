
import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import Tooltip from './Tooltip';
import { InformationCircleIcon } from './icons';

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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        type: initialData.type,
        description: initialData.description,
        amount: initialData.amount,
        categoryId: initialData.categoryId,
      });
    } else {
        // Reset form for new entry
        setFormData({
            date: new Date().toISOString().split('T')[0],
            type: TransactionType.EXPENSE,
            description: '',
            amount: 0,
            categoryId: categories[0]?.id || '',
        });
    }
  }, [initialData, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };
  
  const handleTypeChange = (type: TransactionType) => {
      setFormData(prev => ({...prev, type}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
        alert("Jumlah mesti lebih besar dari 0.");
        return;
    }
    if (!formData.description) {
        alert("Sila masukkan keterangan.");
        return;
    }
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{initialData ? 'Kemaskini Transaksi' : 'Tambah Transaksi Baru'}</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Transaksi</label>
        <div className="flex gap-4">
            <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${formData.type === TransactionType.INCOME ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
                Duit Masuk
            </button>
            <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${formData.type === TransactionType.EXPENSE ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-red-400'}`}>
                Duit Keluar
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah (RM)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
          />
        </div>
         <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarikh</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Keterangan
            <Tooltip text="Contoh: Bayaran sewa pejabat, sumbangan dari syarikat ABC.">
                <InformationCircleIcon className="text-gray-400" />
            </Tooltip>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          {initialData ? 'Simpan Perubahan' : 'Tambah Rekod'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
