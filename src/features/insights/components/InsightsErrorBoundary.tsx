"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para proteger a aplicação contra falhas críticas na tela de Insights.
 * Garante que um erro em uma página específica não derrube o dashboard inteiro.
 */
export class InsightsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Insights IA:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Ops! Algo deu errado nos Insights
          </h2>
          
          <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
            Não foi possível carregar a análise inteligente agora. 
            O restante do sistema continua funcionando normalmente.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-6 h-12 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <RefreshCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
            
            <Link
              href="/"
              className="flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left max-w-2xl overflow-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Detalhes técnicos (Dev Only):</p>
              <pre className="text-[10px] text-rose-600 font-mono">
                {this.state.error?.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
