import { InsightsPage } from '@/features/insights/components/InsightsPage';
import { InsightsErrorBoundary } from '@/features/insights/components/InsightsErrorBoundary';

export const metadata = {
  title: 'Insights IA - Alfa Perícia',
  description: 'Análise financeira inteligente com Inteligência Artificial.',
};

export default function Page() {
  return (
    <InsightsErrorBoundary>
      <InsightsPage />
    </InsightsErrorBoundary>
  );
}
