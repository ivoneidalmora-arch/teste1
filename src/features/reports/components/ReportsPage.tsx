"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL, cn } from '@/core/utils/formatters';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { SeniorFinancialReport } from './SeniorFinancialReport';
import { calculateReportMetrics } from '../utils/reportMetrics';
import { IncomeTransaction, ExpenseTransaction } from '@/core/types/finance';
import { useFinanceContext } from '@/features/finance/contexts/FinanceContext';
import { getInconsistencyGroupsAction } from '@/features/insights/actions/audit.actions';
import { reportPDFService } from '../services/report-pdf.service';
import { transactionService } from '@/features/finance/services/transaction.service';
import { ReportHeader } from './ReportHeader';
import { ReportKpiGrid } from './ReportKpiGrid';
import { EmptyReportState } from './EmptyReportState';

// Modais Analíticos Avançados
import { DetailedAnalysisModal } from './modals/DetailedAnalysisModal';
import { FullDREModal } from './modals/FullDREModal';
import { CategoryDetailsModal } from './modals/CategoryDetailsModal';
import { FullCashFlowModal } from './modals/FullCashFlowModal';
import { FullComparisonModal } from './modals/FullComparisonModal';

// Modais Auxiliares
import { InconsistenciesModal } from '@/features/insights/components/diagnostics/InconsistenciesModal';
import { EditTransactionModal } from '@/features/finance/components/modals/EditTransactionModal';
import { BaseModal } from '@/core/components/BaseModal';

export function ReportsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
    selectedPeriod, 
    selectedYear, 
    filteredTransactions, 
    loading: contextLoading,
    refresh
  } = useFinanceContext();
  
  const [exportLoading, setExportLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [inconsistencyGroups, setInconsistencyGroups] = useState<any[]>([]);
  const [loadingInconsistencies, setLoadingInconsistencies] = useState(false);

  // Estados dos Modais Analíticos
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(false);
  const [isDREOpen, setIsDREOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isInconsistenciesOpen, setIsInconsistenciesOpen] = useState(false);

  // Estados de Visualização / Edição / Exclusão de Transações
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransactionForView, setSelectedTransactionForView] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Filtros sincronizados com a URL de forma reativa e bidirecional
  const selectedType = searchParams.get('tipo') || 'global';
  const viewMode = searchParams.get('view') === 'listagem' ? 'list' : 'analytics';

  const setSelectedType = (tipo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tipo === 'global') {
      params.delete('tipo');
    } else {
      params.set('tipo', tipo);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setViewMode = (mode: 'list' | 'analytics') => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'analytics') {
      params.delete('view');
    } else {
      params.set('view', 'listagem');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Ordenação da tabela de listagem unificada
  const [sortField, setSortField] = useState<'date' | 'category' | 'name' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Paginação real (10 itens por página)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtro de data manual sincronizado com o período selecionado no contexto
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

  const currentPeriodStr = useMemo(() => {
    if (selectedPeriod === 'global') {
      return `Ano Todo - ${selectedYear}`;
    }
    const monthIdx = parseInt(selectedPeriod) - 1;
    if (isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
      return `Ano Todo - ${selectedYear}`;
    }
    const dateObj = new Date(selectedYear, monthIdx, 1);
    return `${format(dateObj, 'MMMM', { locale: ptBR })} de ${selectedYear}`;
  }, [selectedPeriod, selectedYear]);

  // Carrega inconsistências da Central de Auditoria para o KPI
  const loadInconsistencies = async () => {
    if (!user) return;
    setLoadingInconsistencies(true);
    try {
      const groups = await getInconsistencyGroupsAction();
      setInconsistencyGroups(groups);
    } catch (err) {
      console.error('Erro ao buscar auditoria para relatórios:', err);
    } finally {
      setLoadingInconsistencies(false);
    }
  };

  useEffect(() => {
    loadInconsistencies();
  }, [user, selectedPeriod, selectedYear]);

  const inconsistenciesCount = useMemo(() => {
    return inconsistencyGroups.reduce((acc, group) => acc + (group.items?.length || 0), 0);
  }, [inconsistencyGroups]);

  const allInconsistencyRecords = useMemo(() => {
    return inconsistencyGroups.flatMap(group => group.items || []);
  }, [inconsistencyGroups]);

  // Validação rígida de datas: se Data Inicial > Data Final
  const isPeriodInvalid = useMemo(() => {
    if (!manualPeriod.start || !manualPeriod.end) return false;
    return manualPeriod.start > manualPeriod.end;
  }, [manualPeriod]);

  // Emite toast de aviso imediato em caso de datas inconsistentes
  useEffect(() => {
    if (isPeriodInvalid) {
      toast.error('Período de datas inválido: a data de início não pode ser posterior à data de término.', {
        id: 'date-validation-inconsistency'
      });
    }
  }, [isPeriodInvalid]);

  // Filtra receitas no intervalo selecionado aplicando regras de tipo de relatório
  const revenues = useMemo(() => {
    if (isPeriodInvalid) return [];
    if (selectedType === 'despesas') return [];

    let list = (filteredTransactions as IncomeTransaction[]).filter(t => {
      if (t.type !== 'income') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    });

    // Se o tipo for "servicos", filtra receitas apenas pelas categorias correspondentes
    if (selectedType === 'servicos') {
      list = list.filter(r => {
        const cat = (r.category || '').toLowerCase();
        return (
          cat.includes('vistoria') ||
          cat.includes('transferência') ||
          cat.includes('transferencia') ||
          cat.includes('laudo')
        );
      });
    }

    return list;
  }, [filteredTransactions, manualPeriod, selectedType, isPeriodInvalid]);
  
  // Filtra despesas no intervalo selecionado aplicando regras de tipo de relatório
  const expenses = useMemo(() => {
    if (isPeriodInvalid) return [];
    if (selectedType === 'receitas' || selectedType === 'servicos') return [];

    return (filteredTransactions as ExpenseTransaction[]).filter(t => {
      if (t.type !== 'expense') return false;
      if (!manualPeriod.start || !manualPeriod.end) return true;
      return t.date >= manualPeriod.start && t.date <= manualPeriod.end;
    });
  }, [filteredTransactions, manualPeriod, selectedType, isPeriodInvalid]);

  // Combina as listas para a visão analítica e listagem unificada
  const combinedTransactions = useMemo(() => {
    return [...revenues, ...expenses];
  }, [revenues, expenses]);

  // Filtragem de busca por texto reativa (Placa, Cliente ou Descrição)
  const searchedTransactions = useMemo(() => {
    if (!search.trim()) return combinedTransactions;
    const query = search.toLowerCase();
    return combinedTransactions.filter((item: any) => {
      const placa = (item.placa || item.metadata?.placa || '').toLowerCase();
      const client = (item.cliente || item.customer || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();

      return placa.includes(query) || client.includes(query) || desc.includes(query) || cat.includes(query);
    });
  }, [combinedTransactions, search]);

  // Ordenação flexível pelas colunas
  const sortedTransactions = useMemo(() => {
    return [...searchedTransactions].sort((a: any, b: any) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'date') {
        valA = a.date || '';
        valB = b.date || '';
      } else if (sortField === 'category') {
        valA = a.category || '';
        valB = b.category || '';
      } else if (sortField === 'name') {
        valA = (a.type === 'income' ? (a.cliente || a.customer || 'AVULSO') : (a.description || 'DESPESA')).toLowerCase();
        valB = (b.type === 'income' ? (b.cliente || b.customer || 'AVULSO') : (b.description || 'DESPESA')).toLowerCase();
      } else if (sortField === 'amount') {
        valA = a.type === 'income' ? (a.netAmount || a.amount) : a.amount;
        valB = b.type === 'income' ? (b.netAmount || b.amount) : b.amount;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedTransactions, sortField, sortDirection]);

  // Reseta paginação ao alterar busca ou filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedPeriod, selectedYear]);

  // Paginação
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Ordenação Helper
  const handleSort = (field: 'date' | 'category' | 'name' | 'amount') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Métricas financeiras calculadas a partir das transações no período
  const reportMetrics = useMemo(() => {
    if (isPeriodInvalid) {
      return calculateReportMetrics([]);
    }
    return calculateReportMetrics(combinedTransactions);
  }, [combinedTransactions, isPeriodInvalid]);

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

      // Geração do resumo executivo para o PDF
      let text = `O período encerrou com uma receita bruta de ${formatBRL(reportMetrics.totalGrossRevenue)}. `;
      if (reportMetrics.netBalance > 0) {
        text += `A operação foi lucrativa, com um saldo líquido de ${formatBRL(reportMetrics.netBalance)} e uma margem de ${reportMetrics.netMargin.toFixed(1)}%. `;
      } else if (reportMetrics.netBalance < 0) {
        text += `A operação registrou prejuízo de ${formatBRL(Math.abs(reportMetrics.netBalance))}. `;
      } else {
        text += "O período fechou em equilíbrio operacional perfeito.";
      }

      await reportPDFService.generateFinancialReport({
        transactions: combinedTransactions,
        metrics: reportMetrics,
        summaryText: text,
        periodStr,
        modeStr: selectedPeriod === 'global' ? 'Global' : 'Mensal',
        inconsistenciesCount
      });
    } catch (error) {
      console.error('Erro ao gerar relatório em PDF:', error);
      toast.error('Falha ao processar exportação do PDF. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  // Ações de Transação: Visualizar
  const handleView = (transaction: any) => {
    setSelectedTransactionForView(transaction);
    setIsViewOpen(true);
  };

  // Ações de Transação: Editar
  const handleEdit = (transaction: any) => {
    setSelectedTransactionForEdit(transaction);
    setIsEditOpen(true);
  };

  // Ações de Transação: Excluir
  const handleDelete = async (transaction: any) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento permanentemente?')) return;
    
    const deleteToast = toast.loading('Excluindo lançamento...');
    try {
      if (!user) throw new Error('Usuário não autenticado');
      await transactionService.delete(transaction.id, transaction.type, user.id);
      toast.success('Lançamento excluído com sucesso!', { id: deleteToast });
      await refresh();
      await loadInconsistencies();
    } catch (err: any) {
      console.error('[ReportsPage] Erro ao excluir transação:', err);
      toast.error('Erro ao excluir lançamento: ' + (err.message || 'Erro desconhecido'), { id: deleteToast });
    }
  };

  const handleEditSuccess = async () => {
    await refresh();
    await loadInconsistencies();
  };

  const handleResolveInconsistency = async () => {
    await loadInconsistencies();
    await refresh();
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
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {pageLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Relatórios...</span>
        </div>
      ) : isPeriodInvalid ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center max-w-lg mx-auto my-12 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider mb-2">Inconsistência de Datas</h3>
          <p className="text-xs font-bold text-rose-600/80 leading-relaxed">
            A data de início ({manualPeriod.start ? format(new Date(manualPeriod.start + 'T12:00:00'), 'dd/MM/yyyy') : '---'}) é posterior à data de término ({manualPeriod.end ? format(new Date(manualPeriod.end + 'T12:00:00'), 'dd/MM/yyyy') : '---'}). Por favor, ajuste o filtro de período acima.
          </p>
        </div>
      ) : !hasData ? (
        <EmptyReportState />
      ) : (
        <div className="space-y-4">
          {/* Grid de KPIs Compactos */}
          <ReportKpiGrid 
            metrics={reportMetrics} 
            inconsistenciesCount={inconsistenciesCount} 
            onTransactionsClick={() => setViewMode('list')}
            onInconsistenciesClick={() => setIsInconsistenciesOpen(true)}
          />

          {viewMode === 'analytics' ? (
            <SeniorFinancialReport 
              metrics={reportMetrics} 
              transactions={combinedTransactions} 
              onViewDetailedAnalysis={() => setIsDetailedAnalysisOpen(true)}
              onViewDRE={() => setIsDREOpen(true)}
              onViewCategories={() => setIsCategoriesOpen(true)}
              onViewCashFlow={() => setIsCashFlowOpen(true)}
              onViewComparison={() => setIsComparisonOpen(true)}
            />
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-3 duration-300">
              {/* Filtros da Listagem */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-all" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por placa, cliente, descrição ou categoria..."
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
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th 
                          onClick={() => handleSort('date')}
                          className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 select-none"
                        >
                          <div className="flex items-center gap-1">
                            Data
                            {sortField === 'date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-purple-600" /> : <ChevronDown className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                        </th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider select-none">
                          Placa
                        </th>
                        <th 
                          onClick={() => handleSort('name')}
                          className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 select-none"
                        >
                          <div className="flex items-center gap-1">
                            Cliente / Descrição
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-purple-600" /> : <ChevronDown className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('category')}
                          className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 select-none"
                        >
                          <div className="flex items-center gap-1">
                            Categoria
                            {sortField === 'category' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-purple-600" /> : <ChevronDown className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                        </th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider text-right select-none">
                          Bruto
                        </th>
                        <th 
                          onClick={() => handleSort('amount')}
                          className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:text-slate-600 select-none"
                        >
                          <div className="flex items-center gap-1 justify-end">
                            Líquido
                            {sortField === 'amount' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-purple-600" /> : <ChevronDown className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                        </th>
                        <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-wider text-center select-none">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-slate-400 italic">
                            Nenhum lançamento corresponde à busca ou filtros
                          </td>
                        </tr>
                      ) : (
                        paginatedTransactions.map((item: any) => {
                          const isIncome = item.type === 'income';
                          return (
                            <tr key={item.id} className="group hover:bg-slate-50/30 transition-all cursor-default">
                              <td className="px-5 py-3.5 text-[10px] font-bold text-slate-500">
                                {format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy')}
                              </td>
                              <td className="px-5 py-3.5">
                                {isIncome ? (
                                  <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-700 uppercase tracking-tight">
                                    {item.placa || item.metadata?.placa || '---'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400">---</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 truncate max-w-[200px]">
                                {isIncome ? (
                                  <div className="text-[10px] font-black text-slate-900 uppercase truncate">
                                    {item.cliente || item.customer || 'AVULSO'}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-bold text-slate-600 uppercase truncate">
                                    {item.description || 'DESPESA'}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                {isIncome ? (
                                  <span className="px-2 py-0.5 bg-purple-50 border border-purple-100/50 rounded-lg text-[8px] font-black text-purple-500 uppercase tracking-tighter">
                                    {item.category || 'VISTORIA'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-100/50 rounded-lg text-[8px] font-black text-rose-500 uppercase tracking-tighter">
                                    {item.category || 'DESPESA'}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right text-[10px] font-bold text-slate-400">
                                {isIncome ? formatBRL(item.amountBruto || item.grossAmount || item.amount) : '---'}
                              </td>
                              <td className={cn(
                                "px-5 py-3.5 text-right text-[11px] font-black",
                                isIncome ? "text-slate-900" : "text-rose-600"
                              )}>
                                {isIncome ? formatBRL(item.amountLiquido || item.netAmount || item.amount) : `- ${formatBRL(item.amount)}`}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleView(item)}
                                    title="Visualizar Detalhes"
                                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-md transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(item)}
                                    title="Editar Lançamento"
                                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-purple-600 rounded-md transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    title="Excluir Lançamento"
                                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-50 bg-slate-50/20 gap-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} de {sortedTransactions.length} registros
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 h-8 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <div className="px-3 text-[10px] font-black text-slate-700">
                        Página {currentPage} de {totalPages}
                      </div>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 h-8 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modais Analíticos Avançados */}
      <DetailedAnalysisModal 
        isOpen={isDetailedAnalysisOpen}
        onClose={() => setIsDetailedAnalysisOpen(false)}
        metrics={reportMetrics}
        transactions={combinedTransactions}
      />

      <FullDREModal 
        isOpen={isDREOpen}
        onClose={() => setIsDREOpen(false)}
        metrics={reportMetrics}
        transactions={combinedTransactions}
        periodStr={currentPeriodStr}
      />

      <CategoryDetailsModal 
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        metrics={reportMetrics}
        transactions={combinedTransactions}
        periodStr={currentPeriodStr}
      />

      <FullCashFlowModal 
        isOpen={isCashFlowOpen}
        onClose={() => setIsCashFlowOpen(false)}
        transactions={combinedTransactions}
        metrics={reportMetrics}
        periodStr={currentPeriodStr}
      />

      <FullComparisonModal 
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        transactions={combinedTransactions}
        metrics={reportMetrics}
        periodStr={currentPeriodStr}
      />

      {/* Modal Central de Auditoria / Inconsistências */}
      <InconsistenciesModal 
        isOpen={isInconsistenciesOpen}
        onClose={() => setIsInconsistenciesOpen(false)}
        records={allInconsistencyRecords}
        userId={user?.id}
        onResolve={handleResolveInconsistency}
        onEditTransaction={(item) => {
          setIsInconsistenciesOpen(false);
          handleEdit(item);
        }}
      />

      {/* Modal de Edição de Transações */}
      <EditTransactionModal 
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTransactionForEdit(null);
        }}
        onSuccess={handleEditSuccess}
        transaction={selectedTransactionForEdit}
        existingTransactions={filteredTransactions}
      />

      {/* Modal de Visualização da Transação */}
      <BaseModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedTransactionForView(null);
        }}
        title={`Visualizar ${selectedTransactionForView?.type === 'income' ? 'Receita' : 'Despesa'}`}
        headerColorContext={selectedTransactionForView?.type === 'income' ? 'success' : 'danger'}
      >
        {selectedTransactionForView && (
          <div className="space-y-6 text-slate-800">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID do Registro</span>
                <span className="text-xs font-mono text-slate-600">#{selectedTransactionForView.id}</span>
              </div>
              <div className={cn(
                 "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                 selectedTransactionForView.type === 'income' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              )}>
                {selectedTransactionForView.type === 'income' ? 'Entrada / Receita' : 'Saída / Despesa'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTransactionForView.type === 'income' ? (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Cliente</span>
                    <span className="text-xs font-black text-slate-900 uppercase block mt-1">
                      {selectedTransactionForView.cliente || selectedTransactionForView.customer || 'AVULSO'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Placa</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-700 uppercase tracking-tight inline-block mt-1">
                      {selectedTransactionForView.placa || selectedTransactionForView.metadata?.placa || '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Categoria</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">{selectedTransactionForView.category || 'Vistoria'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Data</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      {format(new Date(selectedTransactionForView.date + 'T12:00:00'), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor Bruto</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      {formatBRL(selectedTransactionForView.amountBruto || selectedTransactionForView.grossAmount || selectedTransactionForView.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor Líquido</span>
                    <span className="text-xs font-black text-emerald-600 block mt-1">
                      {formatBRL(selectedTransactionForView.amountLiquido || selectedTransactionForView.netAmount || selectedTransactionForView.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Forma de Pagamento</span>
                    <span className="text-xs font-bold text-slate-600 block mt-1">
                      {selectedTransactionForView.metadata?.pagamento || 'Pix'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nota Fiscal (NF)</span>
                    <span className="text-xs font-mono text-slate-600 block mt-1">
                      {selectedTransactionForView.metadata?.nf || '---'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Descrição</span>
                    <span className="text-xs font-black text-slate-900 uppercase block mt-1">
                      {selectedTransactionForView.description || 'Despesa sem descrição'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Categoria</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">{selectedTransactionForView.category || 'Geral'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Data</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      {format(new Date(selectedTransactionForView.date + 'T12:00:00'), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Vencimento</span>
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      {selectedTransactionForView.dueDate ? format(new Date(selectedTransactionForView.dueDate + 'T12:00:00'), 'dd/MM/yyyy') : '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor</span>
                    <span className="text-xs font-black text-rose-600 block mt-1">
                      {formatBRL(selectedTransactionForView.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase inline-block mt-1",
                      selectedTransactionForView.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {selectedTransactionForView.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </>
              )}

              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Observações</span>
                <span className="text-xs text-slate-600 block mt-1 whitespace-pre-wrap leading-relaxed">
                  {selectedTransactionForView.metadata?.observacao || 'Nenhuma observação cadastrada.'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedTransactionForView(null);
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
