import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction, Category, View, TransactionType, TransactionStatus } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Tutorial from './components/Tutorial';
import Footer from './components/Footer';
import { generateSampleData } from './utils/sampleData';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage<'sm' | 'base' | 'lg'>('fontSize', 'base');
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', [
    { id: '1', name: 'Utiliti' },
    { id: '2', name: 'Gaji' },
    { id: '3', name: 'Sewa' },
    { id: '4', name: 'Acara' },
    { id: '5', name: 'Sumbangan' },
    { id: '7', name: 'Pendaftaran Ahli' },
    { id: '6', name: 'Lain-lain' },
  ]);

  const [view, setView] = useState<View>('dashboard');
  const [isTutorialActive, setTutorialActive] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useLocalStorage('isInitialLoad', true);

  useEffect(() => {
    if (isInitialLoad && transactions.length === 0) {
      setTransactions(generateSampleData());
      setTutorialActive(true);
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoad, transactions.length, setTransactions, setIsInitialLoad]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(`text-${fontSize}`);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const analysis = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [transactions]);
  
  const handleBackup = () => {
    if (transactions.length === 0) {
        alert("Tiada data untuk di-backup.");
        return;
    }
    const header = "id,date,type,description,amount,categoryId,status\n";
    const csvContent = transactions.map(t => 
        `${t.id},${t.date},${t.type},"${t.description.replace(/"/g, '""')}",${t.amount},${t.categoryId},${t.status || 'cleared'}`
    ).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `backup_kewangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const rows = text.split('\n').slice(1); // skip header
            const restoredTransactions: Transaction[] = rows.map(row => {
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quotes
                if (columns.length < 6) return null; // status can be optional for backward compatibility
                return {
                    id: columns[0],
                    date: columns[1],
                    type: columns[2] as TransactionType,
                    description: columns[3].slice(1, -1).replace(/""/g, '"'), // handle quotes
                    amount: parseFloat(columns[4]),
                    categoryId: columns[5],
                    status: (columns[6]?.trim() as TransactionStatus) || 'cleared'
                };
            }).filter((t): t is Transaction => !!(t !== null && t.id && t.date && t.type && t.description && !isNaN(t.amount) && t.categoryId && t.status));

            if (restoredTransactions.length > 0) {
                if (window.confirm(`Anda pasti mahu menggantikan ${transactions.length} rekod sedia ada dengan ${restoredTransactions.length} rekod baru?`)) {
                    setTransactions(restoredTransactions);
                    alert("Data berjaya dipulihkan!");
                }
            } else {
                alert("Fail CSV tidak sah atau kosong.");
            }
        } catch (error) {
            alert("Gagal memproses fail. Sila pastikan format fail adalah betul.");
            console.error("Restore error:", error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const startTutorial = () => {
    setView('dashboard');
    setTutorialActive(true);
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard transactions={transactions} analysis={analysis} categories={categories} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />;
      case 'transactions':
        return <TransactionList transactions={transactions} categories={categories} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />;
      case 'reports':
        return <Reports transactions={transactions} categories={categories} />;
      default:
        return <Dashboard transactions={transactions} analysis={analysis} categories={categories} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 flex flex-col ${isTutorialActive ? 'overflow-hidden' : ''}`}>
      <Header 
        currentView={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onStartTutorial={startTutorial}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow">
        {renderView()}
      </main>
      <Footer />
      {isTutorialActive && <Tutorial onFinish={() => setTutorialActive(false)} />}
    </div>
  );
};

export default App;