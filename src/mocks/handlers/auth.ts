import { http, HttpResponse } from 'msw'
import { accountSchema, loginSchema } from '@/contracts'
import { db, passwordHash, publicUser, mergeCart, save } from '../db'
import { body, failure, guard, identity } from './shared'
import { scenario } from '../scenarios'
function sessionFor(userId: string, visitor: string) {
  const token = crypto.randomUUID()
  db.sessions[token] = { userId, expiresAt: Date.now() + 3600000 }
  mergeCart(`guest:${visitor}`, userId)
  save()
  return HttpResponse.json({
    token,
    user: publicUser(db.users.find((u) => u.id === userId)!),
  })
}
export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const input = loginSchema.safeParse(await body(request))
    if (!input.success)
      return failure(422, 'VALIDATION', 'Verifique os campos.', {
        email: ['Confira o e-mail e a senha.'],
      })
    const user = db.users.find(
      (u) => u.email.toLowerCase() === input.data.email.toLowerCase(),
    )
    if (
      !user ||
      (await passwordHash(input.data.password, user.salt)) !== user.hash
    )
      return failure(
        422,
        'INVALID_CREDENTIALS',
        'E-mail ou senha incorretos.',
        { password: ['E-mail ou senha incorretos.'] },
      )
    return sessionFor(user.id, request.headers.get('X-Visitor-Id') ?? '')
  }),
  http.post('/api/register', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const input = accountSchema.safeParse(await body(request))
    if (!input.success || scenario() === 'validation-error')
      return failure(422, 'VALIDATION', 'Verifique os campos.', {
        email: ['Informe um e-mail válido.'],
      })
    if (
      db.users.some(
        (u) => u.email.toLowerCase() === input.data.email.toLowerCase(),
      )
    )
      return failure(409, 'EMAIL_TAKEN', 'Este e-mail já está cadastrado.', {
        email: ['Este e-mail já está cadastrado.'],
      })
    const salt = crypto.randomUUID()
    const user = {
      id: crypto.randomUUID(),
      name: input.data.name,
      email: input.data.email,
      avatar: '',
      salt,
      hash: await passwordHash(input.data.password, salt),
    }
    db.users.push(user)
    db.wallets[user.id] = []
    return sessionFor(user.id, request.headers.get('X-Visitor-Id') ?? '')
  }),
  http.get('/api/session', async ({ request }) => {
    const error = await guard(request)
    if (error) return error
    const owner = identity(request)
    if (owner instanceof Response) return owner
    return HttpResponse.json(publicUser(db.users.find((u) => u.id === owner)!))
  }),
  http.post('/api/logout', async ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (token) delete db.sessions[token]
    save()
    return new HttpResponse(null, { status: 204 })
  }),
]
