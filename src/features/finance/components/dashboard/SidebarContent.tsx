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
  MoreVertical,
  Trash2,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { SidebarBrandCard } from './SidebarBrandCard';

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  variant: 'blue' | 'green' | 'red' | 'purple' | 'violet' | 'orange' | 'teal';
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

const MENU_GROUPS: SidebarSection[] = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/', variant: 'blue' },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { icon: TrendingUp, label: 'Receitas', href: '/receitas', variant: 'green' },
      { icon: TrendingDown, label: 'Despesas', href: '/despesas', variant: 'red' },
      { icon: FileText, label: 'Relatórios', href: '/relatorios', variant: 'purple' },
      { icon: Trash2, label: 'Lixeira', href: '/lixeira', variant: 'orange' },
    ]
  },
  {
    title: 'Automação',
    items: [
      { icon: Upload, label: 'Importações', href: '/importacoes', variant: 'blue' },
      { icon: Scan, label: 'OCR / IA', href: '/ocr-ia', variant: 'violet' },
      { icon: Sparkles, label: 'Insights IA', href: '/insights-ia', variant: 'orange' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: ShieldCheck, label: 'Auditoria', href: '/auditoria', variant: 'teal' },
      { icon: Settings, label: 'Configurações', href: '/configuracoes', variant: 'blue' },
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* 1. Header: Logo Premium */}
      <div className="shrink-0">
        <SidebarBrandCard />
      </div>

      {/* 2. Área Central: Navegação com scroll se necessário */}
      <nav 
        aria-label="Menu principal"
        className="sidebar-scroll flex-1 overflow-y-auto px-4 py-2 space-y-4"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400/80">
              {group.title}
            </p>

            <div className="space-y-0.5">
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
                      "group flex h-9 items-center gap-3 rounded-lg px-3 text-[12px] font-bold transition-all duration-200",
                      isActive
                        ? "bg-blue-50/50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <IconBadge 
                      icon={item.icon} 
                      variant={item.variant} 
                      size="sm" 
                      gradient={isActive} 
                      className={cn(
                        "transition-transform duration-300 group-hover:scale-110",
                        !isActive && "bg-transparent shadow-none"
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate tracking-tight">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Footer: Bloco do Usuário Fixo */}
      <div className="shrink-0 p-4 bg-white border-t border-slate-50">
        <div className="flex items-center gap-3 rounded-2xl p-2.5 bg-slate-50/50 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-white group">
          <div className="relative">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-[11px] font-black text-white shadow-lg shadow-blue-200/50">
              {user?.username?.[0].toUpperCase() || 'A'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-black text-slate-900 leading-tight">
              {user?.username || 'admin'}
            </p>
            <p className="truncate text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Operador Especialista
            </p>
          </div>

          <button 
            onClick={logout}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
            title="Sair do sistema"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
