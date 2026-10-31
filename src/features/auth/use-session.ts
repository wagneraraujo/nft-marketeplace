import { useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sessionOptions } from './session'
import { sessionStore } from '@/lib/storage'
const subscribe = (callback: () => void) => {
  window.addEventListener('session-changed', callback)
  window.addEventListener('session-expired', callback)
  return () => {
    window.removeEventListener('session-changed', callback)
    window.removeEventListener('session-expired', callback)
  }
}
export function useSession() {
  useSyncExternalStore(subscribe, sessionStore.token, () => null)
  return useQuery(sessionOptions())
}
