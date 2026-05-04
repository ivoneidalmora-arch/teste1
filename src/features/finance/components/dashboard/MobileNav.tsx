"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, session } = useAuth();
  const user = session?.user;

  return (
    <div className="lg:hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">Alfa Mateus</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <span className="text-lg font-black text-slate-900">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive 
                        ? "bg-brand-primary/10 text-brand-primary font-bold" 
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 truncate">{user?.email || 'Usuário'}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Online</span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
