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

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      let response = await makeRequest(savedKey || undefined);
      let responseData = await response.json();

      if (response.status === 401 && responseData.error === 'MISSING_KEY') {
        const newKey = prompt('Chave Gemini não encontrada no servidor.\n\nPor favor, cole sua chave API (AIzaSy...) abaixo para continuar.\n(Ela será salva apenas no seu navegador)');
        
        if (!newKey) throw new Error('Operação cancelada: Chave não fornecida.');
        
        localStorage.setItem('gemini_api_key', newKey);
        response = await makeRequest(newKey);
        responseData = await response.json();
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
      const isLeaked = err.message?.includes('leaked') || err.message?.includes('403');
      
      if (isLeaked) {
        const confirmReset = confirm(
          `Sua chave do Gemini foi bloqueada pelo Google por ter sido exposta publicamente.\n\n` +
          `Deseja apagar a chave salva no seu navegador para poder inserir uma nova?`
        );
        if (confirmReset) {
          localStorage.removeItem('gemini_api_key');
          alert('Chave removida. Tente importar novamente para inserir uma nova chave.');
        }
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
      <span className="text-sm">{importing ? 'Processando IA...' : 'Importar PDF'}</span>
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
