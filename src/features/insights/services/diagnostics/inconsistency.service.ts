import { DiagnosticResult, InconsistencyRecord } from '../../types/diagnostics.types';

export const inconsistencyDiagnosticService = {
  analyze(context: any): { diagnostic: DiagnosticResult, records: InconsistencyRecord[] } {
    const { rawRevenues, rawExpenses, existingReviews, period } = context;

    let targetRevenues = rawRevenues;
    let targetExpenses = rawExpenses;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
      targetExpenses = rawExpenses.filter((e: any) => e.date >= period.startDate && e.date <= period.endDate);
    }

    const records: InconsistencyRecord[] = [];

    // 1. Receitas sem cliente ou sem serviço
    targetRevenues.forEach((r: any) => {
      const val = Number(r.amountLiquido) || Number(r.amount) || 0;
      if (!r.cliente || r.cliente.trim() === '' || r.cliente.toUpperCase() === 'S/N' || r.cliente.toUpperCase() === 'SN') {
        records.push({
          id: `inc-${r.id}-noclient`,
          type: 'no_client',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: r.description || 'Receita sem cliente',
          value: val,
          details: 'Lançamento efetuado sem identificação do cliente.'
        });
      }

      if (!r.category || r.category.trim() === '' || r.category.toUpperCase() === 'OUTROS') {
        records.push({
          id: `inc-${r.id}-noservice`,
          type: 'no_service',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: r.description || 'Receita sem serviço',
          value: val,
          details: 'Lançamento efetuado sem categorização do serviço prestado.'
        });
      }

      if (val <= 0) {
        records.push({
          id: `inc-${r.id}-invalid`,
          type: 'invalid_value',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: r.description || 'Receita inválida',
          value: val,
          details: 'Lançamento com valor zerado ou negativo.'
        });
      }
    });

    // 2. Despesas sem categoria ou inválidas
    targetExpenses.forEach((e: any) => {
      const val = Number(e.amount) || 0;
      if (!e.category || e.category.trim() === '' || e.category.toUpperCase() === 'OUTROS') {
        records.push({
          id: `inc-${e.id}-nocategory`,
          type: 'no_category',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: e.description || 'Despesa sem categoria',
          value: val,
          details: 'Despesa lançada sem centro de custo (categoria).'
        });
      }

      if (val <= 0) {
        records.push({
          id: `inc-${e.id}-invalid`,
          type: 'invalid_value',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: e.description || 'Despesa inválida',
          value: val,
          details: 'Despesa com valor zerado ou negativo.'
        });
      }
    });

    // 3. Duplicidades (mesma placa, mesmo serviço, mesmo cliente se tiver, mesmo valor, < 30 dias)
    const rawGroups: Record<string, any[]> = {};
    targetRevenues.forEach((r: any) => {
      if (r.placa && r.placa.trim() !== '') {
        const key = `${r.placa}-${r.category || ''}`;
        if (!rawGroups[key]) rawGroups[key] = [];
        rawGroups[key].push(r);
      }
    });

    const reviewsMap: Record<string, any> = {};
    (existingReviews || []).forEach((rev: any) => {
      reviewsMap[rev.duplicate_group_key] = rev;
    });

    Object.entries(rawGroups).forEach(([key, items]) => {
      if (items.length > 1) {
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        for (let i = 0; i < items.length - 1; i++) {
          const r1 = items[i];
          const r2 = items[i+1];
          const d1 = new Date(r1.date);
          const d2 = new Date(r2.date);
          const diffDays = Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
          
          if (diffDays <= 30) {
            const v1 = Number(r1.amountLiquido) || Number(r1.amount) || 0;
            const v2 = Number(r2.amountLiquido) || Number(r2.amount) || 0;
            
            // Verificar "mesmo valor" e "mesmo cliente" para aumentar precisão (ou notificar de qualquer forma se a placa for igual no período)
            const sameValue = Math.abs(v1 - v2) < 0.01;
            const sameCustomer = (!r1.cliente && !r2.cliente) || (r1.cliente === r2.cliente);

            // Gerar Group Key
            const ids = [r1.id, r2.id].sort();
            const groupKey = `${r1.placa}-${r1.category}-${ids.join('-')}`;
            
            // Se já foi revisada como NÃO duplicidade, pula.
            if (reviewsMap[groupKey] && (reviewsMap[groupKey].status === 'not_duplicate' || reviewsMap[groupKey].status === 'ignored')) {
               continue;
            }

            records.push({
              id: `inc-dup-${groupKey}`,
              type: 'duplicate',
              transactionId: r2.id,
              transactionType: 'income',
              date: r2.date,
              description: `Possível Duplicidade - Placa ${r1.placa}`,
              value: v2,
              details: `Placa ${r1.placa} e serviço ${r1.category} repetidos em ${Math.round(diffDays)} dias.${sameValue ? ' (Mesmo valor)' : ''}${sameCustomer ? ' (Mesmo cliente)' : ''}`,
              groupId: groupKey,
              groupRecords: [r1, r2]
            });
            break; // Apenas o primeiro par para simplificar
          }
        }
      }
    });

    let classification = '';
    let severity: any = 'info';
    let text = '';
    let recommendation = '';

    const duplicatesCount = records.filter(r => r.type === 'duplicate').length;
    const othersCount = records.length - duplicatesCount;

    if (records.length === 0) {
      classification = 'Base Íntegra';
      severity = 'positive';
      text = 'Sua base de dados está limpa. Não foram encontradas duplicidades ou lançamentos inválidos.';
      recommendation = 'Continue preenchendo os dados com atenção aos clientes, categorias e placas.';
    } else if (duplicatesCount > 0) {
      classification = 'Auditoria Necessária';
      severity = 'warning';
      text = `Foram encontradas ${duplicatesCount} possíveis duplicidades e ${othersCount} lançamentos incompletos. Lançamentos duplicados podem inflar artificialmente o seu lucro.`;
      recommendation = 'Clique em "Ver Inconsistências" e valide os lançamentos repetidos. Quando validada como correta, a duplicidade não voltará a aparecer.';
    } else {
      classification = 'Cadastros Incompletos';
      severity = 'info';
      text = `Existem ${othersCount} lançamentos precisando de ajustes (sem cliente, serviço ou categoria). Isso prejudica a qualidade dos outros diagnósticos.`;
      recommendation = 'Reserve um momento na semana para editar os lançamentos incompletos e classificar as receitas e despesas.';
    }

    return {
      diagnostic: {
        id: 'inconsistency',
        type: 'inconsistency',
        title: 'Diagnóstico de Inconsistências',
        classification,
        severity,
        priority: records.length > 5 ? 'high' : 'medium',
        mainMetric: `${records.length}`,
        secondaryMetric: 'Pendências',
        text,
        recommendation,
        actionLabel: records.length > 0 ? 'Ver Inconsistências' : undefined,
        actionId: 'open_inconsistencies_modal',
        hasData: true
      },
      records
    };
  }
};
