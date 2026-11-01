import { queryOptions, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { visitorId } from '@/lib/storage'
import type { Cart } from '@/contracts'
export const cartOptions = (userId?: string) =>
  queryOptions({
    queryKey: ['cart', userId ?? `guest:${visitorId()}`],
    queryFn: async ({ signal }) =>
      (await api.get<Cart>('/cart', { signal })).data,
    staleTime: 10000,
  })
export function useCartMutation(userId?: string) {
  return useMutation({
    mutationFn: async (input: { id: string; quantity: number }) =>
      (await api.put<Cart>(`/cart/${input.id}`, { quantity: input.quantity }))
        .data,
    onSuccess: (cart) => {
      queryClient.setQueryData(cartOptions(userId).queryKey, cart)
      void queryClient.invalidateQueries({ queryKey: ['quote'] })
    },
  })
}
