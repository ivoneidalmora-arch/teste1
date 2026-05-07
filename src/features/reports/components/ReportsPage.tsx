"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ChevronDown,
  Calendar,
  Printer,
  Table as TableIcon
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { reportPDFService } from '../services/report-pdf.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase
        .from('Receitas')
        .select('*')
        .eq('app_user_id', user!.id)
        .gte('data', period.start)
        .lte('data', period.end)
        .order('data', { ascending: false });

      if (error) throw error;
      setData(res || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    item.placa?.toLowerCase().includes(search.toLowerCase()) ||
    item.cliente?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportPDF = () => {
    const periodStr = `${format(new Date(period.start), 'dd/MM')} a ${format(new Date(period.end), 'dd/MM/yyyy')}`;
    reportPDFService.generateFinancialReport(filteredData, periodStr);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <IconBadge icon={FileText} variant="purple" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Relatórios Financeiros</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gestão avançada de faturamento e vistorias</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <input 
              type="date" 
              value={period.start}
              onChange={(e) => setPeriod(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent border-none text-[10px] font-black uppercase text-slate-500 focus:ring-0"
            />
            <span className="text-slate-300 px-2">→</span>
            <input 
              type="date" 
              value={period.end}
              onChange={(e) => setPeriod(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent border-none text-[10px] font-black uppercase text-slate-500 focus:ring-0"
            />
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 h-12 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/20"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Filtros e Busca */}
        <div className="col-span-12 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-all" />
            <input 
              type="text" 
              placeholder="Pesquisar por placa ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Líquido</span>
              <h3 className="text-xl font-black text-emerald-600">
                {formatBRL(filteredData.reduce((acc, curr) => acc + (curr.valor_liquido || 0), 0))}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="col-span-12 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Bruto</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <RefreshCw className="w-6 h-6 text-slate-300 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400 italic">Nenhum dado encontrado no período</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/30 transition-all cursor-default">
                      <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                        {format(new Date(item.data), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                          {item.placa}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-black text-[#0F172A] uppercase truncate max-w-[200px]">{item.cliente || 'AVULSO'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[11px] font-bold text-slate-400">{formatBRL(item.valor_bruto)}</td>
                      <td className="px-6 py-4 text-right text-[12px] font-black text-slate-900">{formatBRL(item.valor_liquido)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
