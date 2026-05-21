"use client";

import React, { useMemo } from 'react';
import { X, Sparkles, AlertTriangle, TrendingUp, DollarSign, Percent, ShieldCheck } from 'lucide-react';
import { ReportMetrics, formatCurrencyBRL, formatPercentage } from '../../utils/reportMetrics';
import { BaseModal } from '@/core/components/BaseModal';

interface DetailedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ReportMetrics;
  transactions: any[];
}

export function DetailedAnalysisModal({ isOpen, onClose, metrics, transactions }: DetailedAnalysisModalProps) {
  const {
    totalGrossRevenue,
    totalNetRevenue,
    totalExpenses,
    netBalance,
    netMargin,
    bestMonth,
    worstMonth,
    ticketAverage
  } = metrics;

  const diagnosis = useMemo(() => {
    if (totalGrossRevenue === 0) {
      return {
        text: "Sem movimentações financeiras no período. Certifique-se de que os filtros estão corretos ou importe transações para ver o diagnóstico.",
        point: "Nenhum ponto registrado.",
        risk: "Ausência de fluxo de caixa.",
        recommendation: "Realizar importações de relatórios ou conciliar lançamentos pendentes no sistema."
      };
    }

    let text = "";
    let point = "";
    let risk = "";
    let recommendation = "";

    // Lógica de Diagnóstico
    if (netBalance > 0) {
      text = `Sua empresa apresentou um desempenho positivo neste período, finalizando com lucro líquido de ${formatCurrencyBRL(netBalance)}. A margem líquida de ${netMargin.toFixed(1)}% indica que a operação está conseguindo reter valor com eficiência.`;
      
      if (netMargin > 30) {
        point = "Eficiência operacional de alto nível. A retenção líquida está acima de 30%, o que reflete excelente precificação e controle rígido de custos.";
        risk = "Dependência excessiva de picos de sazonalidade ou de poucos clientes de grande volume.";
        recommendation = "Aproveitar o superávit para criar uma reserva de contingência (capital de giro) ou investir em automação de vistorias (como o OCR/IA do sistema).";
      } else {
        point = "Operação saudável com rentabilidade controlada.";
        risk = "Elevação gradual nos custos operacionais ou dedução elevada sobre o faturamento bruto.";
        recommendation = "Revisar a precificação dos serviços de menor margem e negociar custos de fornecedores de insumos ou softwares.";
      }
    } else if (netBalance < 0) {
      text = `Alerta: A operação fechou o período em déficit, registrando prejuízo líquido de ${formatCurrencyBRL(Math.abs(netBalance))}. As saídas financeiras superaram a receita líquida gerada no período.`;
      point = "O volume de faturamento bruto ainda se mantém ativo, indicando que há mercado, mas a retenção final está comprometida.";
      risk = "Despesas fixas excessivas ou custos operacionais desproporcionais ao faturamento do período.";
      recommendation = "Iniciar imediatamente uma auditoria profunda de despesas fixas (como aluguéis, assinaturas e licenças de sistema não utilizadas) e priorizar recebimentos pendentes.";
    } else {
      text = "A operação encerrou o período em ponto de equilíbrio (breakeven), onde as receitas líquidas cobriram exatamente as despesas, sem gerar lucro ou prejuízo.";
      point = "Cobertura integral dos custos da estrutura de negócios.";
      risk = "Ausência de margem de segurança para imprevistos financeiros ou flutuações de mercado.";
      recommendation = "Aumentar o volume de vendas ou revisar contratos de custos fixos para gerar uma margem líquida mínima de segurança de 15%.";
    }

    // Se houver melhor mês dinâmico
    if (bestMonth && bestMonth.value > 0) {
      point += ` O melhor período foi ${bestMonth.month} com faturamento de ${formatCurrencyBRL(bestMonth.value)}.`;
    }

    return { text, point, risk, recommendation };
  }, [totalGrossRevenue, netBalance, netMargin, bestMonth, worstMonth]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Diagnóstico & Análise Financeira"
      headerColorContext={netBalance >= 0 ? 'success' : 'danger'}
    >
      <div className="space-y-6 text-slate-800">
        
        {/* Bloco de Diagnóstico Geral */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Diagnóstico do Período
          </h4>
          <p className="text-xs font-bold leading-relaxed text-slate-600">
            {diagnosis.text}
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Rec. Bruta</span>
            <span className="text-xs font-black text-slate-900 block mt-1">{formatCurrencyBRL(totalGrossRevenue)}</span>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Rec. Líquida</span>
            <span className="text-xs font-black text-slate-900 block mt-1">{formatCurrencyBRL(totalNetRevenue)}</span>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Despesas</span>
            <span className="text-xs font-black text-rose-600 block mt-1">{formatCurrencyBRL(totalExpenses)}</span>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Saldo Líquido</span>
            <span className={cn("text-xs font-black block mt-1", netBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {formatCurrencyBRL(netBalance)}
            </span>
          </div>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Margem Líq.</span>
            <span className={cn("text-xs font-black block mt-1", netMargin >= 15 ? "text-emerald-600" : "text-rose-600")}>
              {formatPercentage(netMargin)}
            </span>
          </div>
        </div>

        {/* Detalhamento Analítico */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          
          {/* Melhor Ponto */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Melhor Ponto Financeiro</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{diagnosis.point}</p>
            </div>
          </div>

          {/* Principal Risco */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Principal Risco</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{diagnosis.risk}</p>
            </div>
          </div>

          {/* Recomendação Prática */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Recomendação Prática</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{diagnosis.recommendation}</p>
            </div>
          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
          >
            Fechar Diagnóstico
          </button>
        </div>

      </div>
    </BaseModal>
  );
}
