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
    <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Lado Esquerdo: Saldo */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Saldo Disponível
            </p>
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl break-words">
            {formatBRL(balance)}
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 font-black text-sm",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              <TrendingUp className={cn("w-4 h-4", !isPositive && "rotate-180")} />
              {isPositive ? '+' : ''}{variation.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">vs. mês anterior</span>
          </div>
          <p className="mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Atualizado em {lastUpdate}</p>
        </div>

        {/* Lado Direito: Info Contextual */}
        <div className="min-w-0 rounded-2xl bg-slate-50 p-6 flex flex-col justify-center border border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            Indicadores em Tempo Real
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 font-medium">
            O sistema está pronto para processar seus lançamentos e gerar insights automáticos baseados no período selecionado.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizado com Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/core/utils/formatters';
