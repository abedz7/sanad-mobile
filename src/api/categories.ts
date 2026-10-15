import { useQuery } from '@tanstack/react-query';

import { api } from './client';
import type { ApiSuccess, Category } from '../types/api';

async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<ApiSuccess<Category[]>>('/categories');
  return response.data.data;
}

/** Small, rarely-changing list — cache for five minutes. */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}
