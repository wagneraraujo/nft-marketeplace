import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { WalletCards } from 'lucide-react'
import { walletSchema } from '@/contracts'
import { api, errorMessage } from '@/lib/api'
import { applyFormErrors } from '@/lib/form-errors'
import { queryClient } from '@/lib/query-client'
import { useSession } from '@/features/auth/use-session'
import { walletOptions } from './queries'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
export function WalletsPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data: user } = useSession()
  const query = useQuery(walletOptions(user?.id))
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: { label: '', address: '', primary: false },
  })
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: walletOptions(user?.id).queryKey,
    })
  const mutation = useMutation({
    mutationFn: (input: z.infer<typeof walletSchema>) =>
      editingId
        ? api.put(`/wallets/${editingId}`, input)
        : api.post('/wallets', input),
    onSuccess: () => {
      reset()
      toast.success(editingId ? 'Carteira atualizada.' : 'Carteira adicionada.')
      setEditingId(null)
      void refresh()
    },
    onError: (error) => applyFormErrors(error, setError),
  })
  const primary = useMutation({
    mutationFn: (id: string) => api.put(`/wallets/${id}`, {}),
    onSuccess: () => {
      void refresh()
      toast.success('Carteira principal atualizada.')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
  return (
    <main className="page">
      <div className="page-heading">
        <h1>
          Minhas carteiras<span>.</span>
        </h1>
        <p>Escolha como organizar seus pagamentos.</p>
      </div>
      <div className="two-columns">
        <section>
          {query.isPending ? (
            <Loading />
          ) : query.error ? (
            <ErrorState
              error={query.error}
              retry={() => void query.refetch()}
            />
          ) : !query.data?.length ? (
            <Empty>
              <WalletCards size={32} />
              <h2>Adicione sua primeira carteira</h2>
            </Empty>
          ) : (
            query.data.map((wallet) => (
              <article className="panel wallet" key={wallet.id}>
                <WalletCards size={25} />
                <h2>{wallet.label}</h2>
                <p className="hash">{wallet.address}</p>
                {wallet.primary ? (
                  <span className="tag">Principal</span>
                ) : (
                  <Button
                    variant="outline"
                    disabled={primary.isPending}
                    onClick={() => primary.mutate(wallet.id)}
                  >
                    Definir como principal
                  </Button>
                )}
                <Button
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={() => {
                    setEditingId(wallet.id)
                    reset({
                      label: wallet.label,
                      address: wallet.address,
                      primary: wallet.primary,
                    })
                  }}
                >
                  Editar carteira
                </Button>
              </article>
            ))
          )}
        </section>
        <form
          className="panel"
          noValidate
          onSubmit={handleSubmit((input) => mutation.mutate(input))}
        >
          <h2>{editingId ? 'Editar carteira' : 'Adicionar carteira'}</h2>
          {(['label', 'address'] as const).map((field) => (
            <label className="field" key={field}>
              {field === 'label' ? 'Nome da carteira' : 'Endereço Ethereum'}
              <input
                placeholder={field === 'address' ? '0x…' : 'Minha carteira'}
                {...register(field)}
                aria-invalid={!!errors[field]}
                aria-describedby={`${field}-error`}
              />
              <span id={`${field}-error`} className="field-error">
                {errors[field]?.message}
              </span>
            </label>
          ))}
          <label className="checkbox-field">
            <input type="checkbox" {...register('primary')} />
            Usar como carteira principal
          </label>
          {errors.root && (
            <p role="alert" className="field-error">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Salvando…'
              : editingId
                ? 'Salvar carteira'
                : 'Adicionar carteira'}
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null)
                reset({ label: '', address: '', primary: false })
              }}
            >
              Cancelar edição
            </Button>
          )}
          <p className="muted">
            Não solicitamos chave privada ou frase de recuperação.
          </p>
        </form>
      </div>
    </main>
  )
}
