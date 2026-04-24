"use client";

import { useState } from 'react';
import { transactionService } from '@/features/finance/services/transaction.service';
import { Download, Upload, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    // Nota: Reimplementar export no transactionService se necessário
    alert('Funcionalidade de backup em nuvem automática ativa. Exportação JSON manual em manutenção.');
    setLoading(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert('Importação via arquivo desativada por segurança. Utilize o banco de dados Supabase diretamente.');
    e.target.value = '';
  };

  const handleReset = async () => {
    const confirm1 = window.confirm('⚠️ AVISO CRÍTICO: Você está prestes a APAGAR TODOS os dados do sistema. Esta ação NÃO pode ser desfeita. Tem certeza?');
    if (!confirm1) return;

    const confirm2 = window.prompt('Para confirmar a exclusão total, digite "LIMPAR TUDO" no campo abaixo:');
    if (confirm2 !== 'LIMPAR TUDO') {
      alert('Confirmação incorreta. Operação cancelada.');
      return;
    }

    setLoading(true);
    const success = await transactionService.deleteAll();
    if (success) {
      setStatus({ type: 'success', msg: 'Banco de dados zerado com sucesso!' });
    } else {
      setStatus({ type: 'error', msg: 'Erro ao zerar o banco. Tente novamente.' });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-primary/10 rounded-xl">
          <Database className="w-8 h-8 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurações de Dados</h1>
          <p className="text-slate-500">Gerencie backups e manutenção do sistema</p>
        </div>
      </div>

      {status && (
        <div className={cn(
          "mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in",
          status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-800">Exportar Backup</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Funcionalidade em migração para o novo TransactionService.
          </p>
          <button 
            onClick={handleExport}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Processando...' : 'Exportar JSON'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="font-bold text-rose-800">Zona de Perigo</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 max-w-xl">
              A opção abaixo apaga permanentemente todos os registros de Receitas e Despesas do banco de dados. 
            </p>
            <button 
              onClick={handleReset}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Zerar Banco de Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
