import React, { useMemo, useState } from 'react';
import { BaseModal } from '@/core/components/BaseModal';
import { Transaction } from '@/core/types/finance';
import { formatBRL, cn } from '@/core/utils/formatters';
import { getAllClients } from '@/lib/dashboard-metrics';
import { ClientDetailsModal } from './ClientDetailsModal';
import { Users, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export function AllClientsModal({ isOpen, onClose, transactions }: Props) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allClients = useMemo(() => {
    return getAllClients(transactions);
  }, [transactions]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return allClients;
    return allClients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allClients, searchQuery]);

  const maxAmount = Math.max(...allClients.map(c => c.total), 1);

  if (!isOpen) return null;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Todos os Clientes"
        headerColorContext="info"
        maxWidthClass="md:max-w-xl"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-[60vh]">
            <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Cliente</span>
              <span>Receita Bruta</span>
            </div>
            
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              {filteredClients.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">Nenhum cliente encontrado.</div>
              ) : (
                <ul className="divide-y divide-slate-800/50">
                  {filteredClients.map((client, index) => {
                    const barWidth = maxAmount > 0 ? (client.total / maxAmount) * 100 : 0;
                    
                    return (
                      <li 
                        key={index} 
                        onClick={() => setSelectedClient(client.name)}
                        className="p-3 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 w-4">{index + 1}</span>
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                              {client.name}
                            </span>
                          </div>
                          <span className="text-sm font-black text-emerald-400 shrink-0">
                            {formatBRL(client.total)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 pl-6">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 w-10 text-right">
                            {client.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </BaseModal>

      <ClientDetailsModal 
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        clientName={selectedClient || ''}
        transactions={transactions}
      />
    </>
  );
}
