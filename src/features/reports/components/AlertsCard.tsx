"use client";

import React, { useMemo } from 'react';
import { Card } from '@/core/components/Card';
import { AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/reportMetrics';

interface AlertsCardProps {
  transactions: any[];
}

export function AlertsCard({ transactions }: AlertsCardProps) {
  const alerts = useMemo(() => {
    const list: { id: string; type: 'high' | 'medium' | 'low'; title: string; desc: string }[] = [];

    // 1. Verificar receitas sem categoria ou categorizadas como "Outros"
    const uncategorizedIncomes = transactions.filter(
      t => (t.type === 'income' || t.tipo === 'receita') && 
           (!t.category || t.category === 'Outros' || t.categoria === 'Outros')
    );
    if (uncategorizedIncomes.length > 0) {
      const totalVal = uncategorizedIncomes.reduce((acc, t) => acc + (t.amount || t.valor || 0), 0);
      list.push({
        id: 'uncategorized-income',
        type: 'medium',
        title: 'Receitas não categorizadas',
        desc: `${uncategorizedIncomes.length} lançamento(s) sem classificação (${formatCurrencyBRL(totalVal)}).`
      });
    }

    // 2. Verificar se há despesas de valor muito alto sem comprovante (simulado)
    const highValueExpenses = transactions.filter(
      t => (t.type === 'expense' || t.tipo === 'despesa') && 
           (t.amount || t.valor || 0) > 3000
    );
    if (highValueExpenses.length > 0) {
      list.push({
        id: 'high-value-expense',
        type: 'low',
        title: 'Despesas de valor elevado',
        desc: `${highValueExpenses.length} despesa(s) acima de R$ 3.000,00 requerem auditoria de recibos.`
      });
    }

    // 3. Adicionar um alerta fiscal de alta prioridade mockado caso o imposto do mês não tenha sido detectado
    const hasTaxes = transactions.some(
      t => t.category?.toLowerCase().includes('imposto') || 
           t.categoria?.toLowerCase().includes('tributo') ||
           t.category?.toLowerCase().includes('simples nacional')
    );
    if (!hasTaxes) {
      list.push({
        id: 'missing-tax-payment',
        type: 'high',
        title: 'Guia DAS / Imposto não conciliado',
        desc: 'Nenhuma conciliação de tributos detectada no período ativo.'
      });
    }

    // Caso a lista esteja vazia, garantir um alerta informativo ou de conformidade
    if (list.length === 0) {
      list.push({
        id: 'compliance-ok',
        type: 'low',
        title: 'Análise de conformidade em dia',
        desc: 'Todas as movimentações seguem o padrão operacional padrão.'
      });
    }

    return list.slice(0, 3); // Limitar a 3 alertas para manter o layout compacto
  }, [transactions]);

  const getAlertIcon = (type: 'high' | 'medium' | 'low') => {
    switch (type) {
      case 'high':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getAlertBadgeStyle = (type: 'high' | 'medium' | 'low') => {
    switch (type) {
      case 'high':
        return 'bg-rose-50 border-rose-100/50 text-rose-700';
      case 'medium':
        return 'bg-amber-50 border-amber-100/50 text-amber-700';
      case 'low':
        return 'bg-blue-50 border-blue-100/50 text-blue-700';
    }
  };

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Alertas & Conformidade</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Diagnóstico de Riscos</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-[8px] font-black uppercase text-slate-500">
          Auditoria Ativa
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 my-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-2 rounded-xl border flex gap-2.5 items-start ${getAlertBadgeStyle(alert.type)}`}
          >
            {getAlertIcon(alert.type)}
            <div className="min-w-0">
              <h4 className="text-[9.5px] font-black uppercase tracking-tight leading-none mb-0.5">
                {alert.title}
              </h4>
              <p className="text-[8.5px] font-medium leading-tight opacity-90">
                {alert.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver painel de auditoria
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
