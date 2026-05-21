"use client";

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerColorContext?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
}

export function BaseModal({ isOpen, onClose, title, children, headerColorContext = 'neutral' }: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!mounted || !isOpen) return null;

  const contextMap = {
    neutral: 'bg-slate-900 text-white border-slate-800',
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    danger: 'bg-rose-950/30 text-rose-400 border-rose-900/50',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    info: 'bg-blue-950/30 text-blue-400 border-blue-900/50'
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="base-modal-title"
    >
      {/* Overlay Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={cn(
          "relative bg-slate-950 rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[90vh] md:max-w-2xl flex flex-col overflow-hidden transition-all duration-300 transform border border-slate-800 animate-in fade-in zoom-in duration-200",
          "max-sm:max-w-[95vw] max-sm:max-h-[92vh]"
        )}
      >
        {/* Header - Fixo */}
        <header className={cn("px-6 py-4 flex items-center justify-between border-b shrink-0", contextMap[headerColorContext])}>
          <h2 id="base-modal-title" className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        
        {/* Content - Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex-1 bg-slate-950">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
