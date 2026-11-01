import axios from 'axios'
import { sessionStore, visitorId } from './storage'
export const api = axios.create({ baseURL: '/api', timeout: 10000 })
api.interceptors.request.use((config) => {
  const token = sessionStore.token()
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Visitor-Id'] = visitorId()
  config.headers['X-Session-Scope'] = sessionStore.token() ?? 'visitor'
  return config
})
api.interceptors.response.use(
  (response) => {
    if (
      response.config.headers['X-Session-Scope'] !==
      (sessionStore.token() ?? 'visitor')
    )
      throw new axios.CanceledError('Discarded response from previous session')
    return response
  },
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.config &&
      error.config.headers['X-Session-Scope'] !==
        (sessionStore.token() ?? 'visitor')
    )
      return Promise.reject(
        new axios.CanceledError('Discarded response from previous session'),
      )
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers.Authorization === `Bearer ${sessionStore.token()}`
    ) {
      sessionStore.clear()
      window.dispatchEvent(new Event('session-expired'))
    }
    return Promise.reject(error)
  },
)
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error))
    return (
      error.response?.data?.message ??
      'Não foi possível conectar. Tente novamente.'
    )
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.'
}
