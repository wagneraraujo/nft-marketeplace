import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import type { Order } from '@/contracts'
import { db, rawCart, save, sameItems } from '../db'
import { body, failure, guard, identity } from './shared'
import { scenario } from '../scenarios'
import { emit } from '../socket'
const orderSchema = z.object({ quoteId: z.string(), walletId: z.string() })
export function settleOrder(order: Order) {
  if (order.status !== 'pending') return
  order.status =
    db.outcomes?.[order.id] ??
    (scenario() === 'payment-declined' ? 'declined' : 'confirmed')
  if (order.status === 'confirmed') {
    // Revalidate at settlement too: concurrent orders cannot oversell an edition.
    if (
      order.quote.items.some((item) => {
        const nft = db.nfts.find((n) => n.id === item.nft.id)
        return (
          !nft ||
          nft.stock < item.quantity ||
          nft.version !== item.nft.version ||
          nft.price !== item.nft.price
        )
      })
    )
      order.status = 'declined'
    else {
      const cart = rawCart(order.userId)
      for (const item of order.quote.items) {
        const nft = db.nfts.find((n) => n.id === item.nft.id)!
        nft.stock -= item.quantity
        nft.version++
        const remaining = Math.max(0, (cart.items[nft.id] ?? 0) - item.quantity)
        if (remaining) cart.items[nft.id] = remaining
        else delete cart.items[nft.id]
        emit({
          type: 'nft.updated',
          eventId: crypto.randomUUID(),
          resourceId: nft.id,
          version: nft.version,
        })
      }
      cart.version++
      order.txHash = `0x${order.id.replaceAll('-', '').padEnd(64, '0')}`
    }
  }
  order.version++
  save()
  emit({
    type: 'order.updated',
    eventId: crypto.randomUUID(),
    resourceId: order.id,
    version: order.version,
    userId: order.userId,
  })
}
export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const parsed = orderSchema.safeParse(await body(request))
    if (!parsed.success)
      return failure(422, 'VALIDATION', 'Revise os dados do pagamento.')
    const input = parsed.data
    const key = request.headers.get('Idempotency-Key')
    if (!key)
      return failure(
        422,
        'IDEMPOTENCY_REQUIRED',
        'Chave de tentativa obrigatória.',
      )
    const fingerprint = JSON.stringify(input)
    const index = `${owner}:${key}`
    const existing = db.attempts[index]
    if (existing)
      return existing.fingerprint === fingerprint
        ? HttpResponse.json(db.orders[existing.orderId])
        : failure(
            409,
            'KEY_CONFLICT',
            'A tentativa foi reutilizada com outro conteúdo.',
          )
    const entry = db.quotes[input.quoteId]
    if (!entry || entry.userId !== owner)
      return failure(404, 'QUOTE_NOT_FOUND', 'Cotação não encontrada.')
    if (!db.wallets[owner]?.some((w) => w.id === input.walletId))
      return failure(422, 'WALLET_REQUIRED', 'Selecione uma carteira válida.')
    if (scenario() === 'price-change' || scenario() === 'sold-out') {
      const nft = db.nfts.find((n) => n.id === entry.quote.items[0]?.nft.id)
      if (nft) {
        nft.price = scenario() === 'price-change' ? '0.99' : nft.price
        nft.stock = scenario() === 'sold-out' ? 0 : nft.stock
        nft.version++
        save()
        emit({
          type: 'nft.updated',
          eventId: crypto.randomUUID(),
          resourceId: nft.id,
          version: nft.version,
        })
      }
    }
    if (
      entry.quote.expiresAt <= Date.now() ||
      entry.quote.cartVersion !== rawCart(owner).version ||
      !sameItems(entry.quote.items, owner)
    )
      return failure(
        409,
        'QUOTE_CHANGED',
        'Os valores ou a disponibilidade mudaram. Atualize a cotação e confirme novamente.',
      )
    if (!entry.quote.items.length)
      return failure(422, 'EMPTY_CART', 'Carrinho vazio.')
    const order: Order = {
      id: crypto.randomUUID(),
      userId: owner,
      version: 1,
      status: 'pending',
      quote: structuredClone(entry.quote),
      walletId: input.walletId,
      createdAt: new Date().toISOString(),
    }
    db.outcomes ??= {}
    db.outcomes[order.id] =
      scenario() === 'payment-declined' ? 'declined' : 'confirmed'
    db.orders[order.id] = order
    db.attempts[index] = { fingerprint, orderId: order.id }
    save()
    setTimeout(() => {
      if (db.orders[order.id] === order) settleOrder(order)
    }, 1800)
    if (scenario() === 'order-timeout') return HttpResponse.error()
    return HttpResponse.json(order, { status: 201 })
  }),
  http.get('/api/orders', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    return owner instanceof Response
      ? owner
      : HttpResponse.json(
          Object.values(db.orders)
            .filter((o) => o.userId === owner)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        )
  }),
  http.get('/api/orders/:id', async ({ request, params }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const order = db.orders[String(params.id)]
    if (!order || order.userId !== owner)
      return failure(404, 'NOT_FOUND', 'Pedido não encontrado.')
    if (
      order.status === 'pending' &&
      Date.now() - Date.parse(order.createdAt) > 1800
    )
      settleOrder(order)
    return HttpResponse.json(order)
  }),
]
