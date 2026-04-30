"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';
import { ingestionService } from '../services/ingestion.service';
import { ImportPreviewModal } from './ImportPreviewModal';

interface Props {
  onSuccess: () => void;
  className?: string;
}

export function ImportButton({ onSuccess, className }: Props) {
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
      } else {
        alert('Nenhuma vistoria válida foi encontrada neste documento.');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Erro: ${err.message}`);
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleConfirmImport = async (finalData: any[]) => {
    setImporting(true);
    setStatusText('Salvando dados...');

    try {
      const failedItems: any[] = [];
      
      const promises = finalData.map(async (item) => {
        const result = await transactionService.save({
          type: 'income',
          category: item.categoria || 'Transferência',
          placa: item.placa || '',
          cliente: item.cliente || '',
          amountBruto: item.valorBruto || 0,
          amountLiquido: item.valorLiquido || 0,
          amount: item.valorBruto || 0,
          date: item.data,
          pagamento: 'Pix',
          observacao: item.observacao || 'IMPORTADO VIA IA'
        });
        
        if (result === null) {
          failedItems.push(item);
        }
        return result;
      });

      await Promise.all(promises);

      if (failedItems.length > 0) {
        alert(`Atenção: ${failedItems.length} registro(s) falhou(aram). Eles continuam na tela para você corrigir os dados (ex: datas inválidas, placa muito longa) e tentar salvar novamente.`);
        setPreviewData(failedItems); // Atualiza o modal só com os erros
      } else {
        alert('Sucesso! Todos os registros foram importados.');
        setShowPreview(false); // Só fecha se tudo deu certo
        onSuccess();
      }
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setImporting(false);
      setStatusText('Importar PDF');
    }
  };

  return (
    <>
      <label className={cn(
        "flex items-center justify-center gap-2 px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer",
        importing && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}>
        {importing ? (
          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
        ) : (
          <Sparkles className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-sm">{importing ? statusText : 'Importar PDF'}</span>
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf,.xlsx,.xls,.csv,image/*" 
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
