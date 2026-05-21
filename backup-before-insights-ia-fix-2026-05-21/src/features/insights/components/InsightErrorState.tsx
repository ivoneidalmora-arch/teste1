"use client";

import { AlertOctagon, RefreshCw, ShieldAlert } from 'lucide-react';

interface InsightErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function InsightErrorState({ error, onRetry }: InsightErrorStateProps) {
  return (
    <div className="bg-rose-50/50 p-16 rounded-[4rem] border border-rose-100 text-center shadow-sm relative overflow-hidden">
      <div className="max-w-md mx-auto space-y-8 relative z-10">
        <div className="relative inline-flex">
           <div className="absolute inset-0 bg-rose-100 rounded-3xl blur-2xl opacity-50" />
           <div className="relative w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-rose-600 border border-rose-100 shadow-xl">
              <AlertOctagon className="w-10 h-10" />
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Erro ao processar insights
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Não foi possível gerar as análises inteligentes no momento. {error}
          </p>
        </div>

        <button 
          onClick={onRetry}
          className="h-14 px-10 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 mx-auto shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
          Tentar Novamente
        </button>

        <div className="pt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
           <ShieldAlert className="w-4 h-4" />
           Suporte Técnico Notificado
        </div>
      </div>
    </div>
  );
}
