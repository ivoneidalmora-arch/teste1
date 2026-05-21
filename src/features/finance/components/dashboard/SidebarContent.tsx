"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Trash2,
  ShieldCheck,
  Activity,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuth } from '@/features/auth/hooks/useAuth';
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
    ]
  }
];

interface Props {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: Props) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogoutClick = async () => {
    const isConfirmed = window.confirm("Tem certeza que deseja sair do sistema Alfa Perícia?");
    if (isConfirmed) {
      await logout();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1528] overflow-hidden border-r border-slate-800/80 shadow-xl">
      {/* 1. Header: Logo Premium Compactado */}
      <div className="shrink-0 p-1">
        <SidebarBrandCard />
      </div>

      {/* 2. Área Central: Navegação com scroll e espaçamentos otimizados */}
      <nav 
        aria-label="Menu principal"
        className="sidebar-scroll flex-1 overflow-y-auto px-2 py-0.5 space-y-0.5"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mb-1.5">
            <p className="mb-0.5 px-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
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
                      "group flex h-8 items-center gap-2 rounded-lg px-1.5 transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-950/40"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                    )}
                  >
                    <Icon3D 
                      icon={item.icon} 
                      variant={item.variant} 
                      size="xs" 
                      glow={false}
                      className={cn(
                        "group-hover:scale-105 transition-transform duration-200",
                        isActive && "shadow-none bg-white/20"
                      )}
                    />
                    <span className={cn(
                      "min-w-0 flex-1 truncate text-[11px] font-extrabold tracking-tight",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. Footer: Bloco do Usuário Fixado e Ultra-compactado */}
      <div className="shrink-0 p-1.5 border-t border-slate-800/50 bg-[#0B1528]">
        <div className="flex items-center gap-1.5 rounded-lg p-1.5 bg-[#131E35]/45 border border-slate-800/80 shadow-xs transition-all hover:bg-[#131E35]/65 group">
          <div className="relative">
            <Icon3D icon={Activity} variant="blue" size="xs" className="rounded-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 border border-[#0B1528] rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-black text-slate-100 leading-none mb-0.5">
              {user?.username || 'admin'}
            </p>
            <p className="truncate text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Operador Especial
            </p>
          </div>

          <button 
            onClick={handleLogoutClick}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all"
            title="Sair"
          >
            <LogOut className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
