
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { Transaction, Category, TransactionType } from '../types';
import TransactionForm from './TransactionForm';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon, InformationCircleIcon } from './icons';
import Tooltip from './Tooltip';

interface DashboardProps {
  transactions: Transaction[];
  analysis: { totalIncome: number; totalExpense: number; balance: number };
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const StatCard: React.FC<{ title: string; amount: number; color: string; tooltipText: string }> = ({ title, amount, color, tooltipText }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex-1 min-w-[200px] relative">
      <div className="absolute top-4 right-4">
          <Tooltip text={tooltipText}>
              <InformationCircleIcon className="text-gray-400" />
          </Tooltip>
      </div>
    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className={`text-3xl font-bold mt-2 ${color}`}>RM {amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ transactions, analysis, categories, addTransaction, deleteTransaction, updateTransaction }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const chartData = useMemo(() => {
    const months: { [key: string]: { income: number; expense: number } } = {};
    const sortedTransactions = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTransactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      if (t.type === TransactionType.INCOME) {
        months[month].income += t.amount;
      } else {
        months[month].expense += t.amount;
      }
    });

    return Object.keys(months).map(month => ({
      name: month,
      Masuk: months[month].income,
      Keluar: months[month].expense,
    })).slice(-12); // Show last 12 months
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);
  
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
      if(window.confirm("Anda pasti mahu memadam transaksi ini?")) {
          deleteTransaction(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6" data-tutorial="step-2">
        <StatCard title="Jumlah Masuk" amount={analysis.totalIncome} color="text-green-500" tooltipText="Keseluruhan wang yang diterima." />
        <StatCard title="Jumlah Keluar" amount={analysis.totalExpense} color="text-red-500" tooltipText="Keseluruhan wang yang dibelanjakan." />
        <StatCard title="Baki Semasa" amount={analysis.balance} color={analysis.balance >= 0 ? 'text-blue-500' : 'text-red-500'} tooltipText="Perbezaan antara Jumlah Masuk dan Jumlah Keluar." />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" data-tutorial="step-3">
        <h3 className="text-xl font-semibold mb-4">Analisa Bulanan</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-color)' }} />
                <YAxis tickFormatter={(value) => `RM${value}`} tick={{ fill: 'var(--text-color)' }} />
                <RechartsTooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                        borderColor: '#4b5563',
                        borderRadius: '0.5rem'
                    }} 
                    labelStyle={{ color: '#f3f4f6' }}
                    formatter={(value: number) => `RM ${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" data-tutorial="step-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Transaksi Terkini</h3>
          <button onClick={handleAddClick} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md" data-tutorial="step-5">
            <PlusIcon />
            <span>Tambah Rekod</span>
          </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        <th className="py-2 px-4 font-medium">Tarikh</th>
                        <th className="py-2 px-4 font-medium">Keterangan</th>
                        <th className="py-2 px-4 font-medium hidden sm:table-cell">Kategori</th>
                        <th className="py-2 px-4 font-medium text-right">Jumlah (RM)</th>
                        <th className="py-2 px-4 font-medium text-center">Tindakan</th>
                    </tr>
                </thead>
                <tbody>
                    {recentTransactions.length > 0 ? recentTransactions.map(t => (
                        <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4">{t.date}</td>
                            <td className="py-3 px-4">{t.description}</td>
                            <td className="py-3 px-4 hidden sm:table-cell">{categoryMap.get(t.categoryId) || 'N/A'}</td>
                            <td className={`py-3 px-4 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                                <div className="flex justify-center items-center gap-2">
                                <Tooltip text="Kemaskini">
                                    <button onClick={() => handleEditClick(t)} className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">
                                        <EditIcon />
                                    </button>
                                </Tooltip>
                                <Tooltip text="Padam">
                                    <button onClick={() => handleDeleteClick(t.id)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300">
                                        <TrashIcon />
                                    </button>
                                </Tooltip>
                                </div>
                            </td>
                        </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Tiada transaksi terkini.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
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

export default Dashboard;
