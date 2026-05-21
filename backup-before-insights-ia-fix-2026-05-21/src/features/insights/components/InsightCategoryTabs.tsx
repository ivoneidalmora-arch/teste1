"use client";

import { InsightCategory } from '../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  Grid2X2, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Wallet, 
  Briefcase, 
  Activity,
  History,
  ShieldAlert
} from 'lucide-react';

interface InsightCategoryTabsProps {
  activeCategory: InsightCategory | 'todos';
  onCategoryChange: (category: InsightCategory | 'todos') => void;
  counts: Record<string, number>;
}

export function InsightCategoryTabs({ activeCategory, onCategoryChange, counts }: InsightCategoryTabsProps) {
  const tabs = [
    { id: 'todos', label: 'Todos', icon: Grid2X2 },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'fluxo', label: 'Fluxo', icon: Activity },
    { id: 'duplicidades', label: 'Duplicidades', icon: ShieldAlert },
    { id: 'tendencias', label: 'Tendências', icon: Briefcase },
    { id: 'auditoria', label: 'Auditoria', icon: Wallet },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeCategory === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            onClick={() => onCategoryChange(tab.id as any)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              isActive 
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
            {tab.label}
            {count > 0 && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
                isActive ? "bg-indigo-50 text-indigo-700" : "bg-slate-200 text-slate-500"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
