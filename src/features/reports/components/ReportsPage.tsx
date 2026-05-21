"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL, cn } from '@/core/utils/formatters';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SeniorFinancialReport } from './SeniorFinancialReport';
import { calculateReportMetrics } from '../utils/reportMetrics';
import { IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';
import { useFinanceContext } from '@/features/finance/contexts/FinanceContext';
import { getInconsistencyGroupsAction } from '@/features/insights/actions/audit.actions';
import { reportPDFService } from '../services/report-pdf.service';
import { ReportHeader } from './ReportHeader';
import { ReportKpiGrid } from './ReportKpiGrid';
import { EmptyReportState } from './EmptyReportState';

export function ReportsPage() {
  const { user } = useAuth();
  const { 
    selectedPeriod, 
    selectedYear, 
    filteredTransactions, 
    loading: contextLoading
  } = useFinanceContext();
  
  const [exportLoading, setExportLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('analytics');
  const [inconsistenciesCount, setInconsistenciesCount] = useState(0);

  // Filtro de data manual sincronizado com o período selecionado
  const [manualPeriod, setManualPeriod] = useState({
    start: '',
    end: ''
  });

  // Sincroniza manualPeriod com o período selecionado no contexto
  useEffect(() => {
    if (selectedPeriod === 'global') {
      setManualPeriod({
        start: `${selectedYear}-01-01`,
        end: `${selectedYear}-12-31`
      });
    } else {
      const monthIdx = parseInt(selectedPeriod) - 1;
      const start = startOfMonth(new Date(selectedYear, monthIdx, 1));
      const end = endOfMonth(new Date(selectedYear, monthIdx, 1));
      setManualPeriod({
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      });
    }
  }, [selectedPeriod, selectedYear]);

  // Carrega quantidade de inconsistências assincronamente da Central de Auditoria
  useEffect(() => {
    let active = true;
    async function loadInconsistencies() {
      try {
        const groups = await getInconsistencyGroupsAction();
        if (!active) return;
        const total = groups.reduce((acc, group) => acc + group.items.length, 0);
        setInconsistenciesCount(total);
      } catch (err) {
        console.error('Erro ao buscar auditoria para relatórios:', err);
      }
    }
    if (user) {
      loadInconsistencies();
    }
    return () => {
      active = false;
    };
  }, [user, selectedPeriod, selectedYear]);

  // Filtra receitas no intervalo selecionado
  const revenues = useMemo(() => 
    (filteredTransactions as IncomeTransaction[]).filter(t => {
      if (t.type !== 'income') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    }),
    [filteredTransactions, manualPeriod]
  );
  
  // Filtra despesas no intervalo selecionado
  const expenses = useMemo(() => 
    (filteredTransactions as ExpenseTransaction[]).filter(t => {
      if (t.type !== 'expense') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    }),
    [filteredTransactions, manualPeriod]
  );

  // Filtragem de busca por texto na listagem de receitas
  const filteredRevenues = useMemo(() => revenues.filter(item => {
    const placaMatch = (item.placa || item.metadata?.placa || '').toLowerCase().includes(search.toLowerCase());
    const clientMatch = (item.cliente || item.customer || '').toLowerCase().includes(search.toLowerCase());
    return placaMatch || clientMatch;
  }), [revenues, search]);

  // Métricas financeiras calculadas a partir das transações no período
  const reportMetrics = useMemo(() => {
    return calculateReportMetrics([...revenues, ...expenses]);
  }, [revenues, expenses]);

  // Handler de exportação para PDF executivo completo
  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      let periodStr = '';
      if (selectedPeriod === 'global') {
        periodStr = `Ano Todo - ${selectedYear}`;
      } else {
        const dateObj = new Date(selectedYear, parseInt(selectedPeriod) - 1, 1);
        periodStr = `${format(dateObj, 'MMMM', { locale: ptBR })} de ${selectedYear}`;
      }

      // Geração do resumo executivo sem marcações markdown para o PDF
      let text = `O período encerrou com uma receita bruta de ${formatBRL(reportMetrics.totalGrossRevenue)}. `;
      if (reportMetrics.netBalance > 0) {
        text += `A operação foi lucrativa, com um saldo líquido de ${formatBRL(reportMetrics.netBalance)} e uma margem de ${reportMetrics.netMargin.toFixed(1)}%. `;
      } else if (reportMetrics.netBalance < 0) {
        text += `A operação registrou prejuízo de ${formatBRL(Math.abs(reportMetrics.netBalance))}. `;
      } else {
        text += "O período fechou em equilíbrio operacional perfeito.";
      }

      await reportPDFService.generateFinancialReport({
        transactions: [...revenues, ...expenses],
        metrics: reportMetrics,
        summaryText: text,
        periodStr,
        modeStr: selectedPeriod === 'global' ? 'Global' : 'Mensal',
        inconsistenciesCount
      });
    } catch (error) {
      console.error('Erro ao gerar relatório em PDF:', error);
      alert('Falha ao processar exportação do PDF. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const hasData = revenues.length > 0 || expenses.length > 0;
  const pageLoading = contextLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-2 lg:p-4 animate-in fade-in duration-300">
      {/* Header Compacto */}
      <ReportHeader 
        manualPeriod={manualPeriod}
        setManualPeriod={setManualPeriod}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onExportPDF={handleExportPDF}
        exportLoading={exportLoading}
      />

      {pageLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Relatórios...</span>
        </div>
      ) : !hasData ? (
        <EmptyReportState />
      ) : (
        <div className="space-y-4">
          {/* Grid de KPIs Compactos */}
          <ReportKpiGrid 
            metrics={reportMetrics} 
            inconsistenciesCount={inconsistenciesCount} 
          />

          {viewMode === 'analytics' ? (
            <SeniorFinancialReport metrics={reportMetrics} />
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-3 duration-300">
              {/* Filtros da Listagem */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-all" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por placa ou cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-11 pr-4 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-600/5 focus:border-purple-600 transition-all shadow-xs"
                  />
                </div>
                
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Saldo do Período</span>
                    <h3 className={cn(
                      "text-sm font-black leading-none",
                      reportMetrics.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatBRL(reportMetrics.netBalance)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tabela de Lançamentos Compacta */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider">Data</th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider">Placa</th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider">Serviço</th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider text-right">Bruto</th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider text-right">Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredRevenues.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400 italic">
                            Nenhum lançamento corresponde à busca
                          </td>
                        </tr>
                      ) : (
                        filteredRevenues.map((item) => (
                          <tr key={item.id} className="group hover:bg-slate-50/30 transition-all cursor-default">
                            <td className="px-5 py-3.5 text-[10px] font-bold text-slate-500">
                              {format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy')}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-700 uppercase tracking-tight">
                                {item.placa || item.metadata?.placa || '---'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-[10px] font-black text-slate-900 uppercase truncate max-w-[200px]">
                              {item.cliente || item.customer || 'AVULSO'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 bg-purple-50 border border-purple-100/50 rounded-lg text-[8px] font-black text-purple-500 uppercase tracking-tighter">
                                {item.category || 'VISTORIA'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-[10px] font-bold text-slate-400">
                              {formatBRL(item.amountBruto || item.amount)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-[11px] font-black text-slate-900">
                              {formatBRL(item.amountLiquido || item.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
