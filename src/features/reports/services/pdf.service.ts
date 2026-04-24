import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, IncomeTransaction } from '@/core/types/finance';
import { format } from 'date-fns';
import { formatBRL } from '@/core/utils/formatters';

interface ExportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  ticketMedio: number;
  dateRange: string;
}

export const pdfService = {
  exportToPDF(transactions: Transaction[], summary: ExportSummary) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const brandBlue = '#3b82f6';
    const textDark = '#1e293b';
    const textLight = '#64748b';

    // Cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'bold');
    doc.text('ALFA PERÍCIA E VISTORIA', 40, 50);

    doc.setFontSize(10);
    doc.setTextColor(textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 555, 45, { align: 'right' });
    doc.text(`Período: ${summary.dateRange || 'Geral'}`, 555, 60, { align: 'right' });

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.line(40, 80, 555, 80);

    // Cartões Resumo
    const drawCard = (x: number, title: string, value: string, isDanger: boolean = false) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, 100, 120, 50, 4, 4, 'FD');
      doc.setFontSize(9);
      doc.setTextColor(textLight);
      doc.text(title, x + 8, 118);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isDanger ? '#ef4444' : textDark);
      doc.text(value, x + 8, 138);
    };

    drawCard(40, 'Total Receitas', formatBRL(summary.totalIncome));
    drawCard(170, 'Total Despesas', formatBRL(summary.totalExpense), true);
    drawCard(300, 'Saldo Líquido', formatBRL(summary.netBalance));
    drawCard(430, 'Ticket Médio', formatBRL(summary.ticketMedio));

    // Tabela
    const tableData = transactions.map(t => {
      const isInc = t.type === 'income';
      const val = isInc ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount;
      const desc = isInc ? ((t as IncomeTransaction).cliente || t.category) : ((t as any).description || t.category);
      
      return [
        format(new Date(t.date + 'T12:00:00'), 'dd/MM/yyyy'),
        isInc ? 'ENTRADA' : 'SAÍDA',
        t.category,
        desc.length > 30 ? desc.substring(0, 30) + '...' : desc,
        isInc ? formatBRL(val) : `- ${formatBRL(t.amount)}`
      ];
    });

    autoTable(doc, {
      startY: 180,
      head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
    });

    doc.save(`relatorio_alfa_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  }
};
