"use client";

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface ExecutiveSummaryCardProps {
  summaryText: string;
  isProfit: boolean;
}

export function ExecutiveSummaryCard({ summaryText, isProfit }: ExecutiveSummaryCardProps) {
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
      <div className="bg-slate-900 rounded-2xl p-3.5 text-white relative overflow-hidden shadow-md flex items-center justify-between gap-4">
        {/* Background Glow sutil */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
          {/* Indicador de Status Executivo */}
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-t-transparent animate-spin",
              isProfit ? "border-emerald-400" : "border-rose-400"
            )} style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
              Resumo Executivo do Período
            </h2>
            <p className="text-xs font-semibold leading-relaxed text-slate-200 line-clamp-2">
              {renderFormattedText(summaryText)}
            </p>
          </div>
        </div>

        {/* Ação "Ver Mais" */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border border-white/5"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          Ver tudo
        </button>
      </div>

      {/* Modal Executivo Completo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200">
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
                <h4 className="text-base font-bold text-slate-100">Análise Completa do Período</h4>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="border-t border-slate-800 pt-4">
              <p className="text-sm leading-relaxed text-slate-300 font-medium">
                {renderFormattedText(summaryText)}
              </p>
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
