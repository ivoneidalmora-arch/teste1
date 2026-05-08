"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { SidebarContent } from './SidebarContent';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Fechar ao pressionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Impedir scroll do body quando o menu está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Top Bar Mobile */}
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Alfa Logo" 
            width={100} 
            height={40} 
            className="h-8 w-auto object-contain"
          />
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Drawer Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Aside Drawer */}
          <aside className="relative z-[9999] h-full w-[280px] max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="absolute right-4 top-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent onItemClick={() => setIsOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
