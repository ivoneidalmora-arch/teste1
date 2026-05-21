import { DiagnosticResult } from '../../types/diagnostics.types';
import { DiagnosticCard } from './DiagnosticCard';

interface DiagnosticPanelProps {
  diagnostics: DiagnosticResult[];
  onAction?: (actionId: string) => void;
}

export function DiagnosticPanel({ diagnostics, onAction }: DiagnosticPanelProps) {
  // Ordenar diagnósticos por prioridade: urgent > high > medium > low
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  
  const sortedDiagnostics = [...diagnostics].sort((a, b) => {
    // Primeiro os que têm dados
    if (a.hasData && !b.hasData) return -1;
    if (!a.hasData && b.hasData) return 1;
    
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {sortedDiagnostics.map(diagnostic => {
        const isUrgent = diagnostic.priority === 'urgent' || (diagnostic.id === 'inconsistency' && diagnostic.severity === 'critical');
        
        return (
          <div key={diagnostic.id} className={isUrgent ? 'lg:col-span-2' : ''}>
            <DiagnosticCard 
              diagnostic={diagnostic} 
              onAction={onAction}
            />
          </div>
        );
      })}
    </div>
  );
}

// Skeleton para o painel
export function DiagnosticPanelSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-80 animate-pulse ${i === 0 ? 'lg:col-span-2' : ''}`}>
          <div className="flex gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="w-24 h-3 bg-slate-100 rounded-full" />
              <div className="w-32 h-4 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="w-48 h-10 bg-slate-100 rounded-xl mb-6" />
          <div className="space-y-2 mb-8">
            <div className="w-full h-4 bg-slate-100 rounded-full" />
            <div className="w-5/6 h-4 bg-slate-100 rounded-full" />
            <div className="w-4/6 h-4 bg-slate-100 rounded-full" />
          </div>
          <div className="w-full h-16 bg-slate-50 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
