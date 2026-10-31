import { io } from 'socket.io-client'
import { toast } from 'sonner'
import {
  eventSchema,
  type ResourceEvent,
  type Nft,
  type Catalog,
  type Cart,
  type Order,
} from '@/contracts'
import { sessionStore } from './storage'
import { queryClient } from './query-client'
export function connectSocket(token: string, userId: string) {
  const socket = io('wss://nft-marketplace.local', {
    path: '/socket.io/',
    transports: ['websocket'],
    query: { token },
    reconnectionDelay: 1000,
  })
  const versions = new Map<string, number>()
  const reconcile = () => {
    void queryClient.invalidateQueries({
      predicate: (q) =>
        ['catalog', 'nft', 'cart', 'quote', 'order', 'orders'].includes(
          String(q.queryKey[0]),
        ),
      refetchType: 'active',
    })
  }
  function knownVersion(event: ResourceEvent) {
    if (event.type === 'order.updated')
      return (
        queryClient.getQueryData<Order>(['order', userId, event.resourceId])
          ?.version ?? 0
      )
    const versions = [
      queryClient.getQueryData<Nft>(['nft', event.resourceId])?.version ?? 0,
    ]
    for (const [, data] of queryClient.getQueriesData<Catalog>({
      queryKey: ['catalog'],
    }))
      for (const nft of data?.items ?? [])
        if (nft.id === event.resourceId) versions.push(nft.version)
    for (const [, data] of queryClient.getQueriesData<Cart>({
      queryKey: ['cart'],
    }))
      for (const item of data?.items ?? [])
        if (item.nft.id === event.resourceId) versions.push(item.nft.version)
    return Math.max(...versions)
  }
  function handle(input: unknown) {
    if (sessionStore.token() !== token) return
    const parsed = eventSchema.safeParse(input)
    if (!parsed.success) return
    const event = parsed.data
    if (event.userId && event.userId !== userId) return
    const key = `${event.type}:${event.resourceId}`
    if (event.version <= Math.max(versions.get(key) ?? 0, knownVersion(event)))
      return
    versions.set(key, event.version)
    reconcile()
    toast.info(
      event.type === 'nft.updated'
        ? 'Preço ou disponibilidade atualizado. Revise sua cotação.'
        : 'O status do seu pedido foi atualizado.',
    )
  }
  socket.on('connect', reconcile)
  socket.on('nft.updated', handle)
  socket.on('order.updated', handle)
  socket.on('disconnect', () => {
    document.documentElement.dataset.connection = 'offline'
  })
  socket.on('connect', () => {
    document.documentElement.dataset.connection = 'online'
  })
  return () => {
    socket.removeAllListeners()
    socket.disconnect()
    versions.clear()
  }
}
