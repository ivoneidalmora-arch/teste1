"use client";

import React, { useState, useMemo } from 'react';
import { CalendarRange, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import { ReportMetrics, formatCurrencyBRL } from '../../utils/reportMetrics';
import { BaseModal } from '@/core/components/BaseModal';
import { isIncome, isExpense, getNetRevenueValue, getExpenseValue } from '../../../finance/utils/financialValueUtils';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FullCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ReportMetrics;
  transactions: any[];
  periodStr: string;
}

type GroupMode = 'daily' | 'weekly' | 'monthly';

export function FullCashFlowModal({ isOpen, onClose, metrics, transactions, periodStr }: FullCashFlowModalProps) {
  const [groupMode, setGroupMode] = useState<GroupMode>('monthly');

  // Lógica de Agrupamento de Fluxo de Caixa
  const cashFlowReport = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number; dateStr: string; dateObj: Date }> = {};
    const weeklyData: Record<string, { income: number; expense: number; weekStr: string; dateObj: Date }> = {};
    const monthlyData: Record<string, { income: number; expense: number; monthStr: string; dateObj: Date }> = {};

    transactions.forEach(t => {
      if (!t.date) return;
      const dateVal = parseISO(t.date);
      const isInc = isIncome(t);
      const val = isInc ? getNetRevenueValue(t) : getExpenseValue(t);

      // 1. Agrupamento Diário
      const dayKey = t.date;
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          income: 0,
          expense: 0,
          dateStr: format(new Date(t.date + 'T12:00:00'), 'dd/MM/yyyy'),
          dateObj: new Date(t.date + 'T12:00:00')
        };
      }
      if (isInc) dailyData[dayKey].income += val;
      else dailyData[dayKey].expense += val;

      // 2. Agrupamento Semanal
      const weekStart = startOfWeek(dateVal, { weekStartsOn: 0 }); // Domingo
      const weekEnd = endOfWeek(dateVal, { weekStartsOn: 0 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      if (!weeklyData[weekKey]) {
        const startStr = format(weekStart, 'dd/MM');
        const endStr = format(weekEnd, 'dd/MM');
        weeklyData[weekKey] = {
          income: 0,
          expense: 0,
          weekStr: `Semana ${startStr} a ${endStr}`,
          dateObj: weekStart
        };
      }
      if (isInc) weeklyData[weekKey].income += val;
      else weeklyData[weekKey].expense += val;

      // 3. Agrupamento Mensal
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        const monthIndex = parseInt(t.date.substring(5, 7)) - 1;
        const MONTH_NAMES = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        monthlyData[monthKey] = {
          income: 0,
          expense: 0,
          monthStr: `${MONTH_NAMES[monthIndex]} / ${t.date.substring(0, 4)}`,
          dateObj: new Date(parseInt(t.date.substring(0, 4)), monthIndex, 1)
        };
      }
      if (isInc) monthlyData[monthKey].income += val;
      else monthlyData[monthKey].expense += val;
    });

    // Converter para arrays ordenados cronologicamente
    const dailyList = Object.values(dailyData)
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(item => ({
        label: item.dateStr,
        income: item.income,
        expense: item.expense,
        balance: item.income - item.expense
      }));

    const weeklyList = Object.values(weeklyData)
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(item => ({
        label: item.weekStr,
        income: item.income,
        expense: item.expense,
        balance: item.income - item.expense
      }));

    const monthlyList = Object.values(monthlyData)
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(item => ({
        label: item.monthStr,
        income: item.income,
        expense: item.expense,
        balance: item.income - item.expense
      }));

    return {
      daily: dailyList,
      weekly: weeklyList,
      monthly: monthlyList
    };
  }, [transactions]);

  const activeFlowList = useMemo(() => {
    if (groupMode === 'daily') return cashFlowReport.daily;
    if (groupMode === 'weekly') return cashFlowReport.weekly;
    return cashFlowReport.monthly;
  }, [cashFlowReport, groupMode]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Fluxo de Caixa Consolidado"
      maxWidthClass="md:max-w-3xl"
    >
      <div className="space-y-4 text-slate-800">
        
        {/* Filtro de Visão e Período */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 rounded-xl border border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Fluxo de Entradas e Saídas</h3>
              <p className="text-[11px] font-black text-slate-200 uppercase">{periodStr}</p>
            </div>
          </div>
          
          {/* Seletores de Agrupamento */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setGroupMode('monthly')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                groupMode === 'monthly' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setGroupMode('weekly')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                groupMode === 'weekly' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setGroupMode('daily')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                groupMode === 'daily' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              Diário
            </button>
          </div>
        </div>

        {/* Tabela do Fluxo */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="px-5 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Período / Referência</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-emerald-500 uppercase tracking-widest w-[130px]">Entradas (+)</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-rose-500 uppercase tracking-widest w-[130px]">Saídas (-)</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-[140px]">Saldo Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeFlowList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-xs font-bold text-slate-500 italic">
                    Sem registros financeiros no período.
                  </td>
                </tr>
              ) : (
                activeFlowList.map((item, idx) => {
                  const isPos = item.balance >= 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3 text-xs font-black text-slate-200 uppercase">
                        {item.label}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-bold text-emerald-400">
                        {formatCurrencyBRL(item.income)}
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-bold text-rose-450">
                        {item.expense > 0 ? `- ${formatCurrencyBRL(item.expense)}` : formatCurrencyBRL(0)}
                      </td>
                      <td className={`px-5 py-3 text-right text-xs font-black ${isPos ? 'text-emerald-400 bg-emerald-950/5' : 'text-rose-450 bg-rose-950/5'}`}>
                        {formatCurrencyBRL(item.balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all border border-slate-800"
          >
            Fechar Fluxo
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
