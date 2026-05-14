"use client";

import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Lightbulb, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface ExecutiveAIInsightsProps {
  metrics: any;
  loading?: boolean;
}

export function ExecutiveAIInsights({ metrics, loading: parentLoading }: ExecutiveAIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIInsights = async () => {
    if (!metrics) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao gerar insights da IA");
      }

      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      console.error("[ExecutiveAIInsights] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (metrics && !parentLoading) {
      fetchAIInsights();
    }
  }, [metrics, parentLoading]);

  if (parentLoading || loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-2xl" />
          <div className="h-6 w-48 bg-slate-50 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-50 rounded-3xl" />
          <div className="h-32 bg-slate-50 rounded-3xl" />
          <div className="h-32 bg-slate-50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 p-8 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm text-slate-500 font-medium">IA temporariamente indisponível: {error}</p>
        <button 
          onClick={fetchAIInsights}
          className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mx-auto mt-2"
        >
          <RefreshCw className="w-3 h-3" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (insights.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      default: return Info;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'positive': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 relative overflow-hidden group">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <Sparkles className="w-64 h-64 text-indigo-600" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Resumo Executivo IA</h2>
            <p className="text-xs text-slate-400 font-medium">Análise estratégica gerada pelo Gemini 2.0</p>
          </div>
        </div>
        
        <button 
          onClick={fetchAIInsights}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
          title="Recarregar análise"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {insights.map((insight, i) => {
          const Icon = getIcon(insight.type);
          const colorClasses = getColor(insight.severity);
          
          return (
            <div key={i} className="flex flex-col h-full bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", colorClasses.split(' ').slice(0, 3).join(' '))}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-800 text-sm mb-2 uppercase tracking-tight">
                {insight.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {insight.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
