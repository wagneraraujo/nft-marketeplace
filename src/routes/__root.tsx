import { createRootRoute, Link, HeadContent } from '@tanstack/react-router'
import { errorMessage } from '@/lib/api'
import { Shell } from '@/components/layout/shell'
export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Shell />
    </>
  ),
  notFoundComponent: () => (
    <main className="page">
      <h1>Página não encontrada</h1>
      <p>Este endereço não está disponível.</p>
      <Link to="/">Voltar ao catálogo</Link>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="page">
      <h1>Não foi possível abrir esta página</h1>
      <p>{errorMessage(error)}</p>
      <a href="/">Voltar ao início</a>
    </main>
  ),
})
