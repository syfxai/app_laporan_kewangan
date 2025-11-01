import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Category, TransactionType, TransactionStatus } from '../types';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
import { PlusIcon, EditIcon, TrashIcon, ArrowUpRightIcon, ArrowDownLeftIcon, ScaleIcon, CheckCircleIcon, ClockIcon } from './icons';
import CustomTooltip from './Tooltip';

interface DashboardProps {
  transactions: Transaction[];
  analysis: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; color: string; tutorialId?: string }> = ({ title, amount, icon, color, tutorialId }) => (
  <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between`} data-tutorial={tutorialId}>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${color} mt-1`}>RM {amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      {icon}
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
    const isCleared = status === 'cleared';
    const bgColor = isCleared ? 'bg-green-100 dark:bg-green-500/10' : 'bg-amber-100 dark:bg-amber-500/10';
    const textColor = isCleared ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300';
    const Icon = isCleared ? CheckCircleIcon : ClockIcon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{isCleared ? 'Lunas' : 'Belum Lunas'}</span>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, analysis, categories, addTransaction, deleteTransaction, updateTransaction }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);
  
  const chartData = useMemo(() => {
    if (chartView === 'monthly') {
      const data: { [key: string]: { income: number, expense: number, name: string } } = {};
      const monthsToShow = 6;
      const today = new Date();

      for (let i = monthsToShow - 1; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthName = d.toLocaleString('ms-MY', { month: 'short', year: '2-digit' });
          data[monthKey] = { income: 0, expense: 0, name: monthName };
      }
      
      transactions.forEach(t => {
          const transactionDate = new Date(t.date);
          const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
          if (data[monthKey]) {
              if (t.type === TransactionType.INCOME) data[monthKey].income += t.amount;
              else data[monthKey].expense += t.amount;
          }
      });
      return Object.values(data);
    } else { // yearly view
        const data: { [key: string]: { income: number, expense: number, name: string } } = {};
        transactions.forEach(t => {
            const year = new Date(t.date).getFullYear().toString();
            if (!data[year]) {
                data[year] = { income: 0, expense: 0, name: year };
            }
            if (t.type === TransactionType.INCOME) data[year].income += t.amount;
            else data[year].expense += t.amount;
        });
        return Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [transactions, chartView]);

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
  
  const formatYAxis = (tickItem: number) => `RM${(tickItem / 1000).toLocaleString()}k`;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tutorial="step-2">
        <StatCard title="Jumlah Masuk" amount={analysis.totalIncome} icon={<ArrowUpRightIcon className="h-6 w-6" />} color="text-green-600 dark:text-green-400" />
        <StatCard title="Jumlah Keluar" amount={analysis.totalExpense} icon={<ArrowDownLeftIcon className="h-6 w-6" />} color="text-red-600 dark:text-red-400" />
        <StatCard title="Baki Semasa" amount={analysis.balance} icon={<ScaleIcon className="h-6 w-6" />} color="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" data-tutorial="step-3">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Analisa Aliran Tunai</h3>
                 <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg text-sm">
                    <button onClick={() => setChartView('monthly')} className={`px-3 py-1 rounded-md font-semibold transition-colors ${chartView === 'monthly' ? 'bg-white dark:bg-slate-800 shadow text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>Bulanan</button>
                    <button onClick={() => setChartView('yearly')} className={`px-3 py-1 rounded-md font-semibold transition-colors ${chartView === 'yearly' ? 'bg-white dark:bg-slate-800 shadow text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>Tahunan</button>
                </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                        <Tooltip
                            cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                color: '#334155'
                            }}
                            formatter={(value: number) => `RM ${value.toLocaleString('ms-MY', {minimumFractionDigits: 2})}`}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                        <Bar dataKey="income" name="Masuk" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="expense" name="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" data-tutorial="step-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Transaksi Terkini</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                    {t.type === TransactionType.INCOME ? <ArrowUpRightIcon className="h-5 w-5 text-green-500" /> : <ArrowDownLeftIcon className="h-5 w-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{t.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })} &bull; {categoryMap.get(t.categoryId) || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} RM {t.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex justify-end items-center gap-2 mt-1">
                      <StatusBadge status={t.status} />
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <CustomTooltip text="Kemaskini">
                            <button onClick={() => handleEditClick(t)} className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"><EditIcon /></button>
                          </CustomTooltip>
                          <CustomTooltip text="Padam">
                            <button onClick={() => handleDeleteClick(t.id)} className="p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400"><TrashIcon /></button>
                          </CustomTooltip>
                      </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Tiada transaksi untuk dipaparkan.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Transaction FAB */}
      <div className="fixed bottom-6 right-6" data-tutorial="step-5">
        <CustomTooltip text="Tambah Rekod Baru">
            <button onClick={handleAddClick} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900">
              <PlusIcon />
            </button>
        </CustomTooltip>
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
