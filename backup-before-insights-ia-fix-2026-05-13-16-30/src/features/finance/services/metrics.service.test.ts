import { describe, it, expect } from 'vitest';
import { metricsService } from './metrics.service';
import { Transaction } from '@/core/types/finance';

describe('metricsService', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      amount: 1000,
      netAmount: 900,
      grossAmount: 1000,
      date: '2026-05-01',
      description: 'Vistoria Cautelar - Cliente A',
      customer: 'Cliente A',
      category: 'Vistoria Cautelar',
      status: 'paid',
      source: 'manual',
    },
    {
      id: '2',
      type: 'expense',
      amount: 500,
      date: '2026-05-02',
      description: 'Aluguel',
      category: 'Fixa',
      status: 'paid',
      source: 'manual',
    },
    {
      id: '3',
      type: 'expense',
      amount: 200,
      date: '2026-05-03',
      description: 'Internet',
      category: 'Fixa',
      status: 'pending',
      source: 'manual',
    }
  ];

  it('deve calcular métricas básicas corretamente', () => {
    const result = metricsService.calculateMetrics(mockTransactions);
    
    expect(result.totalIncome).toBe(900); // netAmount
    expect(result.totalExpense).toBe(500); // apenas 'paid'
    expect(result.totalPendingExpense).toBe(200);
    expect(result.netBalance).toBe(400); // 900 - 500
  });

  it('deve gerar dados para o dashboard corretamente', () => {
    const selectedDate = new Date('2026-05-15T12:00:00');
    const result = metricsService.calculateDashboard(mockTransactions, selectedDate);
    
    expect(result.currentIncome).toBe(900);
    expect(result.currentExpense).toBe(500);
    expect(result.calendarEvents.length).toBeGreaterThan(0);
    expect(result.calendarEvents[0].id).toBe('1');
    expect(typeof result.calendarEvents[0].id).toBe('string');
  });

  it('deve lidar com lista de transações vazia', () => {
    const result = metricsService.calculateMetrics([]);
    
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.netBalance).toBe(0);
  });
});
