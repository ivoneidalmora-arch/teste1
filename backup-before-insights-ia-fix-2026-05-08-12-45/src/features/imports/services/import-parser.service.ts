import { ImportItem } from '../types/import.types';

export const importParserService = {
  async parseFile(file: File): Promise<ImportItem[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv' || extension === 'xlsx') {
      return this.parseSpreadsheet(file);
    } else if (extension === 'pdf') {
      return this.parsePDF(file);
    }

    throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou PDF.');
  },

  async parseSpreadsheet(file: File): Promise<ImportItem[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/import-report', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao processar arquivo');
    }

    const result = await response.json();
    return result.data.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      status: 'valid'
    }));
  },

  async parsePDF(file: File): Promise<ImportItem[]> {
    // Reuse the existing AI-OCR logic via API
    return this.parseSpreadsheet(file);
  }
};
