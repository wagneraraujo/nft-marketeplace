import { http, HttpResponse } from 'msw'
import { searchSchema } from '@/contracts'
import { compare } from '@/lib/decimal'
import { db, save } from '../db'
import { body, failure, guard, identity } from './shared'
import { scenario } from '../scenarios'
export const catalogHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const input = searchSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    )
    let items = db.nfts.filter(
      (n) =>
        (!input.q ||
          `${n.name} ${n.collection} ${n.creator}`
            .toLowerCase()
            .includes(input.q.toLowerCase())) &&
        (!input.category || n.category === input.category) &&
        (!input.rarity || n.rarity === input.rarity),
    )
    if (scenario() === 'empty') items = []
    if (input.sort !== 'newest')
      items.sort(
        (a, b) =>
          compare(a.price, b.price) * (input.sort === 'price-asc' ? 1 : -1),
      )
    const total = items.length
    return HttpResponse.json({
      items: items.slice((input.page - 1) * 9, input.page * 9),
      total,
      pages: Math.max(1, Math.ceil(total / 9)),
    })
  }),
  http.get('/api/nfts/:id', async ({ request, params }) => {
    const error = await guard(request)
    if (error) return error
    const nft = db.nfts.find((n) => n.id === params.id)
    return nft
      ? HttpResponse.json(nft)
      : failure(404, 'NOT_FOUND', 'NFT não encontrado.')
  }),
  http.get('/api/favorites', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    return owner instanceof Response
      ? owner
      : HttpResponse.json(db.favorites[owner] ?? [])
  }),
  http.put('/api/favorites/:id', async ({ request, params }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    if (scenario() === 'favorite-error')
      return failure(503, 'UNAVAILABLE', 'Não foi possível salvar o favorito.')
    const id = String(params.id)
    if (!db.nfts.some((n) => n.id === id))
      return failure(404, 'NOT_FOUND', 'NFT não encontrado.')
    const input = await body(request)
    const current = db.favorites[owner] ?? []
    db.favorites[owner] =
      input.active === true
        ? [...new Set([...current, id])]
        : current.filter((n) => n !== id)
    save()
    return HttpResponse.json(db.favorites[owner])
  }),
]
