"use client";

import { Sparkles, BarChart3, PlusCircle } from 'lucide-react';

export function EmptyInsightsState() {
  return (
    <div className="bg-white p-20 rounded-[4rem] border border-slate-100 text-center shadow-sm relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      
      <div className="max-w-md mx-auto space-y-8 relative z-10">
        <div className="relative inline-flex">
           <div className="absolute inset-0 bg-indigo-100 rounded-3xl blur-2xl opacity-50 animate-pulse" />
           <div className="relative w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xl">
              <Sparkles className="w-10 h-10" />
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Nenhum insight encontrado
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Nossa Inteligência Artificial ainda não detectou tendências ou alertas para o período selecionado. Isso pode significar que seus dados estão estáveis ou que precisamos de mais lançamentos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dica</p>
                 <p className="text-xs font-bold text-slate-600">Adicione mais receitas e despesas</p>
              </div>
           </div>
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <PlusCircle className="w-5 h-5 text-slate-400" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</p>
                 <p className="text-xs font-bold text-slate-600">Verifique os filtros de período</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
