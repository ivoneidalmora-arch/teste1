"use client";

import { useState, useRef } from 'react';
import { 
  Upload, 
  RefreshCw,
  Search,
  Database,
  FileSpreadsheet,
  Eye,
  EyeOff
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';
import { importParserService } from '../services/import-parser.service';
import { cn } from '@/core/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

import { useImportValidation } from '../hooks/useImportValidation';
import { ImportValidationCard } from './ImportValidationCard';
import { ImportValidationFilters } from './ImportValidationFilters';
import { ImportPreviewTable } from './ImportPreviewTable';
import { ImportEditModal } from './ImportEditModal';
import { ImportConfirmModal } from './ImportConfirmModal';
import { ImportedTransaction } from '../types/import.types';

export function ImportPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Modals state
  const [editItem, setEditItem] = useState<ImportedTransaction | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Use the new hook for state and validation
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
    handleApproveManually,
    handleIgnore,
    handleRevalidate
  } = useImportValidation();

  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const data = await importParserService.parseFile(file);
        processImportedData(data);
        toast.success(`Arquivo processado. ${data.length} lançamentos encontrados.`);
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
        const data = await importParserService.parseFile(file);
        processImportedData(data);
        toast.success(`Arquivo processado. ${data.length} lançamentos encontrados.`);
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

  const togglePreview = () => {
    const nextState = !showPreview;
    setShowPreview(nextState);
    if (nextState) {
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const executeSave = async () => {
    if (!user?.id || summary.readyToSave === 0) return;
    
    const validItems = items.filter(i => 
      i.status === 'valid' || i.status === 'corrected' || i.status === 'manual_approved'
    );

    setSaving(true);
    try {
      const transactions = validItems.map(item => ({
        app_user_id: user.id,
        date: item.date,
        placa: item.placa,
        cliente: item.cliente,
        category: item.category,
        amountBruto: item.grossValue,
        amountLiquido: item.netValue || item.grossValue,
        amount: item.grossValue,
        observacao: item.description || (item.status === 'manual_approved' ? 'Aprovado Manualmente' : 'IMPORTADO VIA EXCEL')
      }));

      const { error } = await supabase.from('Receitas').insert(transactions);
      if (error) throw error;

      toast.success('Importação concluída com sucesso!');
      toast.info(`${validItems.length} lançamentos foram salvos. ${summary.ignoredItems} ignorados. ${summary.invalidItems + summary.duplicateItems} inconsistências não salvas.`);
      
      clearData();
      setShowConfirmModal(false);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-6">
        <div className="flex items-center gap-5">
          <IconBadge icon={FileSpreadsheet} variant="blue" size="lg" gradient />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Importação de Dados</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Pré-visualização e Validação Inteligente</p>
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
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <ImportValidationCard summary={summary} />

          {/* Validation section toggle and save button */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/30 gap-4">
              <div className="flex items-center gap-4">
                <IconBadge icon={Search} variant="purple" size="sm" />
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pré-visualização e Validação</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Revise os lançamentos antes de salvar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 h-12 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  Abrir Pré-visualização
                </button>

                <button 
                  onClick={() => setShowConfirmModal(true)}
                  disabled={saving || summary.readyToSave === 0}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 h-12 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Database className="w-4 h-4" />
                  Importar {summary.readyToSave} Lançamentos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal Overlay */}
      {showPreview && items.length > 0 && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-8">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-w-7xl w-full mx-auto animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <IconBadge icon={Search} variant="purple" size="sm" />
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Inspeção Detalhada</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Revise e corrija os lançamentos importados</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <EyeOff className="w-4 h-4" /> Fechar Visualização
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
              <ImportValidationFilters 
                filter={filter} 
                setFilter={setFilter} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
              
              <div className="mt-6 border border-slate-100 bg-white rounded-3xl overflow-hidden shadow-sm">
                <ImportPreviewTable 
                  items={filteredItems} 
                  onEdit={(item) => setEditItem(item)}
                  onDelete={handleDelete}
                  onApproveManually={handleApproveManually}
                  onIgnore={handleIgnore}
                  onRevalidate={handleRevalidate}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <ImportEditModal 
        isOpen={!!editItem} 
        item={editItem} 
        onClose={() => setEditItem(null)} 
        onSave={handleEdit} 
      />

      {/* Confirm Modal */}
      <ImportConfirmModal 
        isOpen={showConfirmModal}
        summary={summary}
        isSaving={saving}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeSave}
      />
    </div>
  );
}
