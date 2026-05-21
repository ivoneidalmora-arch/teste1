import { DiagnosticResult } from '../../types/diagnostics.types';
import { cn } from '@/core/utils/formatters';
import { 
  HeartPulse, 
  TrendingUp, 
  Wallet, 
  Users, 
  Briefcase, 
  ShieldAlert, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { IconBadge } from '@/core/components/ui/IconBadge';

interface DiagnosticCardProps {
  diagnostic: DiagnosticResult;
  onAction?: (actionId: string) => void;
}

export function DiagnosticCard({ diagnostic, onAction }: DiagnosticCardProps) {
  
  // Mapeamento de ícones por tipo
  const getIcon = () => {
    switch (diagnostic.type) {
      case 'health': return HeartPulse;
      case 'growth': return TrendingUp;
      case 'expense': return Wallet;
      case 'client': return Users;
      case 'service': return Briefcase;
      case 'risk': return ShieldAlert;
      case 'inconsistency': return Search;
      default: return Info;
    }
  };

  const getSeverityColors = () => {
    switch (diagnostic.severity) {
      case 'critical': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800', variant: 'red' };
      case 'warning': return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800', variant: 'orange' };
      case 'positive': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', variant: 'green' };
      case 'info':
      default: return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800', variant: 'blue' };
    }
  };

  const getSeverityIcon = () => {
    switch (diagnostic.severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'positive': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const colors = getSeverityColors();
  const Icon = getIcon();

  if (!diagnostic.hasData) {
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full opacity-60">
        <div className="flex items-center gap-4 mb-4">
          <IconBadge icon={Icon} variant="slate" size="sm" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{diagnostic.title}</h3>
        </div>
        <p className="text-xs font-medium text-slate-400 leading-relaxed">{diagnostic.text}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden",
      diagnostic.severity === 'critical' ? "border-rose-200" : "border-slate-100"
    )}>
      {/* Background Glow sutil para critical */}
      {diagnostic.severity === 'critical' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <IconBadge icon={Icon} variant={colors.variant as any} size="sm" gradient />
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{diagnostic.title}</h3>
            <div className="flex items-center gap-2">
              {getSeverityIcon()}
              <span className={cn("text-[11px] font-black uppercase tracking-wider", colors.text)}>
                {diagnostic.classification}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 relative z-10">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            {diagnostic.mainMetric}
          </span>
          {diagnostic.variation !== undefined && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black",
              diagnostic.variation > 0 ? "bg-emerald-50 text-emerald-600" : (diagnostic.variation < 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400")
            )}>
              {diagnostic.variation > 0 ? <ArrowUpRight className="w-3 h-3" /> : (diagnostic.variation < 0 ? <ArrowDownRight className="w-3 h-3" /> : null)}
              {Math.abs(diagnostic.variation).toFixed(1)}%
            </div>
          )}
        </div>
        {diagnostic.secondaryMetric && (
          <span className="text-xs font-bold text-slate-400 mt-1 block">
            {diagnostic.secondaryMetric}
          </span>
        )}
      </div>

      {/* Texto Explicativo */}
      <div className="mb-4 relative z-10">
        <p className="text-[13px] font-medium text-slate-600 leading-relaxed">
          {diagnostic.text}
        </p>
      </div>

      {/* Lista de Fatores (Novo) */}
      {diagnostic.factors && diagnostic.factors.length > 0 && (
        <div className="mb-6 relative z-10 space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-2">Fatores Detectados:</span>
          <ul className="space-y-2">
            {diagnostic.factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  diagnostic.severity === 'critical' ? "bg-rose-400" : 
                  diagnostic.severity === 'warning' ? "bg-orange-400" : "bg-emerald-400"
                )} />
                <span className="leading-tight">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendação Prática */}
      {diagnostic.recommendation && (
        <div className={cn("p-4 rounded-2xl mb-4 relative z-10 border", colors.bg, colors.border)}>
          <span className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", colors.text)}>Ação Estratégica</span>
          <p className={cn("text-xs font-semibold leading-relaxed", colors.text)}>
            {diagnostic.recommendation}
          </p>
        </div>
      )}

      {/* Action Button */}
      {diagnostic.actionLabel && diagnostic.actionId && onAction && (
        <button 
          onClick={() => onAction(diagnostic.actionId!)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative z-10",
            diagnostic.severity === 'critical' ? "bg-rose-600 text-white hover:bg-rose-700" :
            diagnostic.severity === 'warning' ? "bg-orange-500 text-white hover:bg-orange-600" :
            "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          {diagnostic.actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
