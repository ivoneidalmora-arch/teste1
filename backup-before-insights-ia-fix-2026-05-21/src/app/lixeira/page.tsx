"use client";

import React, { useEffect, useState } from 'react';
import { getDeletedTransactionsAction, restoreTransactionAction, permanentDeleteTransactionAction } from '@/features/finance/actions/trash.actions';
import { Transaction } from '@/core/types/finance';
import { formatBRL } from '@/core/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, RotateCcw, AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TrashPage() {
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTrash = async () => {
    setLoading(true);
    try {
      const items = await getDeletedTransactionsAction();
      setDeletedItems(items);
    } catch (error) {
      toast.error('Falha ao carregar lixeira');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: string | number, type: 'income' | 'expense') => {
    try {
      await restoreTransactionAction(id, type);
      toast.success('Registro restaurado com sucesso!');
      loadTrash();
    } catch (error) {
      toast.error('Erro ao restaurar registro');
    }
  };

  const handlePermanentDelete = async (id: string | number, type: 'income' | 'expense') => {
    if (!confirm('Tem certeza? Esta ação é irreversível e o dado será apagado permanentemente do banco.')) return;
    
    try {
      await permanentDeleteTransactionAction(id, type);
      toast.success('Registro apagado permanentemente');
      loadTrash();
    } catch (error) {
      toast.error('Erro ao apagar registro');
    }
  };

  const filteredItems = deletedItems.filter(item => 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.placa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="flex items-center text-slate-500 hover:text-brand-primary transition-colors mb-2 group">
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              <Trash2 className="w-8 h-8 mr-3 text-slate-400" />
              Lixeira de Auditoria
            </h1>
            <p className="text-slate-500 mt-1">Recupere registros excluídos ou limpe o banco permanentemente.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar na lixeira..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            <p className="mt-4 text-slate-500 font-medium">Consultando registros...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">A lixeira está vazia</h3>
            <p className="text-slate-500 mt-2">Nenhum registro excluído recentemente foi encontrado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Registro</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tipo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Valor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Excluído em</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {item.type === 'income' ? item.customer : item.description}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center">
                          {item.placa && <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-2 font-mono uppercase">{item.placa}</span>}
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatBRL(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.deletedAt ? format(new Date(item.deletedAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleRestore(item.id, item.type)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Restaurar"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handlePermanentDelete(item.id, item.type)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Apagar Permanentemente"
                          >
                            <AlertTriangle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start">
          <AlertTriangle className="w-6 h-6 text-amber-600 mr-4 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-900 font-semibold">Política de Auditoria</h4>
            <p className="text-amber-800 text-sm mt-1">
              Registros excluídos permanecem nesta lixeira indefinidamente até que sejam restaurados ou apagados permanentemente. 
              Todas as exclusões físicas são registradas nos logs do sistema para conformidade fiscal.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
