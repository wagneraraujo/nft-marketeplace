import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { ShieldCheck } from 'lucide-react'
import { useSession } from '@/features/auth/use-session'
import { walletOptions } from '@/features/wallets/queries'
import { cartOptions } from '@/features/cart/queries'
import { paymentSchema } from '@/contracts'
import { formatEth } from '@/lib/decimal'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { ErrorState, Loading } from '@/components/feedback/states'
import { quoteOptions, placeOrder, attemptStore } from './api'
export function CheckoutPage() {
  const { data: user } = useSession()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState(() =>
    storage.read(`coupon:${user?.id}`, ''),
  )
  const [draft, setDraft] = useState(coupon)
  const quote = useQuery(quoteOptions(user?.id, coupon))
  const wallets = useQuery(walletOptions(user?.id))
  const cart = useQuery(cartOptions(user?.id))
  const [now, setNow] = useState(Date.now)
  const [reviewed, setReviewed] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { walletId: '', accepted: false },
  })
  const attempt = user ? attemptStore.get(user.id) : null
  useEffect(() => {
    if (attempt?.orderId)
      void navigate({ to: '/orders/$id', params: { id: attempt.orderId } })
  }, [attempt?.orderId, navigate])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const mutation = useMutation({
    mutationFn: async (input: { walletId: string }) => {
      if (!user || !quote.data) throw new Error('Cotação indisponível.')
      return placeOrder(user.id, {
        quoteId: quote.data.id,
        walletId: input.walletId,
      })
    },
    onSuccess: (order) => {
      void navigate({ to: '/orders/$id', params: { id: order.id } })
    },
    onError: (error) => {
      if (
        user &&
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 401 &&
        error.response.status !== 403
      ) {
        attemptStore.clear(user.id)
        setReviewed(null)
        setValue('accepted', false)
        void quote.refetch()
      }
    },
  })
  const recovering = !!attempt && !attempt.orderId && !mutation.isPending
  const recovery = useMutation({
    mutationFn: async () => {
      if (!user || !attempt) throw new Error('Tentativa não encontrada.')
      return placeOrder(user.id, attempt.input)
    },
    onSuccess: (order) => {
      void navigate({ to: '/orders/$id', params: { id: order.id } })
    },
    onError: (error) => {
      if (
        user &&
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 401 &&
        error.response.status !== 403
      ) {
        attemptStore.clear(user.id)
        setReviewed(null)
        setValue('accepted', false)
        void quote.refetch()
      }
    },
  })
  const stale =
    !quote.data ||
    quote.data.expiresAt <= now ||
    quote.data.cartVersion !== cart.data?.version ||
    quote.isFetching
  return (
    <main className="page checkout-page">
      <div className="mobile-screen-header">
        <Link to="/cart" aria-label="Voltar">
          ‹
        </Link>
        <h1>Pagamento com carteira</h1>
      </div>
      <div className="breadcrumbs">
        <Link to="/cart">Carrinho</Link>
        <span>/</span>
        <span>Pagamento</span>
      </div>
      {recovering && (
        <div className="notice" role="status">
          <h2>A resposta da compra não chegou</h2>
          <p>Recupere a tentativa anterior antes de iniciar outra compra.</p>
          <Button
            disabled={recovery.isPending}
            onClick={() => recovery.mutate()}
          >
            {recovery.isPending ? 'Recuperando…' : 'Recuperar tentativa'}
          </Button>
          {recovery.error && <ErrorState error={recovery.error} />}
        </div>
      )}
      <div className="cart-layout">
        <section className="checkout-profile">
          {' '}
          <h1>Perfil do colecionador</h1>
          <div className="profile-form-fields">
            <label className="field">
              Nome de exibição
              <input readOnly value={user?.name ?? ''} />
            </label>
            <label className="field">
              E-mail
              <input readOnly value={user?.email ?? ''} />
            </label>
            <label className="field">
              Rede
              <input readOnly value="Ethereum (simulada)" />
            </label>
            <label className="field">
              Carteira principal
              <input
                readOnly
                value={
                  wallets.data?.find((wallet) => wallet.primary)?.address ??
                  'Nenhuma carteira cadastrada'
                }
              />
            </label>
          </div>
          <p>
            <Link className="text-link" to="/profile">
              Editar perfil
            </Link>{' '}
            ·{' '}
            <Link className="text-link" to="/wallets">
              Gerenciar carteiras
            </Link>
          </p>
        </section>
        <div className="checkout-sidebar">
          <section className="checkout-nfts">
            {' '}
            <h2>Seus NFTs</h2>
            {cart.isPending ? (
              <Loading />
            ) : (
              cart.data?.items.map((item) => (
                <div className="checkout-item" key={item.nft.id}>
                  <img
                    src={item.nft.image}
                    alt={item.nft.name}
                    width={64}
                    height={64}
                  />
                  <div>
                    <strong>{item.nft.name}</strong>
                    <p>
                      {item.quantity} × {formatEth(item.nft.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>{' '}
          <section className="checkout-wallets">
            {' '}
            <h2>Carteira de pagamento</h2>
            {wallets.isPending ? (
              <Loading />
            ) : wallets.error ? (
              <ErrorState
                error={wallets.error}
                retry={() => void wallets.refetch()}
              />
            ) : !wallets.data?.length ? (
              <p>
                Cadastre uma carteira para continuar.{' '}
                <Link className="text-link" to="/wallets">
                  Minhas carteiras
                </Link>
              </p>
            ) : (
              <fieldset className="wallet-options">
                <legend>Carteira conectada</legend>
                {wallets.data.map((wallet) => (
                  <label className="wallet-option" key={wallet.id}>
                    <input
                      type="radio"
                      value={wallet.id}
                      form="checkout-payment"
                      {...register('walletId')}
                    />
                    <span>
                      <strong>{wallet.label}</strong>
                      <small>
                        {wallet.address.slice(0, 8)}…{wallet.address.slice(-4)}
                      </small>
                      <small>Rede Ethereum · {wallet.type ?? 'MetaMask'}</small>
                    </span>
                  </label>
                ))}
                <span id="wallet-error" className="field-error">
                  {errors.walletId?.message}
                </span>
                <Link className="text-link" to="/wallets">
                  Trocar carteira
                </Link>
              </fieldset>
            )}
          </section>{' '}
          <aside className="summary">
            <h2>Resumo do pedido</h2>
            <form
              className="coupon-form"
              onSubmit={(e) => {
                e.preventDefault()
                const value = draft.trim().toUpperCase()
                storage.write(`coupon:${user?.id}`, value)
                setCoupon(value)
                setReviewed(null)
                setValue('accepted', false)
              }}
            >
              <label className="field">
                Cupom
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Código do cupom"
                />
              </label>
              <Button
                type="submit"
                variant="outline"
                disabled={quote.isFetching}
              >
                Aplicar
              </Button>
            </form>
            {quote.isPending ? (
              <Loading />
            ) : quote.error ? (
              <ErrorState
                error={quote.error}
                retry={() => void quote.refetch()}
              />
            ) : (
              <>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatEth(quote.data.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Desconto</dt>
                    <dd>− {formatEth(quote.data.discount)}</dd>
                  </div>
                  <div>
                    <dt>Taxa de serviço</dt>
                    <dd>{formatEth(quote.data.fee)}</dd>
                  </div>
                  <div className="total">
                    <dt>Total</dt>
                    <dd>{formatEth(quote.data.total)}</dd>
                  </div>
                </dl>
                <p className="muted">
                  {stale
                    ? 'A cotação precisa ser atualizada.'
                    : `Cotação válida por ${Math.max(0, Math.ceil((quote.data.expiresAt - now) / 1000))} segundos.`}
                </p>
                <Button
                  variant="outline"
                  className="wide"
                  disabled={
                    quote.isFetching || mutation.isPending || recovering
                  }
                  onClick={() => {
                    setReviewed(null)
                    setValue('accepted', false)
                    void quote.refetch()
                  }}
                >
                  Atualizar cotação
                </Button>
              </>
            )}
          </aside>{' '}
          <form
            className="panel checkout-confirm"
            id="checkout-payment"
            noValidate
            onSubmit={handleSubmit((input) => mutation.mutate(input))}
          >
            <label className="checkbox-field">
              <input
                type="checkbox"
                disabled={stale || recovering || mutation.isPending}
                {...register('accepted')}
                onChange={(e) => {
                  setValue('accepted', e.target.checked)
                  setReviewed(
                    e.target.checked ? (quote.data?.id ?? null) : null,
                  )
                }}
                aria-invalid={!!errors.accepted}
                aria-describedby="accepted-error"
              />
              Revisei os itens e concordo com o total desta cotação.
            </label>
            <p id="accepted-error" className="field-error">
              {errors.accepted?.message}
            </p>
            {mutation.error && <ErrorState error={mutation.error} />}
            <Button
              type="submit"
              className="wide"
              disabled={
                mutation.isPending ||
                recovering ||
                stale ||
                reviewed !== quote.data?.id
              }
            >
              {mutation.isPending ? 'Enviando pedido…' : 'Confirmar compra'}
            </Button>
            <p className="trust">
              <ShieldCheck size={17} /> Demonstração: nenhum valor real será
              transferido.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
