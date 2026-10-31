import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/states'
export const Route = createFileRoute('/dev')({ component: Controls })
function Controls() {
  const [id, setId] = useState('')
  const query = useQuery({
    queryKey: ['dev-scenario'],
    queryFn: async () =>
      (await api.get<{ active: string; options: string[] }>('/dev/scenario'))
        .data,
  })
  const change = useMutation({
    mutationFn: (scenario: string) => api.post('/dev/scenario', { scenario }),
    onSuccess: () => {
      void query.refetch()
    },
  })
  const event = useMutation({
    mutationFn: (input: {
      id: string
      soldOut?: boolean
      duplicate?: boolean
      disconnect?: boolean
    }) => api.post('/dev/event', input),
  })
  const reset = useMutation({
    mutationFn: () => api.post('/dev/reset'),
    onSuccess: () => {
      localStorage.removeItem('nft-marketplace:session')
      location.href = '/'
    },
  })
  return (
    <main className="page">
      <div className="page-heading">
        <h1>Cenários da demonstração</h1>
        <p>
          Controles de desenvolvimento. Todas as operações passam pela API de
          controle do MSW.
        </p>
      </div>
      <section className="panel">
        <label className="field">
          Cenário
          <select
            aria-label="Cenário"
            value={query.data?.active ?? ''}
            disabled={change.isPending}
            onChange={(e) => change.mutate(e.target.value)}
          >
            {query.data?.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          ID do NFT
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="nft-1"
          />
        </label>
        <div className="category-tabs">
          <Button onClick={() => event.mutate({ id })}>Alterar preço</Button>
          <Button
            variant="outline"
            onClick={() => event.mutate({ id, soldOut: true })}
          >
            Esgotar edição
          </Button>
          <Button
            variant="outline"
            onClick={() => event.mutate({ id, duplicate: true })}
          >
            Repetir evento
          </Button>
          <Button
            variant="outline"
            onClick={() => event.mutate({ id, disconnect: true })}
          >
            Interromper conexão
          </Button>
          <Button
            variant="outline"
            disabled={reset.isPending}
            onClick={() => reset.mutate()}
          >
            Resetar demonstração
          </Button>
        </div>
        {(query.error || change.error || event.error || reset.error) && (
          <ErrorState
            error={query.error || change.error || event.error || reset.error}
          />
        )}
        <p role="status">{event.isSuccess ? 'Comando enviado ao mock.' : ''}</p>
      </section>
    </main>
  )
}
