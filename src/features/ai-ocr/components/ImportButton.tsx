"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';

interface Props {
  onSuccess: () => void;
  className?: string;
}

export function ImportButton({ onSuccess, className }: Props) {
  const [importing, setImporting] = useState(false);
  const [statusText, setStatusText] = useState('Processando IA...');

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
      const maxRetries = 10; // Tenta até 10 vezes (cerca de 50 segundos)
      while (
        (response.status === 503 || (responseData.error && String(responseData.error).includes('503'))) 
        && retries < maxRetries
      ) {
        setStatusText(`Fila de espera do servidor... (${retries + 1}/${maxRetries})`);
        await new Promise(res => setTimeout(res, 5000)); // Espera 5 segundos antes de tentar de novo
        
        const retryServer = await attemptRequest(currentKey);
        response = retryServer.r;
        responseData = retryServer.d;
        retries++;
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Falha no processamento da IA');
      }
      
      // Adaptado para o novo transactionService
      // O responseData deve ser um array de laudos extraídos
      let successCount = 0;
      if (Array.isArray(responseData)) {
        for (const item of responseData) {
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
      }

      if (successCount > 0) {
        alert(`Sucesso! ${successCount} laudos foram extraídos e importados automaticamente via IA.`);
        onSuccess();
      } else {
        alert('A IA leu os dados, mas não foi possível salvar os registros no banco.');
      }
    } catch (err: any) {
      console.error(err);
      const isKeyError = 
        err.message?.includes('leaked') || 
        err.message?.includes('expired') || 
        err.message?.includes('403') || 
        err.message?.includes('400');
      
      const isNotFoundError = err.message?.includes('404') || err.message?.includes('not found');

      if (isKeyError) {
        const confirmReset = confirm(
          `Sua chave do Gemini parece estar inválida, expirada ou bloqueada.\n\n` +
          `Deseja apagar a chave salva no seu navegador para poder inserir uma nova?`
        );
        if (confirmReset) {
          localStorage.removeItem('gemini_api_key');
          alert('Chave removida. Tente importar novamente para inserir uma nova chave.');
        }
      } else if (isNotFoundError) {
        alert(
          'O modelo da IA não foi encontrado na sua conta.\n\n' +
          `Detalhes: ${err.message}\n\n` +
          'Verifique se sua chave possui acesso aos modelos acima.'
        );
      } else {
        alert(`Erro: ${err.message}`);
      }
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
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
  );
}
