import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { ResourceEvent } from '@/contracts'
import { db } from '../db'
const link = ws.link('wss://nft-marketplace.local/')
const clients = new Set<{
  userId: string
  emit: (type: string, event: ResourceEvent) => void
  close: () => void
}>()
export function emit(event: ResourceEvent) {
  for (const client of clients)
    if (!event.userId || event.userId === client.userId)
      client.emit(event.type, event)
}
export function disconnectClients() {
  for (const client of clients) client.close()
}
export const socketHandlers = [
  link.addEventListener('connection', (connection) => {
    const token = new URL(connection.client.url).searchParams.get('token') ?? ''
    const session = db.sessions[token]
    if (!session || session.expiresAt <= Date.now()) {
      connection.client.close(1008, 'Session expired')
      return
    }
    const bound = toSocketIo(connection)
    const client = {
      userId: session.userId,
      emit: (type: string, event: ResourceEvent) =>
        bound.client.emit(type, event),
      close: () => connection.client.close(1012, 'Reconnect'),
    }
    clients.add(client)
    connection.client.addEventListener('close', () => clients.delete(client))
    // The binding handles framing/handshake; Engine.IO heartbeat is kept alive here.
    const timer = setInterval(() => connection.client.send('2'), 20000)
    connection.client.addEventListener('close', () => clearInterval(timer))
  }),
]
