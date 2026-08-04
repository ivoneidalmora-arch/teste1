"use client";

import { useState, useRef } from 'react';
import { 
  Upload, 
  RefreshCw,
  Search,
  Database,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { invoiceParserService } from '../services/invoice-parser.service';
import { cn } from '@/core/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

import { useInvoiceValidation } from '../hooks/useInvoiceValidation';
import { InvoiceValidationCard } from './InvoiceValidationCard';
import { InvoicePreviewTable } from './InvoicePreviewTable';
import { InvoiceCorrectionModal } from './InvoiceCorrectionModal';
import { InvoiceImportData } from '../schemas/invoice.schema';

export function InvoiceImportPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [editItem, setEditItem] = useState<InvoiceImportData | null>(null);

  const {
    items,
    filteredItems,
    summary,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    processImportedData,
    clearData,
    handleEdit,
    handleDelete,
    handleIgnore
  } = useInvoiceValidation();

  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const data = await invoiceParserService.parseFile(file);
        processImportedData(data);
        toast.success(`Arquivo processado. ${data.length} notas encontradas.`);
        setShowPreview(true);
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao processar arquivo.');
      } finally {
        setLoading(false);
      }
    }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setLoading(true);
      try {
        const data = await invoiceParserService.parseFile(file);
        processImportedData(data);
        toast.success(`Arquivo processado. ${data.length} notas encontradas.`);
        setShowPreview(true);
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao processar arquivo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const executeSave = async () => {
    if (!user?.id || summary.readyToSave === 0) return;
    
    const validItems = items.filter(i => 
      i.status === 'valid' || i.status === 'corrected'
    );

    setSaving(true);
    try {
      const transactions = validItems.map(item => ({
        app_user_id: user.id,
        date: item.date,
        placa: item.placa,
        cliente: item.cliente,
        category: 'Nota Fiscal',
        amountBruto: item.grossValue,
        amountLiquido: item.grossValue,
        amount: item.grossValue,
        pagamento: 'Pix',
        observacao: `[NF ${item.statusNota}] IMPORTAÇÃO AUTOMÁTICA`,
      }));

      const { error } = await supabase.from('Receitas').insert(transactions);
      if (error) throw error;

      toast.success('Importação de Notas Fiscais concluída com sucesso!');
      clearData();
    } catch (error: any) {
      toast.error('Erro ao salvar notas fiscais: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div className="flex items-center gap-5">
          <IconBadge icon={FileText} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Importação de Notas Fiscais</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Extração automática de placas (XLS/XLSX)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {items.length > 0 && (
            <button 
              onClick={clearData}
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
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-3 px-8 h-12 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? 'Processando...' : 'Selecionar Planilha'}
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
            <h3 className="text-lg font-black text-slate-900">Arraste sua planilha aqui</h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">ou clique para selecionar (XLS/XLSX)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <InvoiceValidationCard summary={summary} />

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
              <div className="flex items-center gap-4">
                <IconBadge icon={Search} variant="purple" size="sm" />
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pré-visualização de Notas</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Edite placas não identificadas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-12 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Abrir Visualização
                </button>

                <button 
                  onClick={executeSave}
                  disabled={saving || summary.readyToSave === 0}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 h-12 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Database className="w-4 h-4" />
                  {saving ? 'Importando...' : `Importar ${summary.readyToSave} Notas`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && items.length > 0 && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-8">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-w-7xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <IconBadge icon={Search} variant="purple" size="sm" />
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Inspeção Detalhada</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Revise as notas antes de enviar ao banco</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <EyeOff className="w-4 h-4" /> Fechar Visualização
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por placa, cliente ou situação..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'valid', label: 'Prontas' },
                    { id: 'error', label: 'Com Erro' },
                    { id: 'no-plate', label: 'Sem Placa' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={cn(
                        "px-6 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                        filter === f.id
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                          : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="border border-slate-100 bg-white rounded-3xl overflow-hidden shadow-sm">
                <InvoicePreviewTable 
                  items={filteredItems} 
                  onEdit={setEditItem}
                  onDelete={handleDelete}
                  onIgnore={handleIgnore}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <InvoiceCorrectionModal 
        isOpen={!!editItem} 
        item={editItem} 
        onClose={() => setEditItem(null)} 
        onSave={handleEdit} 
      />
    </div>
  );
}
