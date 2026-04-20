import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, IncomeTransaction } from '@/types/transaction';
import { format } from 'date-fns';

interface ExportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  ticketMedio: number;
  dateRange: string;
}

export const emitirRelatorioPDF = (
  transactions: Transaction[], 
  summary: ExportSummary
) => {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Cores da Marca
  const brandBlue = '#3b82f6';
  const textDark = '#1e293b';
  const textLight = '#64748b';

  // Cabeçalho Executivo
  doc.setFontSize(22);
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  // Usando um Fallback pois a imagem da LOGO as vezes requer conversão base64
  doc.text('ALFA VISTORIAS SP', 40, 50);

  // Título e Emissão à Direita
  doc.setFontSize(10);
  doc.setTextColor(textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório Gerencial Emitido em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 555, 45, { align: 'right' });
  doc.text(`Período de Referência: ${summary.dateRange || 'Geral'}`, 555, 60, { align: 'right' });

  // Linha Divisória Executiva
  doc.setDrawColor(59, 130, 246); // RGB from #3b82f6
  doc.setLineWidth(2);
  doc.line(40, 80, 555, 80);

  // Cartões Resumo
  const cardY = 100;
  const cardW = 120;
  const cardH = 50;

  const drawCard = (x: number, title: string, value: string, isDanger: boolean = false) => {
    // Retângulo Base com fundo cinza muito suave #f8fafc
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.roundedRect(x, cardY, cardW, cardH, 4, 4, 'FD');

    // Titulo
    doc.setFontSize(9);
    doc.setTextColor(textLight);
    doc.text(title, x + 8, cardY + 18);

    // Valor Real
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (isDanger) doc.setTextColor('#ef4444');
    else doc.setTextColor(textDark);
    doc.text(value, x + 8, cardY + 38);
  };

  const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  drawCard(40, 'Total Receitas', formatBRL(summary.totalIncome));
  drawCard(170, 'Total Despesas', formatBRL(summary.totalExpense), true);
  drawCard(300, 'Saldo Líquido', formatBRL(summary.netBalance));
  drawCard(430, 'Ticket Médio', formatBRL(summary.ticketMedio));

  // Tabela de Dados
  const tableData = transactions.map(t => {
    const isInc = t.type === 'income';
    const incNet = isInc ? ((t as IncomeTransaction).amountLiquido || t.amount) : t.amount;
    const nomeCorreto = isInc ? ((t as IncomeTransaction).cliente || t.category) : ((t as any).description || t.category);
    
    return [
      format(new Date(t.date), 'dd/MM/yyyy'),
      isInc ? 'ENTRADA' : 'SAÍDA',
      t.category,
      nomeCorreto.length > 30 ? nomeCorreto.substring(0, 30) + '...' : nomeCorreto,
      isInc ? formatBRL(incNet) : `- ${formatBRL(t.amount)}`
    ];
  });

  autoTable(doc, {
    startY: 180,
    head: [['Data', 'Tipo', 'Categoria', 'Identificação', 'Valor (R$)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Fundo azul #3b82f6
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Cinza clarissimo #f8fafc
    },
    styles: {
      fontSize: 8,
      cellPadding: 4
    },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' } // Coluna de Valor: Alinhamento à direita
    }
  });

  doc.save(`relatorio_alfa_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
