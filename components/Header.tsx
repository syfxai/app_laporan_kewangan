
import React, { useState, useRef } from 'react';
import { View } from '../types';
import { SunIcon, MoonIcon, MenuIcon, XIcon, DownloadIcon, UploadIcon, LifebuoyIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onBackup: () => void;
  onRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStartTutorial: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, theme, toggleTheme, onBackup, onRestore, onStartTutorial }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Papan Pemuka' },
    { id: 'transactions', label: 'Semua Transaksi' },
    { id: 'reports', label: 'Laporan' },
  ];

  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };

  const NavLink: React.FC<{ viewId: View, label: string }> = ({ viewId, label }) => (
    <button
      onClick={() => { setView(viewId); setMenuOpen(false); }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === viewId
          ? 'bg-primary-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40" data-tutorial="step-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">KewanganKu</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map(item => (
                  <NavLink key={item.id} viewId={item.id as View} label={item.label} />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={onStartTutorial} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary-500" title="Mulakan Tutorial">
              <LifebuoyIcon />
            </button>
            <button onClick={onBackup} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary-500" title="Backup Data (CSV)">
              <DownloadIcon />
            </button>
            <button onClick={handleRestoreClick} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary-500" title="Restore Data (CSV)">
              <UploadIcon />
            </button>
            <input type="file" ref={restoreInputRef} onChange={onRestore} accept=".csv" className="hidden" />
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-primary-500" title="Tukar Mod">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Buka menu</span>
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink key={item.id} viewId={item.id as View} label={item.label} />
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-5 space-x-3">
              <button onClick={onStartTutorial} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none" title="Mulakan Tutorial">
                <LifebuoyIcon /> Mula Tutorial
              </button>
              <button onClick={onBackup} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title="Backup Data (CSV)">
                <DownloadIcon /> Backup
              </button>
              <button onClick={handleRestoreClick} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title="Restore Data (CSV)">
                <UploadIcon /> Restore
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title="Tukar Mod">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />} Tukar Mod
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
