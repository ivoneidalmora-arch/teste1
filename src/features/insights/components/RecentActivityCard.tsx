"use client";

import { cn } from '@/core/utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History,
  AlertTriangle,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Icon3D } from '@/core/components/ui/Icon3D';
import { format } from 'date-fns';

interface SystemActivity {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  category: 'security' | 'audit' | 'financial' | 'system';
  metadata?: any;
  created_at: string;
}

interface RecentActivityCardProps {
  activities: SystemActivity[];
  loading?: boolean;
  onClickActivity?: (activity: SystemActivity) => void;
}

export function RecentActivityCard({ activities, loading, onClickActivity }: RecentActivityCardProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, variant: 'green' as const };
      case 'warning': return { icon: AlertTriangle, variant: 'orange' as const };
      case 'error': return { icon: AlertCircle, variant: 'red' as const };
      default: return { icon: Info, variant: 'blue' as const };
    }
  };

  const getEventCategoryLabel = (category: string) => {
    switch (category) {
      case 'security': return 'Segurança';
      case 'financial': return 'Financeiro';
      case 'audit': return 'Auditoria';
      default: return 'Sistema';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm flex flex-col h-full group overflow-hidden">
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Icon3D icon={History} variant="blue" size="xs" glow={false} />
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Atividade do Sistema</h3>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {activities.length > 0 ? (
          activities.slice(0, 10).map((activity) => {
            const date = activity.created_at ? new Date(activity.created_at) : new Date();
            const config = getEventIcon(activity.type);
            return (
              <div 
                key={activity.id} 
                onClick={() => onClickActivity && onClickActivity(activity)}
                className="flex items-center gap-2.5 group/item py-1.5 px-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <Icon3D icon={config.icon} variant={config.variant} size="xs" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-slate-900 truncate tracking-tight group-hover/item:text-indigo-650 transition-colors leading-tight">
                    {activity.title}
                  </h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                    {getEventCategoryLabel(activity.category)}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 tracking-tighter">
                    <span>{format(date, 'dd/MM')}</span>
                    <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                    <span>{format(date, 'HH:mm')}</span>
                  </div>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shrink-0",
                    activity.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    activity.type === 'warning' ? "bg-orange-50 text-orange-600 border-orange-100" :
                    activity.type === 'error' ? "bg-rose-50 text-rose-600 border-rose-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {activity.type}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-20">
            <p className="text-[9px] font-black uppercase tracking-widest">Sem atividades</p>
          </div>
        )}
      </div>
    </div>
  );
}
