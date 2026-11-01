import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { sessionStore } from '@/lib/storage'
import { queryClient } from '@/lib/query-client'
import type { User, Session } from '@/contracts'
export const sessionOptions = () =>
  queryOptions({
    queryKey: ['session', sessionStore.token()],
    queryFn: async ({ signal }) =>
      (await api.get<User>('/session', { signal })).data,
    enabled: !!sessionStore.token(),
    retry: false,
    staleTime: 10000,
  })
export async function requireSession() {
  if (!sessionStore.token()) return null
  try {
    return await queryClient.ensureQueryData(sessionOptions())
  } catch {
    return null
  }
}
export async function authenticate(mode: 'login' | 'register', input: unknown) {
  const initialToken = sessionStore.token()
  const result = (await api.post<Session>(`/${mode}`, input)).data
  await queryClient.cancelQueries()
  if (sessionStore.token() !== initialToken)
    throw new Error('A sessão mudou durante o login.')
  queryClient.clear()
  sessionStore.set(result.token)
  queryClient.setQueryData(sessionOptions().queryKey, result.user)
  window.dispatchEvent(new Event('session-changed'))
  return result.user
}
export async function logout() {
  const initialToken = sessionStore.token()
  try {
    await api.post('/logout')
  } catch {
    // Local logout remains possible when the simulated network is unavailable.
  } finally {
    if (sessionStore.token() === initialToken) {
      await queryClient.cancelQueries()
      if (sessionStore.token() === initialToken) {
        queryClient.clear()
        sessionStore.clear()
        window.dispatchEvent(new Event('session-changed'))
      }
    }
  }
}
