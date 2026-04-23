"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { storageService } from '@/services/storage';
import { Download, Upload, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    const data = await storageService.exportData();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_alfa_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setStatus({ type: 'success', msg: 'Backup exportado com sucesso!' });
    } else {
      setStatus({ type: 'error', msg: 'Falha ao exportar backup.' });
    }
    setLoading(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Atenção: A importação irá ADICIONAR os dados do backup ao banco atual. Deseja continuar?')) {
      e.target.value = '';
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = await storageService.importData(json);
        if (result.success) {
          setStatus({ type: 'success', msg: `Sucesso! ${result.count} registros importados.` });
        } else {
          setStatus({ type: 'error', msg: 'Falha na importação. Verifique o arquivo.' });
        }
      } catch (err) {
        setStatus({ type: 'error', msg: 'Arquivo JSON inválido.' });
      }
      setLoading(false);
      e.target.value = '';
    };
    reader.readAsText(file);
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
    const success = await storageService.resetDatabase();
    if (success) {
      setStatus({ type: 'success', msg: 'Banco de dados zerado com sucesso!' });
    } else {
      setStatus({ type: 'error', msg: 'Erro ao zerar o banco. Tente novamente.' });
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
              "mb-8 p-4 rounded-xl flex items-center gap-3 animate-fade-in",
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
                Baixe uma cópia completa de todos os seus registros em formato JSON. Recomendado fazer semanalmente.
              </p>
              <button 
                onClick={handleExport}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Processando...' : <><Download className="w-4 h-4" /> Baixar JSON</>}
              </button>
            </div>

            {/* Import Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Upload className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-bold text-slate-800">Importar Dados</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Selecione um arquivo de backup (.json) para restaurar registros no sistema. Os dados serão mesclados.
              </p>
              <label className={cn(
                "w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer",
                loading && "opacity-50 cursor-not-allowed"
              )}>
                <Upload className="w-4 h-4" /> Selecionar Arquivo
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport} 
                  disabled={loading}
                />
              </label>
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
                  Use apenas se desejar começar o sistema do zero.
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
      </main>
    </AuthGuard>
  );
}
