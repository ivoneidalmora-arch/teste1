"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Search, Filter, Database, RefreshCw } from 'lucide-react';
import { getInconsistencyGroupsAction } from '@/features/insights/actions/audit.actions';
import { InconsistencyGroup } from '@/features/insights/types/diagnostics.types';
import { InconsistenciesModal } from '@/features/insights/components/diagnostics/InconsistenciesModal';
import { toast } from 'sonner';

export default function AuditoriaPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<InconsistencyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<InconsistencyGroup | null>(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0 });

  const loadAudit = async () => {
    setLoading(true);
    try {
      // Usando a Action do Servidor para auditoria global
      const allGroups = await getInconsistencyGroupsAction();
      setGroups(allGroups);
      
      const critical = allGroups.filter(g => g.severity === 'critical').length;
      const warning = allGroups.filter(g => g.severity === 'warning').length;
      
      setStats({
        total: allGroups.length,
        critical,
        warning
      });
    } catch (error) {
      console.error('Erro na auditoria:', error);
      toast.error('Falha ao processar auditoria de dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              <ShieldCheck className="w-8 h-8 mr-3 text-brand-primary" />
              Central de Auditoria Financeira
            </h1>
            <p className="text-slate-500 mt-1">Diagnóstico avançado de integridade e conformidade de dados.</p>
          </div>
          
          <button 
            onClick={loadAudit}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-brand-primary hover:border-brand-primary transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recalcular Diagnóstico
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Inconsistências Totais</p>
                <h2 className="text-4xl font-black text-slate-900 mt-1">{stats.total}</h2>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                <Database className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-rose-500 text-xs font-black uppercase tracking-widest">Alertas Críticos</p>
                <h2 className="text-4xl font-black text-rose-600 mt-1">{stats.critical}</h2>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Status de Integridade</p>
                <h2 className="text-4xl font-black text-emerald-600 mt-1">
                  {stats.total === 0 ? '100%' : `${Math.max(0, 100 - (stats.total * 2))}%`}
                </h2>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          </div>
        </div>

        {/* Audit Groups */}
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse border border-slate-100"></div>
            ))
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
               <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Integridade de Dados Perfeita</h3>
              <p className="text-slate-500 mt-2">Nenhuma inconsistência foi detectada na sua base de dados atual.</p>
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                    group.severity === 'critical' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{group.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{group.description}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {group.items.length} OCORRÊNCIAS
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        group.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {group.severity === 'critical' ? 'Nível Crítico' : 'Alerta'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedGroup && (
          <InconsistenciesModal 
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onResolve={loadAudit}
          />
        )}
      </div>
    </div>
  );
}
