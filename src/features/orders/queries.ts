import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Order } from '@/contracts'
export const ordersOptions = (userId?: string) =>
  queryOptions({
    queryKey: ['orders', userId],
    queryFn: async ({ signal }) =>
      (await api.get<Order[]>('/orders', { signal })).data,
    enabled: !!userId,
    staleTime: 0,
  })
export const orderOptions = (userId: string | undefined, id: string) =>
  queryOptions({
    queryKey: ['order', userId, id],
    queryFn: async ({ signal }) =>
      (await api.get<Order>(`/orders/${id}`, { signal })).data,
    enabled: !!userId,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? 2000 : false,
  })
