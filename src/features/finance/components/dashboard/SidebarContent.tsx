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
  MoreVertical
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

interface Props {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: Props) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Topo: Logo fixo */}
      <div className="shrink-0 px-6 py-8 flex justify-center">
        <Image 
          src="/logo.png" 
          alt="Alfa Perícia e Vistoria Veicular" 
          width={150} 
          height={60} 
          className="h-auto max-h-20 w-auto max-w-[150px] object-contain"
          priority
        />
      </div>

      {/* 2. Centro: Menu com scroll */}
      <nav 
        aria-label="Menu principal"
        className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
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
                      "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition",
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
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
      <div className="shrink-0 border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 rounded-2xl p-2 hover:bg-slate-50 transition-colors group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white shadow-sm">
            {user?.username?.[0].toUpperCase() || 'A'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-950">
              {user?.username || 'admin'}
            </p>
            <p className="truncate text-[10px] font-medium text-slate-500 uppercase tracking-tight">
              Operador Alfa
            </p>
          </div>

          <button 
            onClick={logout}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
