import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { User } from '@/contracts'
export const profileOptions = (userId?: string) =>
  queryOptions({
    queryKey: ['profile', userId],
    queryFn: async ({ signal }) =>
      (await api.get<User>('/profile', { signal })).data,
    enabled: !!userId,
    staleTime: 10000,
  })
