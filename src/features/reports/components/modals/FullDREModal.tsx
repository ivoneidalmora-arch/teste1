"use client";

import React, { useState, useMemo } from 'react';
import { X, FileText, Download, ChevronRight, ChevronDown, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ReportMetrics, formatCurrencyBRL } from '../../utils/reportMetrics';
import { BaseModal } from '@/core/components/BaseModal';
import { isIncome, isExpense, getGrossRevenueValue, getNetRevenueValue, getExpenseValue } from '../../../finance/utils/financialValueUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface FullDREModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ReportMetrics;
  transactions: any[];
  periodStr: string;
}

export function FullDREModal({ isOpen, onClose, metrics, transactions, periodStr }: FullDREModalProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowId: string) => {
    setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  // Separação detalhada das transações
  const dreData = useMemo(() => {
    const incomes = transactions.filter(isIncome);
    const expenses = transactions.filter(isExpense);

    // 1. Receitas
    let totalGross = 0;
    let totalNet = 0;
    const grossList: any[] = [];
    const deductionsList: any[] = [];

    incomes.forEach(t => {
      const gross = getGrossRevenueValue(t);
      const net = getNetRevenueValue(t);
      const ded = Math.max(0, gross - net);

      totalGross += gross;
      totalNet += net;

      grossList.push(t);
      if (ded > 0) {
        deductionsList.push({
          ...t,
          amount: ded,
          description: `Dedução/Taxa - ${t.description || t.placa || t.cliente || 'Lançamento'}`
        });
      }
    });

    const totalDeductions = totalGross - totalNet;

    // 2. Despesas por grupos
    const operacionaisList: any[] = [];
    const fixasList: any[] = [];
    const impostosList: any[] = [];
    const variaveisList: any[] = [];

    let totalOperacionais = 0;
    let totalFixas = 0;
    let totalImpostos = 0;
    let totalVariaveis = 0;

    expenses.forEach(t => {
      const val = getExpenseValue(t);
      const category = (t.category || t.categoria || '').toLowerCase();

      if (['operacional', 'manutenção', 'manutencao', 'suprimentos', 'custo operacional'].includes(category)) {
        operacionaisList.push(t);
        totalOperacionais += val;
      } else if (['aluguel', 'folha', 'sistema/software', 'software', 'sistema', 'folha de pagamento'].includes(category)) {
        fixasList.push(t);
        totalFixas += val;
      } else if (['impostos', 'tributos', 'taxa', 'taxas'].includes(category)) {
        impostosList.push(t);
        totalImpostos += val;
      } else {
        variaveisList.push(t);
        totalVariaveis += val;
      }
    });

    const totalExpenses = totalOperacionais + totalFixas + totalImpostos + totalVariaveis;
    const netResult = totalNet - totalExpenses;

    return {
      totalGross,
      totalDeductions,
      totalNet,
      totalOperacionais,
      totalFixas,
      totalImpostos,
      totalVariaveis,
      totalExpenses,
      netResult,
      lists: {
        gross: grossList,
        deductions: deductionsList,
        operacionais: operacionaisList,
        fixas: fixasList,
        impostos: impostosList,
        variaveis: variaveisList
      }
    };
  }, [transactions]);

  // Exportar Tabela DRE para PDF
  const handleExportDREPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cabeçalho Branded
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ALFA PERÍCIA - DRE COMPLETO', 15, 12);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Demonstração do Resultado do Exercício | Período: ${periodStr}`, 15, 20);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 125, 20);

    const tableData = [
      ['Faturamento Bruto', formatCurrencyBRL(dreData.totalGross), '100.0%'],
      ['(-) Deduções e Taxas', formatCurrencyBRL(dreData.totalDeductions), `${((dreData.totalDeductions / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['Receita Líquida', formatCurrencyBRL(dreData.totalNet), `${((dreData.totalNet / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['(-) Custos Operacionais', formatCurrencyBRL(dreData.totalOperacionais), `${((dreData.totalOperacionais / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['(-) Despesas Fixas', formatCurrencyBRL(dreData.totalFixas), `${((dreData.totalFixas / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['(-) Despesas Variáveis', formatCurrencyBRL(dreData.totalVariaveis), `${((dreData.totalVariaveis / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['(-) Impostos e Tributos', formatCurrencyBRL(dreData.totalImpostos), `${((dreData.totalImpostos / (dreData.totalGross || 1)) * 100).toFixed(1)}%`],
      ['DRE / Resultado Líquido', formatCurrencyBRL(dreData.netResult), `${((dreData.netResult / (dreData.totalGross || 1)) * 100).toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: 40,
      margin: { left: 15, right: 15 },
      head: [['Conta DRE', 'Valor Nominal', 'Representação s/ Bruto']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'right' }
      },
      didParseCell: (data) => {
        // Linhas de destaque
        if (data.row.index === 0 || data.row.index === 2 || data.row.index === 7) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === 7) {
            data.cell.styles.fillColor = dreData.netResult >= 0 ? [209, 250, 229] : [254, 226, 226];
          }
        }
      }
    });

    doc.save(`DRE_Alfa_${periodStr.replace(/\s+/g, '_')}.pdf`);
  };

  const getPercentage = (value: number) => {
    if (dreData.totalGross <= 0) return '0.0%';
    return `${((value / dreData.totalGross) * 100).toFixed(1)}%`;
  };

  const renderSubList = (list: any[], type: 'income' | 'expense' | 'deduction') => {
    if (list.length === 0) {
      return (
        <tr className="bg-slate-900/10">
          <td colSpan={3} className="px-10 py-2 text-[10px] text-slate-500 italic">
            Nenhum lançamento nesta categoria no período selecionado.
          </td>
        </tr>
      );
    }

    return list.map((item, idx) => {
      const isInc = type === 'income';
      const val = type === 'deduction' ? item.amount : (isInc ? getNetRevenueValue(item) : getExpenseValue(item));
      const desc = item.description || item.placa || item.cliente || item.category || 'Lançamento sem descrição';
      return (
        <tr key={`${item.id}-${idx}`} className="bg-slate-900/30 border-l-2 border-purple-500/50">
          <td className="px-10 py-1.5 text-[10px] text-slate-400 font-medium">
            {format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy')} — <span className="uppercase text-slate-300 font-bold">{desc}</span>
          </td>
          <td className="px-5 py-1.5 text-right text-[10px] font-bold text-slate-300">
            {isInc ? '+' : '-'} {formatCurrencyBRL(val)}
          </td>
          <td className="px-5 py-1.5 text-right text-[9px] text-slate-500 font-medium">
            {getPercentage(val)}
          </td>
        </tr>
      );
    });
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="DRE - Demonstração de Resultado do Exercício"
      maxWidthClass="md:max-w-4xl"
    >
      <div className="space-y-4">
        {/* Resumo Rápido */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Período de Referência</h3>
              <p className="text-[11px] font-black text-slate-200 uppercase">{periodStr}</p>
            </div>
          </div>
          
          <button
            onClick={handleExportDREPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>

        {/* Tabela DRE Analítica */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850">
                <th className="px-5 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Estrutura de Contas (DRE)</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-[160px]">Valor Nominal</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-[110px]">% s/ Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              
              {/* 1. Faturamento Bruto */}
              <tr 
                onClick={() => toggleRow('gross')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-100 flex items-center gap-1">
                  {expandedRows['gross'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  Faturamento Bruto
                </td>
                <td className="px-5 py-3 text-right text-xs font-black text-slate-100">
                  {formatCurrencyBRL(dreData.totalGross)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-bold text-slate-400">
                  100.0%
                </td>
              </tr>
              {expandedRows['gross'] && renderSubList(dreData.lists.gross, 'income')}

              {/* 2. Deduções */}
              <tr 
                onClick={() => toggleRow('deductions')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-300 pl-8 flex items-center gap-1">
                  {expandedRows['deductions'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  (-) Taxas de Cartão / Deduções
                </td>
                <td className="px-5 py-3 text-right text-xs font-bold text-rose-500">
                  - {formatCurrencyBRL(dreData.totalDeductions)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                  {getPercentage(dreData.totalDeductions)}
                </td>
              </tr>
              {expandedRows['deductions'] && renderSubList(dreData.lists.deductions, 'deduction')}

              {/* 3. Receita Líquida */}
              <tr className="bg-slate-900/20 font-bold border-y border-slate-800">
                <td className="px-5 py-3 text-xs font-black text-slate-200 pl-5">
                  (=) Receita Operacional Líquida
                </td>
                <td className="px-5 py-3 text-right text-xs font-black text-emerald-400">
                  {formatCurrencyBRL(dreData.totalNet)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-black text-slate-400">
                  {getPercentage(dreData.totalNet)}
                </td>
              </tr>

              {/* 4. Custos Operacionais */}
              <tr 
                onClick={() => toggleRow('operacionais')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-300 pl-8 flex items-center gap-1">
                  {expandedRows['operacionais'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  (-) Custos Operacionais (Vistorias)
                </td>
                <td className="px-5 py-3 text-right text-xs font-bold text-rose-500">
                  - {formatCurrencyBRL(dreData.totalOperacionais)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                  {getPercentage(dreData.totalOperacionais)}
                </td>
              </tr>
              {expandedRows['operacionais'] && renderSubList(dreData.lists.operacionais, 'expense')}

              {/* 5. Despesas Fixas */}
              <tr 
                onClick={() => toggleRow('fixas')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-300 pl-8 flex items-center gap-1">
                  {expandedRows['fixas'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  (-) Despesas Administrativas / Fixas
                </td>
                <td className="px-5 py-3 text-right text-xs font-bold text-rose-500">
                  - {formatCurrencyBRL(dreData.totalFixas)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                  {getPercentage(dreData.totalFixas)}
                </td>
              </tr>
              {expandedRows['fixas'] && renderSubList(dreData.lists.fixas, 'expense')}

              {/* 6. Despesas Variáveis */}
              <tr 
                onClick={() => toggleRow('variaveis')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-300 pl-8 flex items-center gap-1">
                  {expandedRows['variaveis'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  (-) Outras Despesas Variáveis
                </td>
                <td className="px-5 py-3 text-right text-xs font-bold text-rose-500">
                  - {formatCurrencyBRL(dreData.totalVariaveis)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                  {getPercentage(dreData.totalVariaveis)}
                </td>
              </tr>
              {expandedRows['variaveis'] && renderSubList(dreData.lists.variaveis, 'expense')}

              {/* 7. Impostos e Tributos */}
              <tr 
                onClick={() => toggleRow('impostos')}
                className="hover:bg-slate-900/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 text-xs font-black text-slate-300 pl-8 flex items-center gap-1">
                  {expandedRows['impostos'] ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  (-) Impostos e Tributação
                </td>
                <td className="px-5 py-3 text-right text-xs font-bold text-rose-500">
                  - {formatCurrencyBRL(dreData.totalImpostos)}
                </td>
                <td className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                  {getPercentage(dreData.totalImpostos)}
                </td>
              </tr>
              {expandedRows['impostos'] && renderSubList(dreData.lists.impostos, 'expense')}

              {/* 8. Resultado Líquido */}
              <tr className={React.isValidElement(null) ? "" : dreData.netResult >= 0 ? "bg-emerald-950/20 border-t-2 border-emerald-500/80" : "bg-rose-950/20 border-t-2 border-rose-500/80"}>
                <td className="px-5 py-3.5 text-xs font-black text-slate-100 pl-5">
                  (=) Resultado Líquido do Período
                </td>
                <td className={`px-5 py-3.5 text-right text-sm font-black ${dreData.netResult >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrencyBRL(dreData.netResult)}
                </td>
                <td className={`px-5 py-3.5 text-right text-[10px] font-black ${dreData.netResult >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {getPercentage(dreData.netResult)}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all border border-slate-800"
          >
            Fechar DRE
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
