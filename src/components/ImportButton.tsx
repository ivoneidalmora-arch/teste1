"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { storageService } from '@/services/storage';

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
      // Pega a chave do localStorage se já tiver salvo antes
      let savedKey = localStorage.getItem('gemini_api_key');

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

      // Se a chave estiver faltando, pede ao usuário
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
      
      const extractedData = responseData;

      // 2. Salvar em Massa (Bulk Insert) no Supabase
      const result = await storageService.saveBulkIncomes(extractedData);

      if (result.success) {
        alert(`Sucesso! ${result.count} laudos foram extraídos e importados automaticamente via IA.`);
        onSuccess();
      } else {
        alert('A IA leu os dados, mas houve um erro ao salvá-los no banco de dados Supabase.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('timeout')) {
        alert('O relatório é muito longo e a IA demorou demais para processar. Tente enviar apenas a página com a tabela.');
      } else if (err.message.includes('MISSING_KEY')) {
        // Já tratado pelo prompt
      } else {
        alert(`Erro na IA: ${err.message || 'Verifique sua chave do Gemini ou o formato do arquivo.'}`);
      }
    } finally {
      setImporting(false);
      e.target.value = '';
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
