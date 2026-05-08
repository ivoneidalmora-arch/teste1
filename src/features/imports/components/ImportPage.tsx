"use client";

import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Search,
  Database,
  ArrowRight
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { importParserService } from '../services/import-parser.service';
import { ImportItem } from '../types/import.types';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

export function ImportPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await importParserService.parseFile(file);
      setItems(data);
      toast.success(`${data.length} vistorias encontradas.`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || items.length === 0) return;
    setSaving(true);
    try {
      const transactions = items.map(item => ({
        app_user_id: user.id,
        data: item.data,
        placa: item.placa,
        cliente: item.cliente,
        categoria: item.categoria,
        valor_bruto: item.valorBruto,
        valor_liquido: item.valorLiquido,
        source: 'import',
        status: 'paid'
      }));

      const { error } = await supabase.from('Receitas').insert(transactions);
      if (error) throw error;

      toast.success('Importação concluída com sucesso!');
      setItems([]);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <IconBadge icon={Upload} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Importação de Dados</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Processamento inteligente de CSV, XLSX e PDF</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <button 
              onClick={() => setItems([])}
              className="px-4 py-2 text-[11px] font-black uppercase text-slate-400 hover:text-rose-600 transition-all"
            >
              Cancelar
            </button>
          )}
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx,.pdf" />
            <div className="flex items-center gap-2 px-6 h-12 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Processando...' : 'Selecionar Arquivo'}
            </div>
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-400 mb-2">Nenhum arquivo processado</h3>
          <p className="text-sm font-bold text-slate-300 max-w-sm mx-auto">
            Arraste seu relatório financeiro ou clique no botão para iniciar a extração inteligente de dados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumo da Importação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-600/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total de Itens</p>
              <h3 className="text-3xl font-black">{items.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Valor Total Bruto</p>
              <h3 className="text-2xl font-black text-slate-900">
                {formatBRL(items.reduce((acc, curr) => acc + curr.valorBruto, 0))}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pronto para salvar</p>
                <h3 className="text-2xl font-black text-emerald-600">{items.length} itens</h3>
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 h-12 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Confirmar Salvar
              </button>
            </div>
          </div>

          {/* Tabela de Preview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{item.data}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                          {item.placa}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 uppercase truncate max-w-[150px]">{item.cliente}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{item.categoria}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-slate-900">{formatBRL(item.valorBruto)}</span>
                          <span className="text-[9px] font-bold text-emerald-500">Liq: {formatBRL(item.valorLiquido)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-300 hover:text-rose-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
