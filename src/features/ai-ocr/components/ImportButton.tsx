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

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusText('Processando...');
    setImporting(true);

    try {
      const data = await ingestionService.processDocument(file);
      
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
    setShowPreview(false);

    try {
      const promises = finalData.map(item => 
        transactionService.save({
          type: 'income',
          category: item.categoria || 'Transferência',
          placa: item.placa || '',
          cliente: item.cliente || '',
          amountBruto: item.valorBruto || 0,
          amountLiquido: item.valorLiquido || 0,
          amount: item.valorBruto || 0,
          date: item.data || new Date().toISOString().split('T')[0],
          pagamento: 'Pix',
          observacao: item.observacao || 'IMPORTADO VIA IA'
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r !== null).length;

      if (successCount > 0) {
        if (successCount === finalData.length) {
          alert('Sucesso! Todos os registros foram importados.');
        } else {
          alert(`Aviso: ${successCount} de ${finalData.length} registros foram importados. Alguns falharam.`);
        }
        onSuccess();
      } else {
        alert('Ocorreu um erro e nenhum registro foi salvo no banco de dados.');
      }
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setImporting(false);
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
        onConfirm={handleConfirmImport}
      />
    </>
  );
}
