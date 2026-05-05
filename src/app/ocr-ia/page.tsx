"use client";

import { Scan, BrainCircuit, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OCRiaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row items-center gap-12 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-purple-600" />
            Inteligência Artificial Ativa
          </div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
            Digitalização Inteligente <br/>
            <span className="text-purple-600">via OCR & IA</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            Nossa tecnologia de Reconhecimento Óptico de Caracteres (OCR) combinada com Modelos de Linguagem de Larga Escala (LLM) 
            permite ler e categorizar vistorias automaticamente a partir de qualquer documento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Link 
              href="/importacoes"
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all group"
            >
              Começar Importação
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all duration-700" />
          <div className="relative bg-white p-8 rounded-[2.5rem] border border-purple-100 shadow-2xl space-y-6">
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200" />
                <div className="flex-1 space-y-2">
                   <div className="h-2 bg-slate-200 rounded w-3/4" />
                   <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 scale-105 transition-transform">
                <ShieldCheck className="w-10 h-10" />
                <div className="flex-1 space-y-1">
                   <div className="h-2 bg-white/40 rounded w-full" />
                   <div className="text-[10px] font-black uppercase">Dados Verificados</div>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Scan className="w-10 h-10 text-slate-400" />
                <div className="flex-1 space-y-2">
                   <div className="h-2 bg-slate-200 rounded w-2/3" />
                   <div className="h-2 bg-slate-200 rounded w-1/3" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Scan className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Leitura Exata</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            Extração de placas, datas e valores diretamente de PDFs da Alfa Vistorias com 99% de acerto.
          </p>
        </div>
        <div className="p-8 space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Categorização por IA</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            O sistema identifica automaticamente se é uma Transferência, Vistoria Cautelar ou Retorno.
          </p>
        </div>
        <div className="p-8 space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Isolamento Seguro</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            Seus dados processados por IA são vinculados exclusivamente ao seu ID de usuário.
          </p>
        </div>
      </div>
    </div>
  );
}
