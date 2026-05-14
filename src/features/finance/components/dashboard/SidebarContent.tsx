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
  Activity,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { SidebarBrandCard } from './SidebarBrandCard';

import { Icon3D } from '@/core/components/ui/Icon3D';

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  variant: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'slate' | 'ai';
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
      { icon: Upload, label: 'Importações', href: '/importacoes', variant: 'cyan' },
      { icon: Scan, label: 'OCR / IA', href: '/ocr-ia', variant: 'indigo' },
      { icon: Sparkles, label: 'Insights IA', href: '/insights-ia', variant: 'ai' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: ShieldCheck, label: 'Auditoria', href: '/auditoria', variant: 'green' },
      { icon: Activity, label: 'Saúde do Sistema', href: '/admin/saude', variant: 'blue' },
      { icon: Settings, label: 'Configurações', href: '/configuracoes', variant: 'slate' },
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
    <div className="flex flex-col h-full bg-white overflow-hidden border-r border-slate-100 shadow-xl">
      {/* 1. Header: Logo Premium */}
      <div className="shrink-0 p-6">
        <SidebarBrandCard />
      </div>

      {/* 2. Área Central: Navegação com scroll */}
      <nav 
        aria-label="Menu principal"
        className="sidebar-scroll flex-1 overflow-y-auto px-4 py-2 space-y-6"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {group.title}
            </p>

            <div className="space-y-2">
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
                      "group flex h-12 items-center gap-4 rounded-2xl px-3 transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-purple-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon3D 
                      icon={item.icon} 
                      variant={item.variant} 
                      size="xs" 
                      glow={false}
                      className={cn(
                        "group-hover:scale-110",
                        isActive && "shadow-none bg-white/20"
                      )}
                    />
                    <span className={cn(
                      "min-w-0 flex-1 truncate text-xs font-bold tracking-tight",
                      isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Footer: Bloco do Usuário */}
      <div className="shrink-0 p-4 border-t border-slate-50">
        <div className="flex items-center gap-3 rounded-2xl p-3 bg-white border border-slate-100 shadow-md transition-all hover:shadow-lg group">
          <div className="relative">
            <Icon3D icon={Activity} variant="blue" size="sm" className="rounded-xl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-slate-900">
              {user?.username || 'admin'}
            </p>
            <p className="truncate text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Operador Especial
            </p>
          </div>

          <button 
            onClick={logout}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

