import type { ReactNode } from 'react'
import { errorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
export function Loading({ cards = false }: { cards?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cards ? 'nft-grid' : 'loading-block'}
    >
      {Array.from({ length: cards ? 6 : 1 }, (_, i) => (
        <div key={i} className="skeleton">
          <div />
          <span />
          <span />
        </div>
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
export function ErrorState({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) {
  return (
    <div role="alert" className="notice error">
      <p>{errorMessage(error)}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}
