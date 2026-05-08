"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';
import { ingestionService } from '../services/ingestion.service';
import { ImportPreviewModal } from './ImportPreviewModal';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  onSuccess: () => void;
  className?: string;
  label?: string;
  accept?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald';
}

export function ImportButton({ onSuccess, className, label, accept, variant = 'primary' }: Props) {
  const { user } = useAuthContext();
  const [importing, setImporting] = useState(false);
  const [statusText, setStatusText] = useState('Processando IA...');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusText('Processando...');
    setImporting(true);

    try {
      const result = await ingestionService.processDocument(file);
      const data = Array.isArray(result) ? result : (result as any).data;
      const rawRes = (result as any).rawResponse || '';
      const processLogs = (result as any).logs || [];

      setRawResponse(rawRes);
      setLogs(processLogs);
      
      if (data.length > 0) {
        setPreviewData(data);
        setShowPreview(true);
        toast.success(`${data.length} vistorias identificadas!`);
      } else {
        toast.error('Nenhuma vistoria válida foi encontrada neste documento.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmImport = async (finalData: any[]) => {
    // Filtrar apenas itens válidos (garantia extra)
    const validItems = finalData.filter(item => item.placa);
    
    if (validItems.length === 0) {
      toast.error('Nenhum registro válido para importar (placa obrigatória).');
      return;
    }

    console.log(`[IMPORT] Iniciando importação de ${validItems.length} registros.`);
    console.table(validItems.map(it => ({ data: it.data, placa: it.placa, valor: it.valorBruto })));

    setImporting(true);
    setStatusText('Salvando dados...');

    try {
      const failedItems: any[] = [];
      
      const promises = validItems.map(async (item) => {
        const result = await transactionService.save({
          type: 'income',
          category: item.categoria || 'Transferência',
          amount: Number(item.valorBruto || 0),
          grossAmount: Number(item.valorBruto || 0),
          netAmount: Number(item.valorLiquido || 0),
          date: item.data,
          description: `Placa: ${item.placa} - ${item.cliente || 'CLIENTE'}`,
          customer: item.cliente || 'CLIENTE',
          status: 'paid',
          source: 'import',
          metadata: {
            placa: item.placa,
            observacao: item.observacao || 'IMPORTADO VIA IA',
            pagamento: 'Pix'
          }
        }, user?.id || '');
        
        if (result === null) {
          failedItems.push(item);
        }
        return result;
      });

      await Promise.all(promises);

      if (failedItems.length > 0) {
        toast.warning(`${validItems.length - failedItems.length} importados, ${failedItems.length} falharam.`);
        setPreviewData(failedItems); 
      } else {
        toast.success(`Sucesso! ${validItems.length} registros importados.`);
        setShowPreview(false);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setImporting(false);
      setStatusText('Importar PDF');
    }
  };

  return (
    <>
      <label className={cn(
        "flex items-center justify-center gap-2 px-4 h-11 font-bold rounded-xl shadow-lg transition-all cursor-pointer",
        variant === 'primary' && "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10",
        variant === 'emerald' && "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10",
        variant === 'secondary' && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10",
        importing && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}>
        {importing ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
        ) : (
          <Sparkles className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-sm">{importing ? statusText : (label || 'Importar PDF')}</span>
        <input 
          type="file" 
          className="hidden" 
          accept={accept || ".pdf,.xlsx,.xls,.csv,image/*"} 
          onChange={handleImportPDF} 
          disabled={importing} 
        />
      </label>

      <ImportPreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={previewData}
        rawResponse={rawResponse}
        logs={logs}
        onConfirm={handleConfirmImport}
      />
    </>
  );
}
