import { http, HttpResponse, delay } from 'msw'
import { profileSchema, walletSchema, passwordSchema } from '@/contracts'
import { db, passwordHash, publicUser, save } from '../db'
import { scenario } from '../scenarios'
import { body, failure, guard, identity } from './shared'
export const profileHandlers = [
  http.get('/api/profile', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    return owner instanceof Response
      ? owner
      : HttpResponse.json(publicUser(db.users.find((u) => u.id === owner)!))
  }),
  http.put('/api/profile', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const parsed = profileSchema.safeParse(await body(request))
    if (!parsed.success)
      return failure(422, 'VALIDATION', 'Revise os dados do perfil.')
    if (parsed.data.avatar.length > 1400000)
      return failure(422, 'AVATAR_TOO_LARGE', 'Use uma imagem de até 1 MB.')
    if (
      db.users.some(
        (u) =>
          u.id !== owner &&
          u.email.toLowerCase() === parsed.data.email.toLowerCase(),
      )
    )
      return failure(409, 'EMAIL_TAKEN', 'Este e-mail já está em uso.', {
        email: ['Este e-mail já está em uso.'],
      })
    const user = db.users.find((u) => u.id === owner)!
    Object.assign(user, parsed.data)
    save()
    if (scenario() === 'late-profile-response') await delay(2200)
    return HttpResponse.json(publicUser(user))
  }),
  http.put('/api/password', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const parsed = passwordSchema.safeParse(await body(request))
    if (!parsed.success)
      return failure(
        422,
        'VALIDATION',
        'A senha precisa ter pelo menos 8 caracteres.',
      )
    const user = db.users.find((u) => u.id === owner)!
    if (
      (await passwordHash(parsed.data.currentPassword, user.salt)) !== user.hash
    )
      return failure(422, 'WRONG_PASSWORD', 'A senha atual está incorreta.', {
        currentPassword: ['Senha atual incorreta.'],
      })
    user.salt = crypto.randomUUID()
    user.hash = await passwordHash(parsed.data.password, user.salt)
    save()
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/wallets', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    return owner instanceof Response
      ? owner
      : HttpResponse.json(db.wallets[owner] ?? [])
  }),
  http.post('/api/wallets', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const parsed = walletSchema.safeParse(await body(request))
    if (!parsed.success)
      return failure(422, 'VALIDATION', 'Confira o endereço da carteira.', {
        address: ['Endereço Ethereum inválido.'],
      })
    const wallets = (db.wallets[owner] ??= [])
    if (
      wallets.some(
        (w) => w.address.toLowerCase() === parsed.data.address.toLowerCase(),
      )
    )
      return failure(
        409,
        'WALLET_EXISTS',
        'Esta carteira já está cadastrada.',
        { address: ['Carteira já cadastrada.'] },
      )
    if (parsed.data.primary) wallets.forEach((w) => (w.primary = false))
    wallets.push({
      id: crypto.randomUUID(),
      ...parsed.data,
      primary: parsed.data.primary || wallets.length === 0,
    })
    save()
    return HttpResponse.json(wallets, { status: 201 })
  }),
  http.put('/api/wallets/:id', async ({ request, params }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    const wallets = db.wallets[owner] ?? []
    const wallet = wallets.find((w) => w.id === params.id)
    if (!wallet) return failure(404, 'NOT_FOUND', 'Carteira não encontrada.')
    const input = await body(request)
    if (Object.keys(input).length) {
      const parsed = walletSchema.safeParse(input)
      if (!parsed.success)
        return failure(422, 'VALIDATION', 'Confira os dados da carteira.', {
          address: ['Endereço Ethereum inválido.'],
        })
      if (
        wallets.some(
          (w) =>
            w.id !== wallet.id &&
            w.address.toLowerCase() === parsed.data.address.toLowerCase(),
        )
      )
        return failure(
          409,
          'WALLET_EXISTS',
          'Esta carteira já está cadastrada.',
          { address: ['Carteira já cadastrada.'] },
        )
      Object.assign(wallet, parsed.data)
      if (wallet.primary)
        wallets.forEach((w) => {
          if (w.id !== wallet.id) w.primary = false
        })
      if (!wallets.some((w) => w.primary))
        (wallets.find((w) => w.id !== wallet.id) ?? wallet).primary = true
    } else wallets.forEach((w) => (w.primary = w.id === wallet.id))
    save()
    return HttpResponse.json(wallets)
  }),
]
