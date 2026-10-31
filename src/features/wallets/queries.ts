import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Wallet } from '@/contracts'
export const walletOptions = (userId?: string) =>
  queryOptions({
    queryKey: ['wallets', userId],
    queryFn: async ({ signal }) =>
      (await api.get<Wallet[]>('/wallets', { signal })).data,
    enabled: !!userId,
    staleTime: 10000,
  })
