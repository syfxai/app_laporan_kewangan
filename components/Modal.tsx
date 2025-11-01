import React, { ReactNode } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative transition-transform duration-300 transform scale-95"
        onClick={e => e.stopPropagation()}
        style={{ transform: 'scale(1)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label="Tutup"
        >
          <XIcon />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;