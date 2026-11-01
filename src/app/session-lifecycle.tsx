import { useEffect } from 'react'
import { useSession } from '@/features/auth/use-session'
import { sessionStore } from '@/lib/storage'
import { queryClient } from '@/lib/query-client'
import { router } from './router'
export function SessionLifecycle() {
  const { data: user } = useSession()
  const token = sessionStore.token()
  const userId = user?.id
  useEffect(() => {
    if (!userId || !token) return
    let cancelled = false
    let cleanup: (() => void) | undefined
    void import('@/lib/socket').then(({ connectSocket }) => {
      if (!cancelled) cleanup = connectSocket(token, userId)
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [userId, token])
  useEffect(() => {
    const changed = () => {
      void router.invalidate()
    }
    const expired = () => {
      void queryClient.cancelQueries()
      queryClient.clear()
      void router.invalidate()
      const path = location.pathname + location.search
      if (!path.startsWith('/login') && !path.startsWith('/register'))
        void router.navigate({ to: '/login', search: { redirect: path } })
    }
    window.addEventListener('session-changed', changed)
    window.addEventListener('session-expired', expired)
    return () => {
      window.removeEventListener('session-changed', changed)
      window.removeEventListener('session-expired', expired)
    }
  }, [])
  return null
}
