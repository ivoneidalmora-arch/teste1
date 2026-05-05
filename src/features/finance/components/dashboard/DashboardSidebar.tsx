"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Upload, 
  Scan, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';

const MENU_GROUPS = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { icon: TrendingUp, label: 'Receitas', href: '/receitas' },
      { icon: TrendingDown, label: 'Despesas', href: '/despesas' },
      { icon: FileText, label: 'Relatórios', href: '/relatorios' },
    ]
  },
  {
    title: 'Automação',
    items: [
      { icon: Upload, label: 'Importações', href: '/importacoes' },
      { icon: Scan, label: 'OCR / IA', href: '/ocr-ia' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: Settings, label: 'Configurações', href: '/configuracoes' },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Branding */}
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia e Vistoria" 
            width={160} 
            height={60} 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-none">
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/5" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-4.5 h-4.5 transition-colors",
                        isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600"
                      )} />
                      <span className={cn(
                        "text-sm tracking-tight",
                        isActive ? "font-bold" : "font-semibold"
                      )}>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-brand-primary/50" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Block */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
              {user?.username?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.username || 'Usuário'}
              </span>
              <span className="text-[10px] text-slate-500 truncate">Operador Alfa</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
