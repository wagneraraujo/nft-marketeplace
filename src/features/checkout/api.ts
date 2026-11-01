import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { storage } from '@/lib/storage'
import type { Quote, OrderInput, Order } from '@/contracts'
export const quoteOptions = (userId?: string, coupon = '') =>
  queryOptions({
    queryKey: ['quote', userId, coupon],
    queryFn: async ({ signal }) =>
      (await api.post<Quote>('/quotes', { coupon }, { signal })).data,
    enabled: !!userId,
    staleTime: 0,
    retry: false,
  })
interface Attempt {
  key: string
  input: OrderInput
  orderId?: string
}
export const attemptStore = {
  get: (userId: string) =>
    storage.read<Attempt | null>(`attempt:${userId}`, null),
  clear: (userId: string) => storage.remove(`attempt:${userId}`),
}
export async function placeOrder(userId: string, input: OrderInput) {
  let attempt = attemptStore.get(userId)
  // An unresolved attempt must be recovered before accepting a different purchase.
  if (
    attempt &&
    !attempt.orderId &&
    JSON.stringify(attempt.input) !== JSON.stringify(input)
  )
    throw new Error(
      'Existe uma tentativa sem resposta. Recupere essa tentativa antes de iniciar outra.',
    )
  if (!attempt || attempt.orderId) {
    attempt = { key: crypto.randomUUID(), input }
    storage.write(`attempt:${userId}`, attempt)
  }
  const order = (
    await api.post<Order>('/orders', attempt.input, {
      headers: { 'Idempotency-Key': attempt.key },
    })
  ).data
  storage.write(`attempt:${userId}`, { ...attempt, orderId: order.id })
  return order
}
