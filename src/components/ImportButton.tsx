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
      // 1. Chamar a IA para extrair os dados
      const response = await fetch('/api/import-report', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

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
      } else {
        alert(`Erro na IA: ${err.message || 'Verifique sua chave do Gemini no Vercel ou o formato do arquivo.'}`);
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
