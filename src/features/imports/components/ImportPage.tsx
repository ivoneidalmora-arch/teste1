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
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ValidatedImportItem, ImportItemSchema } from '../schemas/import.schema';

export function ImportPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await importParserService.parseFile(file);
      
      // Validar cada item com Zod
      const validatedData = data.map(item => {
        const result = ImportItemSchema.safeParse(item);
        return {
          ...item,
          isValid: result.success,
          errors: result.success ? [] : result.error.errors.map(err => err.message)
        };
      });

      setItems(validatedData);
      toast.success(`${data.length} vistorias encontradas.`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || items.length === 0) return;
    
    const validItems = items.filter(i => i.isValid);
    if (validItems.length === 0) {
      toast.error('Nenhum item válido para importar.');
      return;
    }

    setSaving(true);
    try {
      const transactions = validItems.map(item => ({
        app_user_id: user.id,
        date: item.data,
        placa: item.placa,
        cliente: item.cliente,
        category: item.categoria,
        amountBruto: item.valorBruto,
        amountLiquido: item.valorLiquido,
        amount: item.valorBruto,
        status: 'paid',
        observacao: 'IMPORTADO VIA SISTEMA'
      }));

      const { error } = await supabase.from('Receitas').insert(transactions);
      if (error) throw error;

      toast.success(`${validItems.length} registros salvos com sucesso!`);
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
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Validação rigorosa pré-inserção</p>
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
              {loading ? 'Validando...' : 'Importar Arquivo'}
            </div>
          </label>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Detectado</p>
              <h3 className="text-3xl font-black">{items.length}</h3>
            </div>
            <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Prontos para Salvar</p>
              <h3 className="text-3xl font-black">{items.filter(i => i.isValid).length}</h3>
            </div>
            <div className="bg-rose-600 p-6 rounded-3xl text-white shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Inconsistentes</p>
              <h3 className="text-3xl font-black">{items.filter(i => !i.isValid).length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Search className="w-4 h-4" />
                Pré-visualização e Validação
              </h2>
              <button 
                onClick={handleSave}
                disabled={saving || items.filter(i => i.isValid).length === 0}
                className="flex items-center gap-2 px-6 h-10 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Processar {items.filter(i => i.isValid).length} Válidos
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Placa</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente / Serviço</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Valores</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={idx} className={cn("group transition-all", !item.isValid && "bg-rose-50/30")}>
                      <td className="px-6 py-4">
                        {item.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <div className="group/error relative">
                            <AlertTriangle className="w-5 h-5 text-rose-500 cursor-help" />
                            <div className="absolute left-8 top-0 hidden group-hover/error:block z-50 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg shadow-xl">
                              {item.errors.map((e: string, i: number) => (
                                <div key={i}>• {e}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{item.data}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700">
                          {item.placa}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[200px]">{item.cliente}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.categoria}</span>
                        </div>
                      </td>
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
