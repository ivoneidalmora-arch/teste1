"use client";

import React, { useMemo } from 'react';
import { Card } from '@/core/components/Card';
import { groupRevenueByCategory, formatCurrencyBRL } from '../utils/reportMetrics';
import { ArrowRight, Trophy } from 'lucide-react';

interface TopServicesCardProps {
  transactions: any[];
}

export function TopServicesCard({ transactions }: TopServicesCardProps) {
  const ranking = useMemo(() => {
    const data = groupRevenueByCategory(transactions);
    // Ordena do maior para o menor
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((acc, curr) => acc + curr.value, 0);

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    })).slice(0, 5); // top 5
  }, [transactions]);

  const hasData = ranking.length > 0;

  // Cores de medalha/rank para as bolinhas
  const getRankBadgeStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-600 border border-amber-200';
      case 2:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 3:
        return 'bg-amber-50 text-amber-700/80 border border-amber-150';
      default:
        return 'bg-slate-50 text-slate-400 border border-slate-100';
    }
  };

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Título e Ícone */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Top 5 Receitas / Serviços</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ranking por Categoria</p>
        </div>
        <Trophy className="w-4.5 h-4.5 text-amber-500" />
      </div>

      {/* Lista de Ranking */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 my-3">
        {!hasData ? (
          <div className="flex items-center justify-center h-[160px]">
            <span className="text-[10px] text-slate-400 font-bold italic">Sem receitas no período</span>
          </div>
        ) : (
          ranking.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              {/* Lado Esquerdo: Rank e Nome */}
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black shrink-0 ${getRankBadgeStyles(item.rank)}`}>
                  {item.rank}º
                </span>
                <span className="text-[9.5px] font-bold text-slate-700 truncate uppercase tracking-tight">
                  {item.name}
                </span>
              </div>

              {/* Lado Direito: Valores e Barra de Progresso */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[9.5px] font-black text-slate-900">{formatCurrencyBRL(item.value)}</div>
                  <div className="text-[8px] font-bold text-purple-600 uppercase tracking-wider">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
                {/* Mini-barra de progresso */}
                <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden xs:block">
                  <div 
                    className="bg-purple-600 h-full rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver ranking completo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
