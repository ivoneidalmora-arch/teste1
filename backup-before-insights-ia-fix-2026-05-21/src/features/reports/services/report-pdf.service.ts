import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBRL } from '@/core/utils/formatters';
import { format } from 'date-fns';

export const reportPDFService = {
  async generateFinancialReport(data: any[], period: string) {
    const doc = new jsPDF();
    
    // --- Header Branded ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ALFA', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PERÍCIA E VISTORIA VEICULAR', 20, 28);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO', 120, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${period}`, 120, 28);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 120, 33);

    // --- Summary Cards ---
    const totalBruto = data.reduce((acc, curr) => acc + (curr.valor_bruto || 0), 0);
    const totalLiquido = data.reduce((acc, curr) => acc + (curr.valor_liquido || 0), 0);
    const count = data.length;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(15, 45, 180, 20, 3, 3, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL BRUTO', 25, 53);
    doc.text('TOTAL LÍQUIDO', 85, 53);
    doc.text('VISTORIAS', 155, 53);
    
    doc.setFontSize(11);
    doc.text(formatBRL(totalBruto), 25, 60);
    doc.text(formatBRL(totalLiquido), 85, 60);
    doc.text(count.toString(), 155, 60);

    // --- Table ---
    autoTable(doc, {
      startY: 75,
      head: [['Data', 'Placa', 'Cliente', 'Serviço', 'Valor Bruto', 'Valor Líquido']],
      body: data.map(item => [
        format(new Date(item.data), 'dd/MM/yyyy'),
        item.placa || '-',
        (item.cliente || 'AVULSO').toUpperCase(),
        item.categoria || 'Vistoria',
        formatBRL(item.valor_bruto || 0),
        formatBRL(item.valor_liquido || 0)
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    doc.save(`Relatorio_Alfa_${period.replace(/\//g, '-')}.pdf`);
  }
};
