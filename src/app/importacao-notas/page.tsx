import { InvoiceImportPage } from '@/features/invoice-imports/components/InvoiceImportPage';

export const metadata = {
  title: 'Importação de Notas Fiscais - Alfa Perícia',
  description: 'Importação e extração de placas de notas fiscais (XLS/XLSX).',
};

export default function Page() {
  return <InvoiceImportPage />;
}
