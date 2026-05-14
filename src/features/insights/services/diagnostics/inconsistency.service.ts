import { DiagnosticResult, InconsistencyRecord, AuditSeverity, AuditStatus, InconsistencyGroup } from '../../types/diagnostics.types';

// REMOVIDO: import { supabaseAdmin } from '@/lib/supabase/server';
// Este arquivo agora é focado 100% em lógica pura de análise, permitindo uso seguro no bundle de cliente se necessário,
// embora agora seja executado preferencialmente no servidor via Actions.

export const inconsistencyService = {
  analyze(context: any): { diagnostic: DiagnosticResult, records: InconsistencyRecord[] } {
    const { rawRevenues, rawExpenses, existingReviews, auditIssues = [], period } = context;

    let targetRevenues = rawRevenues;
    let targetExpenses = rawExpenses;

    if (period.type === 'month') {
      targetRevenues = rawRevenues.filter((r: any) => r.date >= period.startDate && r.date <= period.endDate);
      targetExpenses = rawExpenses.filter((e: any) => e.date >= period.startDate && e.date <= period.endDate);
    }

    const records: InconsistencyRecord[] = [];

    // Map de auditoria para filtro rápido
    const auditMap: Record<string, any> = {};
    auditIssues.forEach((issue: any) => {
      const key = `${issue.transaction_id}-${issue.issue_type}`;
      auditMap[key] = issue;
    });

    // Helper para adicionar record se não estiver resolvido/aprovado
    const addRecord = (record: Omit<InconsistencyRecord, 'status'>) => {
      const auditKey = `${record.transactionId}-${record.type}`;
      const existingAudit = auditMap[auditKey];
      
      if (existingAudit && (existingAudit.status === 'approved' || existingAudit.status === 'ignored' || existingAudit.status === 'resolved')) {
        return;
      }

      records.push({
        ...record,
        status: (existingAudit?.status as AuditStatus) || 'pending'
      });
    };

    // 1. ANALISE DE RECEITAS
    targetRevenues.forEach((r: any) => {
      const val = Number(r.amountLiquido) || Number(r.amount) || 0;
      
      // Valor inválido
      if (val <= 0 && r.category !== 'Vistoria de Retorno') {
        addRecord({
          id: `${r.id}-invalid-value`,
          type: 'invalid_value',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: 'Valor Financeiro Inválido',
          value: val,
          details: 'A receita possui valor zerado ou negativo.',
          severity: 'critical',
          affectedField: 'Valor Bruto / Líquido',
          currentValue: val,
          expectedRule: 'Receita deve ter valor positivo (exceto retornos)',
          impact: 'Distorce o faturamento total, lucro líquido e projeções de fluxo de caixa.',
          recommendation: 'Corrija o valor no lançamento ou adicione uma justificativa se for um caso especial.',
          rawRecord: { ...r, type: 'income' }
        });
      }

      // Cliente ausente
      const cliente = r.customer || r.cliente;
      if (!cliente || cliente.trim() === '' || ['SN', 'S/N', 'SEM CLIENTE'].includes(cliente.toUpperCase())) {
        addRecord({
          id: `${r.id}-no-client`,
          type: 'no_client',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: 'Cadastro de Cliente Incompleto',
          value: val,
          details: 'Lançamento efetuado sem identificação do cliente.',
          severity: 'alert',
          affectedField: 'Cliente',
          currentValue: cliente || 'Vazio',
          expectedRule: 'Obrigatório identificar o tomador do serviço',
          impact: 'Impede a análise de clientes mais lucrativos e histórico de inadimplência.',
          recommendation: 'Identifique o cliente no lançamento para melhorar seus relatórios.',
          rawRecord: { ...r, type: 'income' }
        });
      }

      // Serviço/Categoria ausente
      if (!r.category || r.category.trim() === '' || r.category.toUpperCase() === 'OUTROS') {
        addRecord({
          id: `${r.id}-no-service`,
          type: 'no_service',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: 'Serviço não Categorizado',
          value: val,
          details: 'Lançamento sem classificação de serviço.',
          severity: 'alert',
          affectedField: 'Categoria / Serviço',
          currentValue: r.category || 'Outros',
          expectedRule: 'Classificar o serviço conforme o catálogo',
          impact: 'Prejudica o ranking de serviços e a análise de margem por categoria.',
          recommendation: 'Selecione a categoria correta do serviço prestado.',
          rawRecord: { ...r, type: 'income' }
        });
      }

      // Placa ausente (se for vistoria)
      const placa = r.metadata?.placa || r.placa;
      if (r.category?.includes('Vistoria') && (!placa || placa.trim() === '')) {
        addRecord({
          id: `${r.id}-no-placa`,
          type: 'incomplete_registration',
          transactionId: r.id,
          transactionType: 'income',
          date: r.date,
          description: 'Placa não Identificada',
          value: val,
          details: 'Serviço de vistoria sem registro de placa.',
          severity: 'alert',
          affectedField: 'Placa (Metadados)',
          currentValue: 'Vazio',
          expectedRule: 'Toda vistoria deve ter uma placa associada',
          impact: 'Dificulta a auditoria de duplicidade e a localização futura do serviço.',
          recommendation: 'Informe a placa do veículo vistoriado.',
          rawRecord: { ...r, type: 'income' }
        });
      }
    });

    // 2. ANALISE DE DESPESAS
    targetExpenses.forEach((e: any) => {
      const val = Number(e.amount) || 0;

      // Valor inválido
      if (val <= 0) {
        addRecord({
          id: `${e.id}-invalid-value`,
          type: 'invalid_value',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: 'Despesa com Valor Inválido',
          value: val,
          details: 'Lançamento de saída com valor zerado ou negativo.',
          severity: 'critical',
          affectedField: 'Valor da Despesa',
          currentValue: val,
          expectedRule: 'Despesas devem ter valor positivo',
          impact: 'Afeta o cálculo de despesas fixas/variáveis e o saldo disponível.',
          recommendation: 'Corrija o valor ou exclua o lançamento se for um erro.',
          rawRecord: { ...e, type: 'expense' }
        });
      }

      // Categoria ausente
      if (!e.category || e.category.trim() === '' || e.category.toUpperCase() === 'OUTROS') {
        addRecord({
          id: `${e.id}-no-category`,
          type: 'no_category',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: 'Despesa sem Centro de Custo',
          value: val,
          details: 'Despesa não categorizada.',
          severity: 'alert',
          affectedField: 'Categoria',
          currentValue: e.category || 'Vazio',
          expectedRule: 'Classificar a despesa em uma categoria válida',
          impact: 'Impede o controle de teto de gastos por categoria e análise de DRE.',
          recommendation: 'Categorize a despesa para um melhor controle financeiro.',
          rawRecord: { ...e, type: 'expense' }
        });
      }

      // Descrição ausente
      if (!e.description || e.description.trim() === '') {
        addRecord({
          id: `${e.id}-no-description`,
          type: 'no_description',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: 'Falta Descrição Detalhada',
          value: val,
          details: 'Despesa sem identificação do que foi pago.',
          severity: 'info',
          affectedField: 'Descrição',
          currentValue: 'Vazio',
          expectedRule: 'Descrever o destinatário ou motivo do gasto',
          impact: 'Dificulta a auditoria futura e transparência dos gastos.',
          recommendation: 'Adicione uma descrição breve sobre esta despesa.',
          rawRecord: { ...e, type: 'expense' }
        });
      }

      // Vencida e não paga
      if (e.status === 'pending' && e.dueDate && new Date(e.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
        addRecord({
          id: `${e.id}-expired`,
          type: 'expired_unpaid',
          transactionId: e.id,
          transactionType: 'expense',
          date: e.date,
          description: 'Despesa Vencida e Não Paga',
          value: val,
          details: 'O vencimento desta despesa já passou e o status ainda é pendente.',
          severity: 'critical',
          affectedField: 'Vencimento / Status',
          currentValue: e.dueDate,
          expectedRule: 'Manter pagamentos em dia ou atualizar status',
          impact: 'Pode gerar multas, juros e comprometer o score financeiro da empresa.',
          recommendation: 'Efetue o pagamento ou atualize a data de vencimento.',
          rawRecord: { ...e, type: 'expense' }
        });
      }
    });

    // 3. DUPLICIDADES (LOGICA AVANÇADA)
    const rawGroups: Record<string, any[]> = {};
    targetRevenues.forEach((r: any) => {
      const placa = r.metadata?.placa || r.placa;
      if (placa && placa.trim() !== '') {
        const key = `${placa}-${r.category || ''}`;
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
            const sameValue = Math.abs(v1 - v2) < 0.01;

            const ids = [r1.id, r2.id].sort();
            const groupKey = `${(r1.metadata?.placa || r1.placa)}-${r1.category}-${ids.join('-')}`;
            
            if (reviewsMap[groupKey] && (reviewsMap[groupKey].status === 'not_duplicate' || reviewsMap[groupKey].status === 'ignored')) {
               continue;
            }

            addRecord({
              id: `dup-${groupKey}`,
              type: 'duplicate',
              transactionId: r2.id,
              transactionType: 'income',
              date: r2.date,
              description: 'Possível Duplicidade Detectada',
              value: v2,
              details: `Placa ${r1.metadata?.placa || r1.placa} repetida para o serviço ${r1.category} em um intervalo de ${Math.round(diffDays)} dias.`,
              severity: sameValue ? 'critical' : 'alert',
              affectedField: 'Múltiplos Campos',
              currentValue: `IDs: ${r1.id}, ${r2.id}`,
              expectedRule: 'Evitar lançamentos idênticos para o mesmo veículo em curto prazo',
              impact: 'Infla artificialmente o faturamento e gera impostos sobre valores inexistentes.',
              recommendation: 'Valide se são serviços distintos ou um erro de lançamento duplo.',
              groupId: groupKey,
              groupRecords: [r1, r2],
              rawRecord: { ...r2, type: 'income' }
            });
            break;
          }
        }
      }
    });

    // Diagnóstico Resumido
    let classification = '';
    let severity: any = 'info';
    let text = '';
    let recommendation = '';

    const criticalCount = records.filter(r => r.severity === 'critical').length;
    const alertCount = records.filter(r => r.severity === 'alert').length;

    if (records.length === 0) {
      classification = 'Base Íntegra';
      severity = 'positive';
      text = 'Excelente! Não foram encontradas inconsistências nos seus lançamentos.';
      recommendation = 'Mantenha o padrão de preenchimento para garantir relatórios precisos.';
    } else if (criticalCount > 0) {
      classification = 'Ação Crítica Necessária';
      severity = 'critical';
      text = `Existem ${criticalCount} problemas críticos que estão distorcendo seus resultados financeiros agora.`;
      recommendation = 'Priorize a resolução dos itens marcados como Críticos na Central de Auditoria.';
    } else {
      classification = 'Ajustes Sugeridos';
      severity = 'warning';
      text = `Foram detectados ${alertCount} alertas de cadastros incompletos ou dados divergentes.`;
      recommendation = 'Corrija os alertas para melhorar a precisão dos seus indicadores de performance.';
    }

    return {
      diagnostic: {
        id: 'inconsistency',
        type: 'inconsistency',
        title: 'Diagnóstico de Inconsistências',
        classification,
        severity,
        priority: criticalCount > 0 ? 'urgent' : (alertCount > 5 ? 'high' : 'medium'),
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
