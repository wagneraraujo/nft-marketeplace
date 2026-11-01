import { http, HttpResponse } from 'msw'
import { db, getCart, rawCart, makeQuote, save } from '../db'
import { body, failure, guard, identity } from './shared'
export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request, false)
    return owner instanceof Response ? owner : HttpResponse.json(getCart(owner))
  }),
  http.put('/api/cart/:id', async ({ request, params }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request, false)
    if (owner instanceof Response) return owner
    const input = await body(request)
    const quantity = input.quantity
    const nft = db.nfts.find((n) => n.id === params.id)
    if (!nft) return failure(404, 'NOT_FOUND', 'NFT não encontrado.')
    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > 10
    )
      return failure(422, 'QUANTITY', 'Quantidade inválida (0–10).')
    if (quantity > nft.stock)
      return failure(
        409,
        'SOLD_OUT',
        'A quantidade solicitada não está disponível.',
      )
    const cart = rawCart(owner)
    if (!quantity) delete cart.items[nft.id]
    else cart.items[nft.id] = quantity
    cart.version++
    cart.notices = []
    save()
    return HttpResponse.json(getCart(owner))
  }),
  http.post('/api/quotes', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const input = await body(request)
    const coupon =
      typeof input.coupon === 'string' ? input.coupon.trim().toUpperCase() : ''
    if (coupon && coupon !== 'ART10')
      return failure(
        422,
        'INVALID_COUPON',
        coupon === 'EXPIRED' ? 'Este cupom expirou.' : 'Cupom inválido.',
        { coupon: ['Use um cupom válido.'] },
      )
    const cart = getCart(owner)
    if (!cart.items.length)
      return failure(422, 'EMPTY_CART', 'Adicione um NFT antes de continuar.')
    if (cart.items.some((i) => i.quantity > i.nft.stock))
      return failure(
        409,
        'SOLD_OUT',
        'A disponibilidade mudou. Ajuste o carrinho.',
      )
    return HttpResponse.json(makeQuote(owner, coupon))
  }),
]
