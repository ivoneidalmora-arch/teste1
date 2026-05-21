"use client";

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, PieChart, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { ReportMetrics, formatCurrencyBRL } from '../../utils/reportMetrics';
import { BaseModal } from '@/core/components/BaseModal';
import { isIncome, isExpense, getNetRevenueValue, getExpenseValue } from '../../../finance/utils/financialValueUtils';
import { format } from 'date-fns';

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ReportMetrics;
  transactions: any[];
  periodStr: string;
}

type TabType = 'income' | 'expense';

export function CategoryDetailsModal({ isOpen, onClose, metrics, transactions, periodStr }: CategoryDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const categoriesSummary = useMemo(() => {
    const incomes = transactions.filter(isIncome);
    const expenses = transactions.filter(isExpense);

    const incomeMap: Record<string, { total: number; count: number; items: any[] }> = {};
    const expenseMap: Record<string, { total: number; count: number; items: any[] }> = {};

    let totalIncomeSum = 0;
    let totalExpenseSum = 0;

    incomes.forEach(t => {
      const val = getNetRevenueValue(t);
      const cat = t.category || 'Vistoria';
      if (!incomeMap[cat]) {
        incomeMap[cat] = { total: 0, count: 0, items: [] };
      }
      incomeMap[cat].total += val;
      incomeMap[cat].count += 1;
      incomeMap[cat].items.push(t);
      totalIncomeSum += val;
    });

    expenses.forEach(t => {
      const val = getExpenseValue(t);
      const cat = t.category || 'Outros';
      if (!expenseMap[cat]) {
        expenseMap[cat] = { total: 0, count: 0, items: [] };
      }
      expenseMap[cat].total += val;
      expenseMap[cat].count += 1;
      expenseMap[cat].items.push(t);
      totalExpenseSum += val;
    });

    const incomeCategories = Object.entries(incomeMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: totalIncomeSum > 0 ? (data.total / totalIncomeSum) * 100 : 0,
        items: data.items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      }))
      .sort((a, b) => b.total - a.total);

    const expenseCategories = Object.entries(expenseMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: totalExpenseSum > 0 ? (data.total / totalExpenseSum) * 100 : 0,
        items: data.items.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      }))
      .sort((a, b) => b.total - a.total);

    return {
      incomeCategories,
      expenseCategories,
      totalIncomeSum,
      totalExpenseSum
    };
  }, [transactions]);

  const activeCategories = activeTab === 'income' ? categoriesSummary.incomeCategories : categoriesSummary.expenseCategories;
  const activeTotal = activeTab === 'income' ? categoriesSummary.totalIncomeSum : categoriesSummary.totalExpenseSum;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalhamento por Categorias"
      maxWidthClass="md:max-w-3xl"
    >
      <div className="space-y-4 text-slate-800">
        
        {/* Cabeçalho de Resumo do Modal */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 rounded-xl border border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Distribuição Financeira</h3>
              <p className="text-[11px] font-black text-slate-200 uppercase">{periodStr}</p>
            </div>
          </div>
          
          {/* Alternador de Abas */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              Receitas
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-350'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              Despesas
            </button>
          </div>
        </div>

        {/* Tabela de Categorias */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="px-5 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-5 py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Lançamentos</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-[150px]">Total Líquido</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-xs font-bold text-slate-500 italic">
                    Nenhuma categoria com movimentações no período.
                  </td>
                </tr>
              ) : (
                activeCategories.map((cat) => {
                  const isExpanded = !!expandedCategories[cat.name];
                  return (
                    <React.Fragment key={cat.name}>
                      {/* Linha Principal da Categoria */}
                      <tr 
                        onClick={() => toggleCategory(cat.name)}
                        className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3 text-xs font-black text-slate-250 flex items-center gap-1.5 uppercase">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-purple-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {cat.name}
                        </td>
                        <td className="px-5 py-3 text-center text-xs font-bold text-slate-400">
                          {cat.count}
                        </td>
                        <td className={`px-5 py-3 text-right text-xs font-black ${activeTab === 'income' ? 'text-emerald-400' : 'text-rose-450'}`}>
                          {formatCurrencyBRL(cat.total)}
                        </td>
                        <td className="px-5 py-3 text-right text-[10px] font-bold text-slate-350">
                          {cat.percentage.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Transações da Categoria quando Expandida */}
                      {isExpanded && cat.items.map((item, idx) => {
                        const amount = activeTab === 'income' ? getNetRevenueValue(item) : getExpenseValue(item);
                        const desc = item.description || item.placa || item.cliente || 'Sem descrição';
                        
                        return (
                          <tr key={`${item.id}-${idx}`} className="bg-slate-900/30 border-l-2 border-purple-500/50">
                            <td className="px-10 py-2 text-[10px] text-slate-450 font-medium">
                              {format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy')} — <span className="uppercase text-slate-350 font-bold">{desc}</span>
                            </td>
                            <td className="px-5 py-2 text-center text-[9px] text-slate-500 font-medium">
                              —
                            </td>
                            <td className="px-5 py-2 text-right text-[10px] font-bold text-slate-350">
                              {activeTab === 'income' ? '+' : '-'} {formatCurrencyBRL(amount)}
                            </td>
                            <td className="px-5 py-2 text-right text-[9px] text-slate-500 font-medium">
                              {activeTotal > 0 ? `${((amount / activeTotal) * 100).toFixed(1)}%` : '0.0%'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
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
            Fechar Detalhes
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
