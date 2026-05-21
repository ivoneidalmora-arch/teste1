"use client";

import React, { useMemo } from 'react';
import { Card } from '@/core/components/Card';
import { Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/reportMetrics';

interface UpcomingDueDatesCardProps {
  transactions: any[];
}

export function UpcomingDueDatesCard({ transactions }: UpcomingDueDatesCardProps) {
  const dueDates = useMemo(() => {
    // 1. Tenta identificar o ano e mês ativo a partir das transações
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1; // 1-12

    if (transactions.length > 0) {
      // Pega a transação mais recente que tenha data válida
      const validDates = transactions
        .map(t => t.date)
        .filter(d => typeof d === 'string' && d.includes('-'))
        .sort();
      
      if (validDates.length > 0) {
        const latestDate = validDates[validDates.length - 1];
        const parts = latestDate.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
      }
    }

    const monthStr = month.toString().padStart(2, '0');

    // 2. Calcula receitas e despesas para estimar impostos mockados proporcionais e dinâmicos
    const totalIncome = transactions
      .filter(t => t.type === 'income' || t.tipo === 'receita')
      .reduce((acc, t) => acc + (t.amountLiquido || t.amount || t.valor || 0), 0);

    const issEstimated = totalIncome * 0.05; // 5% ISS
    const dasEstimated = totalIncome * 0.06; // 6% Simples Nacional para serviços (anexo III)
    const inssEstimated = 250.00; // Taxa padrão simulada
    const fgtsEstimated = 180.00; // Taxa padrão simulada

    // 3. Monta a lista de vencimentos
    const list = [
      {
        id: 'iss',
        name: 'ISS - Imposto Sobre Serviço',
        date: `${year}-${monthStr}-10`,
        value: issEstimated > 0 ? issEstimated : 350.00,
        status: 'pago' as const,
      },
      {
        id: 'das',
        name: 'DAS - Simples Nacional',
        date: `${year}-${monthStr}-20`,
        value: dasEstimated > 0 ? dasEstimated : 780.00,
        status: 'pendente' as const,
      },
      {
        id: 'fgts',
        name: 'FGTS - Guia Mensal',
        date: `${year}-${monthStr}-07`,
        value: fgtsEstimated,
        status: 'pago' as const,
      },
      {
        id: 'inss',
        name: 'INSS - Pro-Labore / Folha',
        date: `${year}-${monthStr}-20`,
        value: inssEstimated,
        status: 'pendente' as const,
      }
    ];

    // Ordenar por data de vencimento
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // Formata data de YYYY-MM-DD para DD/MM
  const formatDateDM = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status: 'pago' | 'pendente') => {
    if (status === 'pago') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
    return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  };

  const getStatusBadgeStyle = (status: 'pago' | 'pendente') => {
    if (status === 'pago') {
      return 'bg-emerald-50 border-emerald-100 text-emerald-600';
    }
    return 'bg-amber-50 border-amber-100 text-amber-600';
  };

  return (
    <Card className="p-4 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-1 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Próximos Vencimentos</h3>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Calendário Fiscal & Impostos</p>
        </div>
        <Calendar className="w-4.5 h-4.5 text-purple-500" />
      </div>

      {/* Lista de Vencimentos */}
      <div className="flex-1 flex flex-col justify-center gap-2 my-3">
        {dueDates.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between gap-2.5 p-1.5 hover:bg-slate-50/50 rounded-lg transition-all"
          >
            {/* Lado Esquerdo: Data e Nome */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9.5px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                {formatDateDM(item.date)}
              </span>
              <span className="text-[9.5px] font-bold text-slate-700 truncate uppercase tracking-tight">
                {item.name}
              </span>
            </div>

            {/* Lado Direito: Valor e Status */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9.5px] font-black text-slate-900">
                {formatCurrencyBRL(item.value)}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight flex items-center gap-0.5 border ${getStatusBadgeStyle(item.status)}`}>
                {getStatusIcon(item.status)}
                {item.status === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Link de Ação */}
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <button className="text-[9px] font-black text-purple-600 hover:text-purple-700 uppercase tracking-wider flex items-center gap-1 group">
          Ver calendário completo
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Card>
  );
}
