"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';
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

    setStatusText('Processando IA...');
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      let savedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;

      const makeRequest = async (key?: string) => {
        const headers: Record<string, string> = {};
        if (key) headers['x-api-key'] = key;

        return await fetch('/api/import-report', {
          method: 'POST',
          headers,
          body: formData,
        });
      };

      let currentKey = savedKey;

      const attemptRequest = async (key: string | null) => {
        const r = await makeRequest(key || undefined);
        const d = await r.json();
        return { r, d };
      };

      let { r: response, d: responseData } = await attemptRequest(currentKey);

      if (response.status === 401 && responseData.error === 'MISSING_KEY') {
        const newKey = prompt('Chave Gemini não encontrada no servidor.\n\nPor favor, cole sua chave API (AIzaSy...) abaixo para continuar.\n(Ela será salva apenas no seu navegador)');
        
        if (!newKey) throw new Error('Operação cancelada: Chave não fornecida.');
        
        localStorage.setItem('gemini_api_key', newKey);
        currentKey = newKey;
        
        const retryAuth = await attemptRequest(currentKey);
        response = retryAuth.r;
        responseData = retryAuth.d;
      }

      // Sistema de Fila Automática (Retry para erro 503)
      let retries = 0;
      const maxRetries = 10;
      while (
        (response.status === 503 || (responseData.error && String(responseData.error).includes('503'))) 
        && retries < maxRetries
      ) {
        setStatusText(`Fila de espera... (${retries + 1}/${maxRetries})`);
        await new Promise(res => setTimeout(res, 5000));
        
        const retryServer = await attemptRequest(currentKey);
        response = retryServer.r;
        responseData = retryServer.d;
        retries++;
      }

      if (!response.ok) {
        const errorMsg = responseData.error || 'Falha no processamento da IA';
        const parseErr = responseData.parseError ? `\n\nErro de Parse: ${responseData.parseError}` : '';
        const details = responseData.details ? `\n\nResposta da IA:\n${responseData.details.substring(0, 1000)}${responseData.details.length > 1000 ? '...' : ''}` : '';
        throw new Error(`${errorMsg}${parseErr}${details}`);
      }
      
      if (Array.isArray(responseData) && responseData.length > 0) {
        setPreviewData(responseData);
        setShowPreview(true);
      } else {
        alert('A IA não conseguiu encontrar nenhuma vistoria válida neste documento.');
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
      let successCount = 0;
      for (const item of finalData) {
        const success = await transactionService.save({
          type: 'income',
          category: item.categoria || 'Transferência',
          placa: item.placa || '',
          cliente: item.cliente || '',
          amountBruto: item.valorBruto || 0,
          amountLiquido: item.valorLiquido || 0,
          amount: item.valorBruto || 0,
          date: item.data || new Date().toISOString().split('T')[0],
          pagamento: 'Pix',
          observacao: 'IMPORTADO VIA IA'
        });
        if (success) successCount++;
      }

      if (successCount > 0) {
        alert(`Sucesso! ${successCount} registros foram importados.`);
        onSuccess();
      } else {
        alert('Nenhum dado foi salvo.');
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
          accept=".pdf,image/*" 
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
