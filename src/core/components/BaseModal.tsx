"use client";

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerColorContext?: 'neutral' | 'success' | 'danger';
}

export function BaseModal({ isOpen, onClose, title, children, headerColorContext = 'neutral' }: BaseModalProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!shouldRender && !isOpen) return null;

  const contextMap = {
    neutral: 'bg-slate-50 text-slate-800',
    success: 'bg-emerald-50 text-emerald-800',
    danger: 'bg-rose-50 text-rose-800'
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
    >
      <div 
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 transform border border-white/20",
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        )}
      >
        <div className={cn("px-6 py-5 flex items-center justify-between border-b border-black/5", contextMap[headerColorContext])}>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto scrollbar-thin bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
