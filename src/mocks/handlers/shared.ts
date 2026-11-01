import { HttpResponse, delay } from 'msw'
import type { ApiError } from '@/contracts'
import { db } from '../db'
import { scenario } from '../scenarios'
export function failure(
  status: number,
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
) {
  return HttpResponse.json<ApiError>({ code, message, fieldErrors }, { status })
}
export function identity(request: Request, required = true): string | Response {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  const session = token ? db.sessions[token] : undefined
  if (
    session &&
    session.expiresAt > Date.now() &&
    scenario() !== 'expired-session'
  )
    return session.userId
  return required || !!token
    ? failure(
        401,
        'SESSION_EXPIRED',
        'Sua sessão expirou. Entre novamente para continuar.',
      )
    : `guest:${request.headers.get('X-Visitor-Id') ?? 'anonymous'}`
}
export async function guard(request: Request) {
  const active = scenario()
  await delay(
    active === 'slow'
      ? 1800
      : active === 'out-of-order'
        ? (new URL(request.url).searchParams.get('q')?.length ?? 0) % 2
          ? 1200
          : 100
        : 120,
  )
  if (active === 'network-error') return HttpResponse.error()
  if (active === 'server-error')
    return failure(503, 'UNAVAILABLE', 'Serviço temporariamente indisponível.')
  if (active === 'forbidden')
    return failure(
      403,
      'FORBIDDEN',
      'Você não tem permissão para esta operação.',
    )
}
export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json()
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}
