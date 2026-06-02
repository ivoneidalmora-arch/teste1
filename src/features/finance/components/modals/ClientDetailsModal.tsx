import React, { useMemo } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { Transaction } from '@/core/types/finance';
import { formatBRL } from '@/core/utils/formatters';
import { FileText, TrendingUp, ShieldCheck, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  transactions: Transaction[]; // Expects the filtered list from TopClientsCard
}

export function ClientDetailsModal({ isOpen, onClose, clientName, transactions }: Props) {
  const stats = useMemo(() => {
    if (!clientName || !transactions) return null;

    const clientTx = transactions.filter(t => {
      if (t.type !== 'income') return false;
      
      const name = (
        t.customer ??
        (t as any).cliente ??
        (t as any).client ??
        (t as any).nome_cliente ??
        "Cliente não informado"
      ).toString().toUpperCase().trim();
      
      return name === clientName;
    });

    let grossTotal = 0;
    let netTotal = 0;
    const categoriesMap = new Map<string, number>();

    clientTx.forEach(t => {
      const gross = parseFloat(String(
        t.grossAmount ?? (t as any).valor_bruto ?? (t as any).amountBruto ?? t.amount ?? (t as any).valor ?? 0
      ));
      const net = parseFloat(String(
        t.netAmount ?? (t as any).valor_liquido ?? (t as any).amountLiquido ?? t.amount ?? (t as any).valor ?? 0
      ));

      grossTotal += gross;
      netTotal += net;

      const cat = t.category || 'Outros';
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    const categories = Array.from(categoriesMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    return {
      grossTotal,
      netTotal,
      count: clientTx.length,
      categories
    };
  }, [clientName, transactions]);

  if (!isOpen || !stats) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do Cliente`}
      headerColorContext="info"
      maxWidthClass="md:max-w-md"
    >
      <div className="flex flex-col gap-6">
        <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
            {clientName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate text-base">{clientName}</h3>
            <p className="text-blue-300 text-xs">{stats.count} lançamentos neste período</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Receita Bruta</span>
            </div>
            <span className="text-xl font-black text-white">{formatBRL(stats.grossTotal)}</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Receita Líquida</span>
            </div>
            <span className="text-xl font-black text-white">{formatBRL(stats.netTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Tipos de Vistorias / Serviços
          </h4>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {stats.categories.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">Nenhum serviço detalhado</div>
            ) : (
              <ul className="divide-y divide-slate-800/50">
                {stats.categories.map((cat, idx) => (
                  <li key={idx} className="p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                      {cat.qty} {cat.qty === 1 ? 'vez' : 'vezes'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
