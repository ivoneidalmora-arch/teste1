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
  Sparkles,
  Settings, 
  LogOut,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { SidebarBrandCard } from './SidebarBrandCard';

const MENU_GROUPS = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/', variant: 'blue' as const },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { icon: TrendingUp, label: 'Receitas', href: '/receitas', variant: 'green' as const },
      { icon: TrendingDown, label: 'Despesas', href: '/despesas', variant: 'red' as const },
      { icon: FileText, label: 'Relatórios', href: '/relatorios', variant: 'purple' as const },
    ]
  },
  {
    title: 'Automação',
    items: [
      { icon: Upload, label: 'Importações', href: '/importacoes', variant: 'blue' as const },
      { icon: Scan, label: 'OCR / IA', href: '/ocr-ia', variant: 'violet' as const },
      { icon: Sparkles, label: 'Insights IA', href: '/insights-ia', variant: 'orange' as const },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: Settings, label: 'Configurações', href: '/configuracoes', variant: 'teal' as const },
    ]
  }
];

interface Props {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: Props) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Topo: Logo fixo - Opção 1 (Cartão Elevado) */}
      <SidebarBrandCard />


      {/* 2. Centro: Menu com scroll */}
      <nav 
        aria-label="Menu principal"
        className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onItemClick}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-xl px-2.5 text-xs font-bold transition-all duration-200",
                      isActive
                        ? "bg-slate-50 text-slate-900 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <IconBadge 
                      icon={item.icon} 
                      variant={item.variant} 
                      size="sm" 
                      gradient={isActive} 
                      className={cn(!isActive && "bg-transparent shadow-none")}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Rodapé: Usuário fixo */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-3">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[10px] font-black text-white shadow-md">
            {user?.username?.[0].toUpperCase() || 'A'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black text-[#0F172A]">
              {user?.username || 'admin'}
            </p>
            <p className="truncate text-[8px] font-black text-slate-400 uppercase tracking-tighter">
              Operador Alfa
            </p>
          </div>

          <button 
            onClick={logout}
            className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
            aria-label="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
