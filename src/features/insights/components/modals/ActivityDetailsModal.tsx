import React from 'react';
import { X, Calendar, User, ShieldAlert, Cpu, Database, Info } from 'lucide-react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    description: string;
    category: 'security' | 'audit' | 'financial' | 'system';
    metadata?: any;
    created_at: string;
  } | null;
}

export default function ActivityDetailsModal({
  isOpen,
  onClose,
  activity
}: ActivityDetailsModalProps) {
  if (!isOpen || !activity) return null;

  // Determinar ícone de categoria
  const getCategoryIcon = () => {
    switch (activity.category) {
      case 'security':
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case 'financial':
        return <Database className="h-5 w-5 text-emerald-400" />;
      case 'audit':
        return <Cpu className="h-5 w-5 text-indigo-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getCategoryLabel = () => {
    switch (activity.category) {
      case 'security': return 'Segurança';
      case 'financial': return 'Financeiro';
      case 'audit': return 'Auditoria';
      default: return 'Sistema';
    }
  };

  const getTypeStyle = () => {
    switch (activity.type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs transition-opacity duration-300">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 p-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {getCategoryIcon()}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{getCategoryLabel()}</span>
              <h3 className="text-base font-bold text-white leading-tight">{activity.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 block">Descrição do Evento</span>
            <p className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-slate-200 leading-relaxed font-sans">
              {activity.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">Data e Hora</span>
              <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {new Date(activity.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">Severidade</span>
              <div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getTypeStyle()}`}>
                  {activity.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Metadados JSON */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">Dados Técnicos / Metadados</span>
              <pre className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-slate-400 font-mono text-[11px] overflow-x-auto max-h-40 leading-normal">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg transition-colors font-semibold text-xs border border-slate-800"
          >
            Fechar Log
          </button>
        </div>
      </div>
    </div>
  );
}
