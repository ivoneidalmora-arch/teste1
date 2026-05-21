"use client";

import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Search,
  Database,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { importParserService } from '../services/import-parser.service';
import { formatBRL } from '@/core/utils/formatters';
import { cn } from '@/core/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { ImportItemSchema } from '../schemas/import.schema';

export function ImportPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const data = await importParserService.parseFile(file);
      
      const validatedData = data.map(item => {
        const result = ImportItemSchema.safeParse(item);
        return {
          ...item,
          isValid: result.success,
          errors: result.success ? [] : result.error.errors.map(err => err.message)
        };
      });

      setItems(validatedData);
      toast.success(`${data.length} registros processados.`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (e.target) e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
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
        observacao: item.description || 'IMPORTADO VIA EXCEL'
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

  const stats = {
    total: items.length,
    valid: items.filter(i => i.isValid).length,
    invalid: items.filter(i => !i.isValid).length,
    totalValue: items.reduce((acc, curr) => acc + (curr.isValid ? curr.valorBruto : 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div className="flex items-center gap-5">
          <IconBadge icon={FileSpreadsheet} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Importação de Dados</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Processamento inteligente de CSV, XLSX e PDF</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {items.length > 0 && (
            <button 
              onClick={() => setItems([])}
              className="px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-rose-600 transition-all"
            >
              Cancelar
            </button>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileUpload} 
            accept=".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/pdf"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-3 px-8 h-12 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? 'Processando...' : 'Selecionar Arquivo'}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed rounded-[3rem] transition-all cursor-pointer group",
            dragActive 
              ? "border-blue-500 bg-blue-50/50 scale-[0.99]" 
              : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/30"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            "p-8 rounded-full bg-slate-50 transition-all group-hover:scale-110 group-hover:bg-blue-50",
            dragActive && "scale-110 bg-blue-100"
          )}>
            <Upload className={cn(
              "w-12 h-12 text-slate-300 transition-all group-hover:text-blue-500",
              dragActive && "text-blue-600"
            )} />
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-lg font-black text-slate-900">Arraste seu arquivo aqui</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">ou clique para selecionar do seu computador</p>
          </div>
          <div className="mt-8 flex gap-3">
             {['.XLSX', '.XLS', '.CSV', '.PDF'].map(ext => (
               <span key={ext} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400">
                 {ext}
               </span>
             ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total de Itens</p>
              <h3 className="text-4xl font-black">{stats.total}</h3>
            </div>
            
            <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Prontos para Salvar</p>
              <h3 className="text-4xl font-black">{stats.valid}</h3>
            </div>

            <div className="bg-rose-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Inconsistentes</p>
              <h3 className="text-4xl font-black">{stats.invalid}</h3>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Valor Bruto Total</p>
              <h3 className="text-4xl font-black text-slate-900">{formatBRL(stats.totalValue)}</h3>
            </div>
          </div>

          {/* Tabela de Prévia */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <IconBadge icon={Search} variant="purple" size="sm" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pré-visualização e Validação</h2>
              </div>
              
              <button 
                onClick={handleSave}
                disabled={saving || stats.valid === 0}
                className="flex items-center gap-3 px-8 h-12 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Importar {stats.valid} Lançamentos
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Placa</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente / Serviço</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valores</th>
                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <tr key={item.id} className={cn("group transition-all hover:bg-slate-50/50", !item.isValid && "bg-rose-50/30")}>
                      <td className="px-8 py-5">
                        {item.isValid ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Válido</span>
                          </div>
                        ) : (
                          <div className="group/error relative flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest cursor-help">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Erro</span>
                            <div className="absolute left-0 top-full mt-2 hidden group-hover/error:block z-50 w-64 p-4 bg-slate-900 text-[10px] text-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                              <p className="font-black mb-2 text-rose-400 uppercase tracking-widest">Inconsistências:</p>
                              {item.errors.map((e: string, i: number) => (
                                <div key={i} className="flex gap-2 mb-1">
                                  <span className="text-rose-500">•</span>
                                  <span className="opacity-80">{e}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{item.data || '---'}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-700 uppercase">
                          {item.placa || 'SEM PLACA'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[200px]">{item.cliente}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.categoria}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-slate-900">{formatBRL(item.valorBruto)}</span>
                          <span className="text-[9px] font-bold text-emerald-500">Liq: {formatBRL(item.valorLiquido)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                          className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
