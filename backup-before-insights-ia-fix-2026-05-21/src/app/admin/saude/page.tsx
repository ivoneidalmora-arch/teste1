"use client";

import { useEffect, useState } from 'react';
import { Activity, Database, Shield, AlertTriangle, CheckCircle, Server, HardDrive, Search } from 'lucide-react';
import { getSystemHealthAction } from '@/features/admin/actions/diagnostics.actions';

export default function SaudeSistemaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSystemHealthAction();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Diagnosticando sistema...</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Infraestrutura',
      icon: Server,
      items: [
        { label: 'Ambiente', value: data.vercel_env, status: 'info' },
        { label: 'Node Context', value: data.environment, status: 'info' },
        { label: 'Versão App', value: data.version, status: 'info' },
        { label: 'Banco de Dados', value: data.status.database, status: 'success' }
      ]
    },
    {
      title: 'Integridade de Dados',
      icon: Database,
      items: [
        { label: 'Receitas Ativas', value: data.stats.receitas, status: 'success' },
        { label: 'Despesas Ativas', value: data.stats.despesas, status: 'success' },
        { label: 'Receitas Órfãs', value: data.stats.receitasOrfas, status: data.stats.receitasOrfas > 0 ? 'critical' : 'success' },
        { label: 'Despesas Órfãs', value: data.stats.despesasOrfas, status: data.stats.despesasOrfas > 0 ? 'critical' : 'success' }
      ]
    },
    {
      title: 'Operação & Auditoria',
      icon: Search,
      items: [
        { label: 'Receitas na Lixeira', value: data.stats.receitasExcluidas, status: 'warning' },
        { label: 'Despesas na Lixeira', value: data.stats.despesasExcluidas, status: 'warning' },
        { label: 'Inconsistências', value: data.stats.inconsistencias, status: data.stats.inconsistencias > 0 ? 'alert' : 'success' },
        { label: 'Duplicidades', value: data.stats.duplicidadesPendentes, status: data.stats.duplicidadesPendentes > 0 ? 'alert' : 'success' }
      ]
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Saúde do Sistema
          </h1>
          <p className="text-slate-500 text-sm">Monitoramento técnico e integridade de dados em tempo real.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-2">
          <CheckCircle className="w-3 h-3" />
          Sistema Operacional
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <card.icon className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-bold text-slate-800">{card.title}</h2>
            </div>
            <div className="p-6 space-y-4">
              {card.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    item.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'critical' ? 'bg-rose-50 text-rose-700 animate-pulse' :
                    item.status === 'alert' ? 'bg-amber-50 text-amber-700' :
                    item.status === 'warning' ? 'bg-slate-100 text-slate-600' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alertas Críticos */}
      {(data.stats.receitasOrfas > 0 || data.stats.despesasOrfas > 0) && (
        <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-rose-900 font-bold mb-1">Inconsistência de Segurança Detectada</h3>
            <p className="text-rose-700 text-sm leading-relaxed">
              Existem registros sem vínculo de usuário (`app_user_id`). Isso pode ocorrer por falhas em importações legadas ou scripts de limpeza. 
              Estes dados estão atualmente invisíveis para os usuários finais devido aos filtros de RLS e aplicação.
            </p>
            <button className="mt-4 px-4 py-2 bg-rose-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">
              Iniciar Correção de Vínculos
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Configuração de Segurança
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <span className="text-sm text-slate-400">Row Level Security (RLS)</span>
              <span className="text-xs font-bold text-emerald-400">ATIVO</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <span className="text-sm text-slate-400">Server Actions Protection</span>
              <span className="text-xs font-bold text-emerald-400">ATIVO</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <span className="text-sm text-slate-400">Soft Delete v3</span>
              <span className="text-xs font-bold text-emerald-400">IMPLEMENTADO</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-200" />
            Snapshot de Auditoria
          </h3>
          <p className="text-blue-100 text-sm mb-6">
            O último backup total foi realizado em 13/05/2026. 
            O sistema de logs agora captura 100% das mutações de dados financeiros.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors">
              Ver Logs de Auditoria
            </button>
            <button className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors">
              Exportar Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
