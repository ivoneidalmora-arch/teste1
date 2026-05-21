"use client";

import { useState } from 'react';
import { transactionService } from '@/features/finance/services/transaction.service';
import { Download, Upload, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Database, User, Bell, ShieldCheck } from 'lucide-react';
import { cn } from '@/core/utils/formatters';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/core/components/ConfirmationModal';

export default function ConfigPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleExport = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await transactionService.getAll(user.id);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar backup.');
      console.error(error);
    } finally {
      setLoading(true);
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (confirmText !== 'LIMPAR TUDO') {
      toast.error('Texto de confirmação incorreto.');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) return;
      const success = await transactionService.deleteAll(user.id);
      if (success) {
        toast.success("Banco de dados zerado com sucesso!");
        setIsDeleteModalOpen(false);
        setConfirmText('');
      } else {
        toast.error("Não foi possível zerar o banco de dados.");
      }
    } catch (error) {
      toast.error("Erro inesperado ao zerar o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
          <p className="text-slate-500">Gerencie sua conta e as preferências do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Seção: Conta e Perfil */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">Sua Conta</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-black uppercase text-slate-400 block mb-1">Usuário Ativo</span>
              <p className="text-lg font-bold text-slate-700">{user?.id || 'Desconectado'}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 block mb-1">Status da Sessão</span>
                <p className="text-lg font-bold text-emerald-600">Conectado via Supabase</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Seção: Preferências */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">Preferências e Notificações</h2>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700">Notificações Sonner (Ativas)</p>
              <p className="text-xs text-slate-500">Alertas flutuantes de sucesso e erro</p>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        {/* Seção: Backup */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">Exportação de Dados</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">
              A exportação gera um arquivo JSON contendo todos os seus lançamentos para backup pessoal.
            </p>
            <button 
              onClick={handleExport}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              Exportar Agora
            </button>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="bg-white p-8 rounded-[2rem] border border-rose-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-xl font-bold">Zona de Perigo</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
            <p className="text-sm text-rose-700 font-medium">
              Zerar o banco de dados removerá permanentemente todas as suas receitas e despesas.
            </p>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full md:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all"
            >
              Zerar Banco de Dados
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação Crítica */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConfirmText('');
        }}
        onConfirm={handleDeleteAll}
        loading={loading}
        title="⚠️ AVISO CRÍTICO"
        description="Esta ação é IRREVERSÍVEL. Todos os seus dados financeiros serão apagados. Para continuar, digite 'LIMPAR TUDO' abaixo:"
        confirmText="CONFIRMAR EXCLUSÃO TOTAL"
      >
        <input 
          type="text" 
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          placeholder="Digite LIMPAR TUDO"
          className="w-full mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-black text-center outline-none focus:ring-4 focus:ring-rose-500/20"
        />
      </ConfirmationModal>
    </div>
  );
}
