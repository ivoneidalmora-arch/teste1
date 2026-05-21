"use client";

import React, { useState } from 'react';
import { Sparkles, X, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { formatCurrencyBRL } from '../utils/reportMetrics';

interface ExecutiveSummaryCardProps {
  summaryText: string;
  isProfit: boolean;
  ticketAverage?: number;
  bestMonth?: { month: string; value: number };
  worstMonth?: { month: string; value: number };
  ytdVariation?: number;
  onViewDetails?: () => void;
}

export function ExecutiveSummaryCard({ 
  summaryText, 
  isProfit,
  ticketAverage = 0,
  bestMonth = { month: '---', value: 0 },
  worstMonth = { month: '---', value: 0 },
  ytdVariation = 0,
  onViewDetails
}: ExecutiveSummaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper para renderizar negrito nas marcações **texto**
  const renderFormattedText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-black text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-white relative overflow-hidden shadow-md flex flex-col xl:flex-row justify-between gap-4">
        {/* Background Glow sutil */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
        
        {/* Lado Esquerdo: Resumo Textual */}
        <div className="relative z-10 flex items-start gap-3 min-w-0 flex-1">
          {/* Indicador de Status Executivo */}
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-t-transparent animate-spin",
              isProfit ? "border-emerald-400" : "border-rose-400"
            )} style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Resumo Executivo
            </h2>
            <p className="text-xs font-semibold leading-relaxed text-slate-200 line-clamp-2 pr-2">
              {renderFormattedText(summaryText)}
            </p>
            <button
              onClick={onViewDetails || (() => setIsModalOpen(true))}
              className="mt-2 text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-wider flex items-center gap-1"
            >
              Ver análise detalhada →
            </button>
          </div>
        </div>

        {/* Lado Direito: Mini-Indicadores (Separador vertical em xl) */}
        <div className="xl:border-l xl:border-slate-800/80 xl:pl-6 grid grid-cols-2 sm:grid-cols-4 gap-4 xl:gap-6 shrink-0 relative z-10">
          {/* 1. Melhor Mês */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              Melhor Mês
            </span>
            <p className="text-[10px] font-black text-slate-100 uppercase truncate">
              {bestMonth.month}
            </p>
            <span className="text-[9px] font-bold text-emerald-400">
              {formatCurrencyBRL(bestMonth.value)}
            </span>
          </div>

          {/* 2. Pior Mês */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1 flex items-center gap-1">
              <TrendingDown className="w-2.5 h-2.5 text-rose-400 shrink-0" />
              Pior Mês
            </span>
            <p className="text-[10px] font-black text-slate-100 uppercase truncate">
              {worstMonth.month}
            </p>
            <span className="text-[9px] font-bold text-rose-400">
              {formatCurrencyBRL(worstMonth.value)}
            </span>
          </div>

          {/* 3. Ticket Médio */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1 flex items-center gap-1">
              <DollarSign className="w-2.5 h-2.5 text-purple-400 shrink-0" />
              Ticket Médio
            </span>
            <p className="text-[10px] font-black text-slate-100 uppercase truncate">
              Média/Lanç.
            </p>
            <span className="text-[9px] font-bold text-purple-400">
              {formatCurrencyBRL(ticketAverage)}
            </span>
          </div>

          {/* 4. Variação YTD */}
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1 flex items-center gap-1">
              <Percent className="w-2.5 h-2.5 text-pink-400 shrink-0" />
              Variação YTD
            </span>
            <p className="text-[10px] font-black text-slate-100 uppercase truncate">
              Vs. Ano Ant.
            </p>
            <span className={cn(
              "text-[9px] font-bold",
              ytdVariation >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {ytdVariation >= 0 ? `+${ytdVariation.toFixed(1)}%` : `${ytdVariation.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Executivo Completo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Fechar */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Resumo Executivo</h3>
                <h4 className="text-base font-bold text-slate-100">Análise de Desempenho Operacional</h4>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <p className="text-xs leading-relaxed text-slate-300 font-medium">
                {renderFormattedText(summaryText)}
              </p>

              {/* Grid Resumo Interno */}
              <div className="grid grid-cols-2 gap-3 bg-[#0c1527] p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Melhor Mês</span>
                  <span className="text-[11px] font-black text-slate-100 uppercase">{bestMonth.month}</span>
                  <span className="text-[10px] font-bold text-emerald-400 block">{formatCurrencyBRL(bestMonth.value)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Pior Mês</span>
                  <span className="text-[11px] font-black text-slate-100 uppercase">{worstMonth.month}</span>
                  <span className="text-[10px] font-bold text-rose-400 block">{formatCurrencyBRL(worstMonth.value)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Ticket Médio</span>
                  <span className="text-[11px] font-black text-slate-100">Rendimento/Lanc</span>
                  <span className="text-[10px] font-bold text-purple-400 block">{formatCurrencyBRL(ticketAverage)}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Variação YTD</span>
                  <span className="text-[11px] font-black text-slate-100">Comparativo Anual</span>
                  <span className={cn("text-[10px] font-bold block", ytdVariation >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {ytdVariation >= 0 ? `+${ytdVariation.toFixed(1)}%` : `${ytdVariation.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
