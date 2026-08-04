/**
 * xls-reader.ts
 *
 * Utilitário para leitura de arquivos .xls legados (BIFF8) usando SheetJS.
 * O ExcelJS não suporta .xls, então este módulo serve como camada de
 * compatibilidade. Para .xlsx, continue usando ExcelJS normalmente.
 */
import * as XLSX from 'xlsx';

/**
 * Lê um arquivo .xls (ou .xlsx) usando SheetJS e retorna
 * um array bidimensional [linha][coluna] com os valores brutos.
 *
 * @param file - O objeto File vindo do input/drop zone
 * @returns Promise com array de arrays (linhas × colunas)
 */
export async function readXlsFile(file: File): Promise<any[][]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('A planilha está vazia ou não possui abas.');
  }

  const worksheet = workbook.Sheets[firstSheetName];

  // Converte para array de arrays, preservando células vazias como null
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,       // retorna array de arrays (sem usar a 1ª linha como header)
    defval: null,    // células vazias viram null (não undefined)
    raw: false,      // converte datas para string ISO quando cellDates=true falhar
  });

  return rows;
}

/**
 * Lê um arquivo .xls/.xlsx e retorna array de objetos usando a primeira
 * linha encontrada como cabeçalho. Útil quando o header está na linha 1.
 *
 * @param file - O objeto File
 * @param headerRowIndex - índice (0-based) da linha de cabeçalho (padrão: 0)
 */
export async function readXlsFileAsObjects(
  file: File,
  headerRowIndex = 0
): Promise<Record<string, any>[]> {
  const rows = await readXlsFile(file);

  if (rows.length <= headerRowIndex) return [];

  const headers: string[] = (rows[headerRowIndex] ?? []).map((h: any) =>
    String(h ?? '').trim()
  );

  return rows.slice(headerRowIndex + 1).map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((header, colIdx) => {
      if (header) obj[header] = row[colIdx] ?? null;
    });
    return obj;
  });
}
