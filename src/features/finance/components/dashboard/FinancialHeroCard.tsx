"use client";

import { Wallet, TrendingUp } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';

interface Props {
  balance: number;
  lastUpdate: string;
  variation: number;
}

export function FinancialHeroCard({ balance, lastUpdate, variation }: Props) {
  const isPositive = variation >= 0;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-blue-50 text-[#2563EB] rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Saldo Disponível
          </p>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-[#0F172A] truncate">
          {formatBRL(balance)}
        </h2>

        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-0.5 font-bold text-[10px]",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            <TrendingUp className={cn("w-3 h-3", !isPositive && "rotate-180")} />
            {isPositive ? '+' : ''}{variation.toFixed(1)}% vs. mês anterior
          </span>
        </div>
      </div>
      
      <p className="mt-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
        Atualizado em {lastUpdate}
      </p>
    </div>
  );
}

import { cn } from '@/core/utils/formatters';
