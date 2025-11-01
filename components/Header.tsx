import React, { useState, useRef } from 'react';
import { View } from '../types';
import { SunIcon, MoonIcon, MenuIcon, XIcon, DownloadIcon, UploadIcon, LifebuoyIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  fontSize: 'sm' | 'base' | 'lg';
  setFontSize: (size: 'sm' | 'base' | 'lg') => void;
  onBackup: () => void;
  onRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStartTutorial: () => void;
}

const FontSizeToggle: React.FC<{
    fontSize: 'sm' | 'base' | 'lg';
    setFontSize: (size: 'sm' | 'base' | 'lg') => void;
}> = ({ fontSize, setFontSize }) => {
    const sizes = [
        { key: 'sm', label: 'K' },
        { key: 'base', label: 'N' },
        { key: 'lg', label: 'B' },
    ] as const;

    return (
        <div className="flex items-center bg-slate-200/60 dark:bg-slate-700/60 p-1 rounded-full">
            {sizes.map(size => (
                <button
                    key={size.key}
                    onClick={() => setFontSize(size.key)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                        fontSize === size.key
                            ? 'bg-white dark:bg-slate-900/70 text-blue-600 dark:text-blue-400 shadow'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                    title={`Saiz ${size.key === 'sm' ? 'Kecil' : size.key === 'base' ? 'Normal' : 'Besar'}`}
                >
                    {size.label}
                </button>
            ))}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ currentView, setView, theme, toggleTheme, fontSize, setFontSize, onBackup, onRestore, onStartTutorial }) => {
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

  const NavLink: React.FC<{ viewId: View, label: string, isMobile?: boolean }> = ({ viewId, label, isMobile = false }) => (
    <button
      onClick={() => { setView(viewId); setMenuOpen(false); }}
      className={`font-medium transition-colors duration-200 ${isMobile ? 'block w-full text-left px-4 py-2 text-base' : 'px-3 py-2 text-sm'} ${
        currentView === viewId
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      {label}
    </button>
  );

  const IconButton: React.FC<{onClick: () => void, title: string, children: React.ReactNode}> = ({onClick, title, children}) => (
    <button onClick={onClick} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors" title={title}>
        {children}
    </button>
  );

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40" data-tutorial="step-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">KewanganKu</h1>
            </div>
            <div className="hidden md:block">
              <nav className="flex items-baseline space-x-4">
                {navItems.map(item => (
                  <NavLink key={item.id} viewId={item.id as View} label={item.label} />
                ))}
              </nav>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <IconButton onClick={onStartTutorial} title="Mulakan Tutorial"><LifebuoyIcon /></IconButton>
            <FontSizeToggle fontSize={fontSize} setFontSize={setFontSize} />
            <IconButton onClick={onBackup} title="Backup Data (CSV)"><DownloadIcon /></IconButton>
            <IconButton onClick={handleRestoreClick} title="Restore Data (CSV)"><UploadIcon /></IconButton>
            <input type="file" ref={restoreInputRef} onChange={onRestore} accept=".csv" className="hidden" />
            <IconButton onClick={toggleTheme} title="Tukar Mod">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Buka menu</span>
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink key={item.id} viewId={item.id as View} label={item.label} isMobile />
            ))}
          </nav>
          <div className="pt-4 pb-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-around px-5">
              <IconButton onClick={onStartTutorial} title="Mulakan Tutorial"><LifebuoyIcon /></IconButton>
              <FontSizeToggle fontSize={fontSize} setFontSize={setFontSize} />
              <IconButton onClick={onBackup} title="Backup Data (CSV)"><DownloadIcon /></IconButton>
              <IconButton onClick={handleRestoreClick} title="Restore Data (CSV)"><UploadIcon /></IconButton>
              <IconButton onClick={toggleTheme} title="Tukar Mod">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;