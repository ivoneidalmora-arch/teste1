import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useInsightsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ler o filtro de categoria/criticidade ativo da URL, padrão 'all'
  const currentFilter = searchParams.get('filtro') || 'all';

  // Ler o ano ativo da URL, padrão o ano atual
  const currentYear = parseInt(searchParams.get('ano') || String(new Date().getFullYear()), 10);

  // Define um novo valor para um filtro e atualiza a URL
  const setFilter = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('filtro', value);
    } else {
      params.delete('filtro');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Define um novo ano e atualiza a URL
  const setYear = useCallback((year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ano', String(year));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Limpa todos os filtros da URL
  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filtro: currentFilter,
    ano: currentYear,
    setFilter,
    setYear,
    clearFilters
  };
}
