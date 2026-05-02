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

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: TrendingUp, label: 'Receitas', href: '/relatorios?tipo=income' },
  { icon: TrendingDown, label: 'Despesas', href: '/relatorios?tipo=expense' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
  { icon: Upload, label: 'Importações', href: '#' },
  { icon: Scan, label: 'OCR / IA', href: '#' },
  { icon: Settings, label: 'Configurações', href: '#' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, session } = useAuth();
  const user = session?.user;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Branding */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">Alfa Mateus</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Plan Card */}
      <div className="px-4 py-4">
        <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-all" />
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Plano Pro</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 relative z-10">Libere recursos avançados de IA e relatórios ilimitados.</p>
          <button className="w-full py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all relative z-10">
            Fazer Upgrade
          </button>
        </div>
      </div>

      {/* User Block */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">{user?.email?.split('@')[0] || 'Admin'}</span>
              <span className="text-[10px] text-slate-500 truncate">Administrador</span>
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
