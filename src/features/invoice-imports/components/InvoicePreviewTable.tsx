import { Edit2, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { InvoiceImportData } from '../schemas/invoice.schema';
import { formatBRL, cn } from '@/core/utils/formatters';

interface Props {
  items: InvoiceImportData[];
  onEdit: (item: InvoiceImportData) => void;
  onDelete: (id: string) => void;
  onIgnore: (id: string) => void;
}

export function InvoicePreviewTable({ items, onEdit, onDelete, onIgnore }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-[11px] font-medium text-slate-500 whitespace-nowrap">
        <thead className="bg-slate-50/80 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
          <tr>
            <th className="px-6 py-4">Data</th>
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4">Placa</th>
            <th className="px-6 py-4">Situação</th>
            <th className="px-6 py-4 text-right">Valor Bruto</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item) => {
            const isError = item.status === 'error' || item.status === 'invalid';
            const isIgnored = item.status === 'ignored';
            const needsPlate = item.placa === 'PLACA NÃO IDENTIFICADA';

            return (
              <tr 
                key={item.id}
                className={cn(
                  "hover:bg-slate-50/50 transition-colors group",
                  isError && "bg-rose-50/30 hover:bg-rose-50/50",
                  isIgnored && "opacity-50 grayscale bg-slate-50"
                )}
              >
                <td className="px-6 py-4">
                  {item.date ? new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                </td>
                <td className="px-6 py-4 max-w-[200px] truncate" title={item.cliente}>
                  {item.cliente}
                </td>
                <td className="px-6 py-4">
                  {needsPlate ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      Sem Placa
                    </span>
                  ) : (
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{item.placa}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-bold uppercase text-[9px] tracking-wider">
                    {item.statusNota}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatBRL(item.grossValue)}
                </td>
                <td className="px-6 py-4 text-center">
                  {isIgnored ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold">
                      Ignorado
                    </span>
                  ) : isError ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      Erro
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Válido
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isIgnored && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {!isIgnored && (
                      <button
                        onClick={() => onIgnore(item.id)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Ignorar"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
