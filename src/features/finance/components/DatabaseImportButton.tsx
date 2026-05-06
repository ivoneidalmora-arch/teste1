"use client";

import { useState } from 'react';
import { Database, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { transactionService } from '@/features/finance/services/transaction.service';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { toast } from 'sonner';
import { normalizePlaca } from '@/features/ai-ocr/utils/normalization';

interface Props {
  onSuccess: () => void;
  className?: string;
}

export function DatabaseImportButton({ onSuccess, className }: Props) {
  const { user } = useAuthContext();
  const [importing, setImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Formato inválido. Por favor, use um arquivo .json exportado pelo sistema.');
      return;
    }

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);

          if (!Array.isArray(data)) {
            throw new Error('Formato de dados incompatível. O arquivo deve conter uma lista de transações.');
          }

          if (!user?.id) throw new Error('Usuário não autenticado.');
          
          // Validar e normalizar dados antes do bulk insert
          const normalizedData = data.map((item: any, index: number) => {
            // No backup, receitas podem vir da tabela 'Receitas' (colunas raw) ou Transaction (mapeado)
            const isIncome = 
              item.type === 'income' || 
              item.cliente || 
              item.placa || 
              item.metadata?.placa ||
              item.customer;
            
            if (isIncome) {
              const placa = normalizePlaca(item.placa || item.metadata?.placa || item.vehicle_plate);
              if (!placa) {
                console.error(`Erro na linha ${index + 1}:`, item);
                throw new Error(`O registro #${index + 1} (${item.cliente || item.customer || 'Sem Nome'}) está sem placa válida.`);
              }
              // Garantir que a placa esteja no nível superior para o bulkInsert
              return { ...item, placa };
            }
            return item;
          });

          console.log('[DATABASE IMPORT] Primeiro item normalizado:', normalizedData[0]);

          const success = await transactionService.bulkInsert(normalizedData, user.id);
          
          if (success) {
            toast.success(`${data.length} registros importados do banco de dados com sucesso!`);
            onSuccess();
          } else {
            throw new Error('Falha ao processar a importação no servidor.');
          }
        } catch (err: any) {
          toast.error(`Erro no arquivo: ${err.message}`);
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      toast.error('Erro ao ler o arquivo.');
      setImporting(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <label className={cn(
      "flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer group",
      importing && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    )}>
      {importing ? (
        <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
      ) : (
        <Database className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
      )}
      <span className="text-sm">{importing ? 'Processando Banco...' : 'Importar Backup (.json)'}</span>
      <input 
        type="file" 
        className="hidden" 
        accept=".json" 
        onChange={handleImport} 
        disabled={importing} 
      />
    </label>
  );
}
