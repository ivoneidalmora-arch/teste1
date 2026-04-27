import { TrendingUp, ClipboardCheck } from 'lucide-react';
import { Card, CardHeader } from '@/core/components/Card';
import { formatBRL, cn } from '@/core/utils/formatters';

interface InspectionData {
  name: string;
  total: number;
  count: number;
}

interface Props {
  data: InspectionData[];
}

export function InspectionTypeBalance({ data = [] }: Props) {
  // Garantia de que data é sempre um array
  const safeData = data || [];
  
  if (safeData.length === 0) {
    return (
      <Card className="h-auto flex flex-col items-center justify-center py-12">
         <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
         <p className="text-slate-500 font-medium text-sm">Sem dados de vistoria</p>
      </Card>
    );
  }

  const grandTotal = safeData.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <Card className="h-auto flex flex-col p-2.5">
      <div className="flex items-center justify-between mb-3">
        <CardHeader 
          title="Balanço por Tipo" 
          subtitle="Vistorias"
          icon={ClipboardCheck}
        />
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Líquido</span>
          <span className="text-xs font-black text-slate-800">{formatBRL(grandTotal)}</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        {safeData.map((item) => {
          const percentage = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0;
          
          return (
            <div key={item.name} className="space-y-1.5 group">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {item.count} {item.count === 1 ? 'Vistoria' : 'Vistorias'}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {formatBRL(item.total)}
                </span>
              </div>
              
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                    percentage > 50 ? "bg-blue-600" : "bg-blue-400"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
