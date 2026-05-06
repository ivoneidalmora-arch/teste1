"use client";

import { useEffect, useState, useCallback } from 'react';
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
  const [shouldRender, setShouldRender] = useState(false);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
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

  if (!shouldRender && !isOpen) return null;

  const contextMap = {
    neutral: 'bg-slate-900 text-white border-slate-800',
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50',
    danger: 'bg-rose-950/30 text-rose-400 border-rose-900/50',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-900/50',
    info: 'bg-blue-950/30 text-blue-400 border-blue-900/50'
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
      onTransitionEnd={() => {
        if (!isOpen) setShouldRender(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="base-modal-title"
    >
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Container */}
      <div 
        className={cn(
          "relative bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 transform border border-slate-800",
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        )}
      >
        {/* Header */}
        <header className={cn("px-6 py-5 flex items-center justify-between border-b shrink-0", contextMap[headerColorContext])}>
          <h2 id="base-modal-title" className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        
        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 flex-1 bg-slate-950">
          {children}
        </div>
      </div>
    </div>
  );
}
