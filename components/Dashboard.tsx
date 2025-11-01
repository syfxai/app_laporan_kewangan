import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Transaction, Category, TransactionType, TransactionStatus } from '../types';
import { ArrowUpRightIcon, ArrowDownLeftIcon, ScaleIcon, PlusIcon, EditIcon, TrashIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, ChevronDownIcon } from './icons';
import Modal from './Modal';
import TransactionForm from './TransactionForm';
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


const Dashboard: React.FC<DashboardProps> = ({ transactions, analysis, categories, addTransaction, deleteTransaction, updateTransaction }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  
  const years = useMemo(() => {
    const transactionYears = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return Array.from(new Set([new Date().getFullYear(), ...transactionYears])).sort((a,b) => b - a);
  }, [transactions]);

  const chartData = useMemo(() => {
    if (chartView === 'monthly') {
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(selectedYear, i, 1);
        return {
          name: date.toLocaleString('ms-MY', { month: 'short' }),
          Masuk: 0,
          Keluar: 0,
        };
      });
      transactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear) {
          const monthIndex = date.getMonth();
          if (t.type === 'income') months[monthIndex].Masuk += t.amount;
          else months[monthIndex].Keluar += t.amount;
        }
      });
      return months;
    } else { // yearly
      const yearlyData: { [year: string]: { Masuk: number, Keluar: number } } = {};
      transactions.forEach(t => {
        const year = new Date(t.date).getFullYear().toString();
        if (!yearlyData[year]) yearlyData[year] = { Masuk: 0, Keluar: 0 };
        if (t.type === 'income') yearlyData[year].Masuk += t.amount;
        else yearlyData[year].Keluar += t.amount;
      });
      return Object.entries(yearlyData)
        .map(([year, data]) => ({ name: year, ...data }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));
    }
  }, [transactions, chartView, selectedYear]);
  
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const pendingTransactions = useMemo(() => {
    return transactions
      .filter(t => t.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);


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
  
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
              {pld.dataKey}: RM {pld.value.toLocaleString('ms-MY', {minimumFractionDigits: 2})}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tutorial="step-2">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jumlah Masuk</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">RM {analysis.totalIncome.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-500/10 p-3 rounded-full"><ArrowUpRightIcon className="text-green-500 dark:text-green-400" /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jumlah Keluar</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">RM {analysis.totalExpense.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-full"><ArrowDownLeftIcon className="text-red-500 dark:text-red-400" /></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Baki Semasa</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">RM {analysis.balance.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-full"><ScaleIcon className="text-blue-500 dark:text-blue-400" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" data-tutorial="step-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Analisa Aliran Tunai</h3>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    {chartView === 'monthly' && (
                       <div className="relative">
                           <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-28 text-sm p-1.5 pl-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                              {years.map(y => <option key={y} value={y}>{y}</option>)}
                           </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDownIcon /></div>
                       </div>
                    )}
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-md text-sm">
                        <button onClick={() => setChartView('monthly')} className={`px-3 py-1 rounded ${chartView === 'monthly' ? 'bg-white dark:bg-slate-800 shadow font-semibold text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>Bulanan</button>
                        <button onClick={() => setChartView('yearly')} className={`px-3 py-1 rounded ${chartView === 'yearly' ? 'bg-white dark:bg-slate-800 shadow font-semibold text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>Tahunan</button>
                    </div>
                </div>
            </div>
            <div className="h-80 -ml-5">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `RM${Number(value) / 1000}k`} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Bar dataKey="Masuk" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Keluar" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" data-tutorial="step-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Transaksi Terkini</h3>
             <button onClick={handleAddClick} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" data-tutorial="step-5">
              <PlusIcon /><span>Tambah</span>
            </button>
          </div>
          <ul className="space-y-1">
            {recentTransactions.length > 0 ? recentTransactions.map(t => (
              <li key={t.id} className="group flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 -mx-2 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'}`}>
                        {t.type === TransactionType.INCOME ? <ArrowUpRightIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <ArrowDownLeftIcon className="w-5 h-5 text-red-500 dark:text-red-400" />}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{t.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {categoryMap.get(t.categoryId)}</p>
                    </div>
                </div>
                <div className="relative text-right">
                    <p className={`font-semibold text-sm ${t.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>{t.type === TransactionType.INCOME ? '+' : '-'}RM{t.amount.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
                    <div className="h-6 mt-1 flex justify-end items-center">
                        <div className="transition-opacity duration-300 ease-in-out group-hover:opacity-0">
                            <StatusBadge status={t.status} />
                        </div>
                        <div className="absolute bottom-0 right-0 flex items-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                             <CustomTooltip text="Kemaskini">
                               <button onClick={() => handleEditClick(t)} className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 dark:hover:text-blue-400 dark:hover:bg-slate-700/60"><EditIcon /></button>
                             </CustomTooltip>
                             <CustomTooltip text="Padam">
                               <button onClick={() => handleDeleteClick(t.id)} className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-slate-200/60 dark:hover:text-red-400 dark:hover:bg-slate-700/60"><TrashIcon /></button>
                             </CustomTooltip>
                        </div>
                    </div>
                </div>
              </li>
            )) : <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">Tiada transaksi terkini.</p>}
          </ul>
        </div>
      </div>
      
      {pendingTransactions.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Untuk Perhatian: Transaksi Belum Lunas</h3>
              </div>
              <ul className="mt-4 space-y-2">
                  {pendingTransactions.map(t => (
                      <li key={t.id} className="flex items-center justify-between p-2 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 rounded-md">
                          <div>
                              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{t.description}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {categoryMap.get(t.categoryId)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <p className="font-semibold text-sm text-red-500">-RM{t.amount.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
                              <div className="flex items-center gap-1">
                                  <CustomTooltip text="Kemaskini">
                                    <button onClick={() => handleEditClick(t)} className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 dark:hover:text-blue-400 dark:hover:bg-slate-700/60"><EditIcon /></button>
                                  </CustomTooltip>
                                  <CustomTooltip text="Padam">
                                    <button onClick={() => handleDeleteClick(t.id)} className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-slate-200/60 dark:hover:text-red-400 dark:hover:bg-slate-700/60"><TrashIcon /></button>
                                  </CustomTooltip>
                              </div>
                          </div>
                      </li>
                  ))}
              </ul>
          </div>
      )}
      
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
