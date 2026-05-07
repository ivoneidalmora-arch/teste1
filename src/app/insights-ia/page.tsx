import { FinancialInsightsCard } from '@/features/finance/components/dashboard/FinancialInsightsCard';
import { Sparkles } from 'lucide-react';

export default function InsightsIAPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
            <Sparkles className="w-5 h-5 fill-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Insights com IA</h1>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Análise Inteligente de Fluxos, Tendências e Detecção de Anomalias
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Painel Principal de Insights */}
        <div className="col-span-12 lg:col-span-4 h-full">
          <FinancialInsightsCard />
        </div>

        {/* Detalhamento e Tendências (Futuro) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-[#0F172A] mb-3">Expansão de Relatórios IA</h2>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Estamos processando seus dados históricos para gerar previsões de fluxo de caixa para os próximos 6 meses, ranking de lucratividade por tipo de serviço e alertas preditivos de manutenção.
            </p>
            <div className="mt-8 flex gap-3">
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                Predição: Ativa
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                Anomalias: Ativa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
