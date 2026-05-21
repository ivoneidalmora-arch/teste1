import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBRL } from '@/core/utils/formatters';
import { format } from 'date-fns';

interface GenerateReportParams {
  transactions: any[];
  metrics: {
    totalGrossRevenue: number;
    totalNetRevenue: number;
    totalExpenses: number;
    netBalance: number;
    netMargin: number;
    expenseChart: { name: string; value: number }[];
    incomeChart: { name: string; value: number }[];
  };
  summaryText: string;
  periodStr: string;
  modeStr: string;
  inconsistenciesCount: number;
}

export const reportPDFService = {
  async generateFinancialReport({
    transactions,
    metrics,
    summaryText,
    periodStr,
    modeStr,
    inconsistenciesCount
  }: GenerateReportParams) {
    // Instanciar o jsPDF no formato A4 em milímetros
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // --- 1. CABEÇALHO BRANDED EM SLATE ESCURO ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, 'F');
    
    // Marca do Sistema
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ALFA PERÍCIA', 15, 12);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('AUDITORIA E VISTORIA VEICULAR', 15, 17);
    
    // Título do Relatório
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RELATÓRIO FINANCEIRO CONSOLIDADO', 125, 12);
    
    // Metadados do Relatório
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`Período: ${periodStr}`, 125, 17);
    doc.text(`Modo de Análise: ${modeStr}`, 125, 21);
    doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 125, 25);

    // --- 2. CARDS DE KPIs EXECUTIVOS ---
    const drawKpiCard = (x: number, y: number, w: number, h: number, title: string, value: string, color: [number, number, number]) => {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, w, h, 2, 2, 'FD');
      
      // Título do KPI
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), x + 3, y + 5);
      
      // Valor do KPI
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(value, x + 3, y + 11);
    };

    const cardY = 37;
    const cardW = 35;
    const cardH = 14;
    const gap = 2.5;
    let currentX = 15;

    // Desenhar os 5 KPIs de destaque financeiro
    drawKpiCard(currentX, cardY, cardW, cardH, 'Receita Bruta', formatBRL(metrics.totalGrossRevenue), [15, 23, 42]);
    currentX += cardW + gap;
    drawKpiCard(currentX, cardY, cardW, cardH, 'Receita Líquida', formatBRL(metrics.totalNetRevenue), [16, 185, 129]);
    currentX += cardW + gap;
    drawKpiCard(currentX, cardY, cardW, cardH, 'Despesas Totais', formatBRL(metrics.totalExpenses), [239, 68, 68]);
    currentX += cardW + gap;
    drawKpiCard(currentX, cardY, cardW, cardH, 'Saldo Líquido', formatBRL(metrics.netBalance), metrics.netBalance >= 0 ? [16, 185, 129] : [239, 68, 68]);
    currentX += cardW + gap;
    drawKpiCard(currentX, cardY, cardW, cardH, 'Margem Líquida', `${metrics.netMargin.toFixed(1)}%`, [147, 51, 234]);

    // --- 3. FAIXA DO RESUMO EXECUTIVO ---
    const summaryY = 56;
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(15, summaryY, 180, 18, 2, 2, 'F');
    
    // Título do Resumo
    doc.setTextColor(191, 219, 254); // blue-200
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('RESUMO EXECUTIVO DO PERÍODO', 20, summaryY + 5);

    // Texto corrido (com quebra de linha segura)
    doc.setTextColor(241, 245, 249); // slate-100
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, summaryY + 10);

    // --- 4. TABELA DRE E RESUMO DA DISTRIBUIÇÃO ---
    // Agrupamento de despesas para o PDF
    const operacionais = metrics.expenseChart
      .filter(e => ['Operacional', 'Manutenção', 'Suprimentos', 'Custo Operacional'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const fixas = metrics.expenseChart
      .filter(e => ['Aluguel', 'Folha', 'Sistema/Software', 'Folha de Pagamento'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const impostos = metrics.expenseChart
      .filter(e => ['Impostos', 'Tributos'].includes(e.name))
      .reduce((acc, curr) => acc + curr.value, 0);

    const somadoConhecido = operacionais + fixas + impostos;
    const variaveis = Math.max(0, metrics.totalExpenses - somadoConhecido);

    const dreTableData = [
      ['Faturamento Bruto', formatBRL(metrics.totalGrossRevenue), '100.0%'],
      ['(-) Deduções (Receita Líquida)', formatBRL(metrics.totalNetRevenue), `${((metrics.totalNetRevenue / (metrics.totalGrossRevenue || 1)) * 100).toFixed(1)}%`],
      ['(-) Custos Operacionais', formatBRL(operacionais), `${((operacionais / (metrics.totalGrossRevenue || 1)) * 100).toFixed(1)}%`],
      ['(-) Despesas Fixas', formatBRL(fixas), `${((fixas / (metrics.totalGrossRevenue || 1)) * 100).toFixed(1)}%`],
      ['(-) Despesas Variáveis', formatBRL(variaveis), `${((variaveis / (metrics.totalGrossRevenue || 1)) * 100).toFixed(1)}%`],
      ['(-) Impostos e Tributos', formatBRL(impostos), `${((impostos / (metrics.totalGrossRevenue || 1)) * 100).toFixed(1)}%`],
      ['Resultado Líquido do Período', formatBRL(metrics.netBalance), `${metrics.netMargin.toFixed(1)}%`],
      ['Pendências de Auditoria', `${inconsistenciesCount} ocorrências`, inconsistenciesCount > 0 ? 'Ação Recomendada' : 'Sem alertas']
    ];

    autoTable(doc, {
      startY: 79,
      margin: { left: 15, right: 15 },
      head: [['Indicador Financeiro (DRE)', 'Valor Nominal', 'Percentual s/ Bruto']],
      body: dreTableData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold', halign: 'left' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'right' }
      },
      didParseCell: (data) => {
        // Estilo especial para a linha de Resultado Líquido
        if (data.row.index === 6) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = metrics.netBalance >= 0 ? [209, 250, 229] : [254, 226, 226]; // emerald-100 ou rose-100
        }
      }
    });

    // --- 5. DETALHAMENTO DE LANÇAMENTOS (PÁGINA 2 se necessário) ---
    // Filtrar apenas receitas de vistorias
    const incomes = transactions.filter(t => t.type === 'income');
    
    if (incomes.length > 0) {
      doc.addPage();
      
      // Cabeçalho da Página 2
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALHAMENTO ANALÍTICO DE ENTRADAS', 15, 9);
      
      autoTable(doc, {
        startY: 20,
        margin: { left: 15, right: 15 },
        head: [['Data', 'Placa', 'Cliente', 'Categoria / Serviço', 'Valor Bruto', 'Valor Líquido']],
        body: incomes.map(item => [
          format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy'),
          item.placa || item.metadata?.placa || '-',
          (item.cliente || item.customer || 'AVULSO').toUpperCase(),
          item.category || 'Vistoria',
          formatBRL(item.amountBruto || item.amount),
          formatBRL(item.amountLiquido || item.amount)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: {
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' }
        }
      });
    }

    // Salvar o arquivo PDF
    const filename = `Relatorio_Alfa_${periodStr.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  }
};
