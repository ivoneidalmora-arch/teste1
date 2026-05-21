"use client";

import React from 'react';
import { FileText, Upload, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export function EmptyReportState() {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[350px] animate-in fade-in duration-300">
      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        <FileText className="w-6 h-6" />
      </div>
      
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Nenhum lançamento no período</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed font-semibold">
        Não encontramos transações de receita ou despesa registradas nas datas selecionadas.
      </p>

      {/* Ações recomendadas */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link 
          href="/importacoes"
          className="flex items-center justify-center gap-2 px-4 h-9 border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 bg-white shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          Importar Planilha
        </Link>
        <Link 
          href="/receitas"
          className="flex items-center justify-center gap-2 px-4 h-9 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md shadow-purple-600/10"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Lançar Receita
        </Link>
      </div>
    </div>
  );
}
