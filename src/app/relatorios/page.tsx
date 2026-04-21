"use client";

import { useReports } from '@/hooks/useReports';
import { ReportChart } from '@/components/reports/ReportChart';
import { CategorySummary } from '@/components/reports/CategorySummary';
import { ClientRanking } from '@/components/reports/ClientRanking';
import { emitirRelatorioPDF } from '@/services/pdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, Filter, Search } from 'lucide-react';
import { IncomeTransaction } from '@/types/transaction';
import { cn } from '@/utils/cn';

export default function RelatoriosPage() {
  const { loading, transactions, metrics, filters } = useReports();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportPDF = () => {
    emitirRelatorioPDF(transactions, {
      totalIncome: metrics.totalIncome,
      totalExpense: metrics.totalExpense,
      netBalance: metrics.netBalance,
      ticketMedio: metrics.ticketMedio,
      dateRange: (filters.startDate || filters.endDate) 
        ? `${filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy') : 'Início'} Até ${filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy') : 'Hoje'}`
        : 'Todos os Lançamentos'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in pb-24">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
         <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-900 tracking-tight">
            Relatórios e Analytics
          </h1>
          <p className="text-slate-500 mt-1">Busca avançada, gráficos modulares e documentos em PDF.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Download className="w-5 h-5" />
          Exportar Oficial (PDF)
        </button>
      </div>

      {/* Caixa de Filtros */}
      <div className="bg-white rounded-2xl p-6 border-detran hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Inicial</label>
            <input type="date" value={filters.startDate} onChange={e => filters.setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Final</label>
            <input type="date" value={filters.endDate} onChange={e => filters.setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Placa (Exata)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" maxLength={7} value={filters.searchPlaca} onChange={e => filters.setSearchPlaca(e.target.value.toUpperCase())} placeholder="ABC1D23" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
            </div>
          </div>
          <div className="w-full md:w-1/5">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cliente (Nome)</label>
             <input type="text" value={filters.searchCliente} onChange={e => filters.setSearchCliente(e.target.value)} placeholder="João Silva..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="w-full md:w-1/5">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
             <select value={filters.filterType} onChange={e => filters.setFilterType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="all">Todas</option>
                <option value="income">Apenas Receitas</option>
                <option value="expense">Apenas Despesas</option>
             </select>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos Superiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReportChart 
            data={
              filters.filterType === 'all' 
                ? [
                    { name: 'Receitas', value: metrics.totalIncome },
                    { name: 'Despesas', value: metrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? metrics.expenseChart : metrics.incomeChart)
            } 
            type={filters.filterType} 
          />
        </div>
        <div className="lg:col-span-1">
          <CategorySummary 
            data={
              filters.filterType === 'all'
                ? [
                    { name: 'Receitas', value: metrics.totalIncome },
                    { name: 'Despesas', value: metrics.totalExpense }
                  ]
                : (filters.filterType === 'expense' ? metrics.expenseChart : metrics.incomeChart)
            } 
            type={filters.filterType}
            totalValue={
              filters.filterType === 'all' 
                ? (metrics.totalIncome + metrics.totalExpense) 
                : (filters.filterType === 'expense' ? metrics.totalExpense : metrics.totalIncome)
            }
          />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-4">
           {/* Card Balanço Geral do Período */}
           <div className={cn(
             "flex-1 rounded-2xl p-6 border flex flex-col justify-center transition-all duration-500 hover:shadow-md",
             metrics.netBalance >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
           )}>
              <span className={cn(
                "text-xs font-bold mb-2 uppercase tracking-widest",
                metrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                Saldo Líquido no Período
              </span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                {formatBRL(metrics.netBalance)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Receitas: {formatBRL(metrics.totalIncome)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Despesas: {formatBRL(metrics.totalExpense)}</span>
                </div>
                <div className="ml-auto">
                   <span className={cn(
                     "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                     metrics.netBalance >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                   )}>
                     {metrics.netBalance >= 0 ? 'Lucro' : 'Déficit'}
                   </span>
                </div>
              </div>
           </div>
           
           {/* Box Ticket Medio */}
           <div className="h-28 bg-slate-900 border-none rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 pointer-events-none">TM</div>
              <span className="text-sm font-medium text-slate-400">Poder de Venda (Ticket Médio)</span>
              <span className="text-2xl font-bold text-white tracking-tight">{formatBRL(metrics.ticketMedio)}/laudo</span>
           </div>
        </div>
      </div>

      {/* Grid Inferior: Ranking de Clientes e Outras Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
            <ClientRanking data={metrics.clientRanking} />
         </div>
         <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
            <h3 className="text-slate-700 font-bold mb-4 opacity-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Estado da Visualização
            </h3>
            <div className="space-y-4">
               <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Registros Filtrados:</span>
                  <p className="text-2xl font-black text-slate-800">{transactions.length}</p>
               </div>
               <div className="pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Subtotal em Tela:</span>
                  <p className="text-2xl font-black text-brand-primary">
                    {transactions.reduce((acc, t) => acc + (t.type === 'income' ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Tabela de Resultados (Desktop > Table, Mobile > Cards) */}
      <div className="bg-white rounded-2xl border-detran overflow-hidden hover:shadow-lg transition-all duration-300">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Listagem Resultante</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded-md">Total: {transactions.length}</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100/50">
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificação</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">Nenhum resultado filtrado.</td>
                  </tr>
                ) : (
                  transactions.map((t, i) => {
                    const isInc = t.type === 'income';
                    return (
                       <tr key={`${t.id}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{format(new Date(t.date), 'dd MMM yyyy', { locale: ptBR })}</td>
                          <td className="py-3 px-6 text-sm text-slate-800 font-medium">{t.category}</td>
                          <td className="py-3 px-6 text-sm text-slate-600">
                             {isInc ? ((t as IncomeTransaction).cliente || 'S/N') : ((t as any).description || 'Despesa')}
                             {isInc && (t as IncomeTransaction).placa && <span className="ml-2 px-2 py-0.5 bg-slate-200/50 text-[10px] rounded border border-slate-200 font-mono">{(t as IncomeTransaction).placa}</span>}
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap">
                             <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                isInc ? "bg-brand-success/10 text-brand-success" : ((t as any).status === 'Pago' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")
                             )}>
                               {isInc ? 'Recebido' : (t as any).status}
                             </div>
                          </td>
                          <td className="py-3 px-6 text-sm font-bold text-right whitespace-nowrap">
                             {isInc ? (
                               <span className="text-brand-success">+{formatBRL((t as IncomeTransaction).amountLiquido || t.amount)}</span>
                             ) : (
                               <span className="text-brand-danger">-{formatBRL(t.amount)}</span>
                             )}
                          </td>
                       </tr>
                    )
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
