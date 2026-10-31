import { useState } from 'react'
import { quoteOptions } from '@/features/checkout/api'
import { storage } from '@/lib/storage'
import { QuantityControl } from '@/components/design/quantity'
import { catalogOptions } from '@/features/catalog/queries'
import { NftCard } from '@/features/catalog/card'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/features/auth/use-session'
import { cartOptions, useCartMutation } from './queries'
import { formatEth, multiply } from '@/lib/decimal'
import { errorMessage } from '@/lib/api'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
export function CartPage() {
  const { data: user } = useSession()
  const query = useQuery(cartOptions(user?.id))
  const mutation = useCartMutation(user?.id)
  const [coupon, setCoupon] = useState(() =>
    storage.read(`coupon:${user?.id}`, ''),
  )
  const [draft, setDraft] = useState(coupon)
  const quote = useQuery(quoteOptions(user?.id, coupon))
  const related = useQuery(
    catalogOptions({
      q: '',
      category: '',
      rarity: '',
      sort: 'newest',
      page: 1,
    }),
  )
  return (
    <main className="page cart-page">
      <div className="mobile-screen-header">
        <Link to="/" aria-label="Voltar">
          ‹
        </Link>
        <h1>Carrinho de NFTs</h1>
      </div>
      <div className="breadcrumbs">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/">Mercado</Link>
        <span>/</span>
        <h1>Carrinho</h1>
      </div>
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : !query.data.items.length ? (
        <Empty>
          <ShoppingBag size={36} />
          <h2>Seu carrinho está vazio</h2>
          <p>Explore a coleção e encontre sua próxima obra.</p>
          <Link className="button primary" to="/">
            Explorar NFTs <ArrowRight size={17} />
          </Link>
        </Empty>
      ) : (
        <div className="cart-layout">
          <section>
            {query.data.notices.map((notice, i) => (
              <p key={i} role="status" className="notice">
                {notice}
              </p>
            ))}
            <div className="cart-table-head">
              <span>NFTs</span>
              <span>Preço</span>
              <span>Edições</span>
              <span>Total</span>
              <span />
            </div>
            {query.data.items.map((item) => (
              <article className="cart-item" key={item.nft.id}>
                <Link to="/nfts/$id" params={{ id: item.nft.id }}>
                  <img
                    src={item.nft.image}
                    alt={item.nft.name}
                    width={110}
                    height={110}
                  />
                </Link>
                <div>
                  <small className="muted">{item.nft.collection}</small>
                  <h2>
                    <Link to="/nfts/$id" params={{ id: item.nft.id }}>
                      {item.nft.name}
                    </Link>
                  </h2>
                  <span className="cart-token">ID do token: {item.nft.id}</span>
                  {item.quantity > item.nft.stock && (
                    <p className="field-error">
                      Disponibilidade alterada: {item.nft.stock} edições.
                    </p>
                  )}
                </div>
                <strong className="cart-unit-price">
                  {formatEth(item.nft.price)}
                </strong>
                <QuantityControl
                  value={item.quantity}
                  max={Math.min(10, item.nft.stock)}
                  disabled={mutation.isPending}
                  label={item.nft.name}
                  onChange={(quantity) =>
                    mutation.mutate(
                      { id: item.nft.id, quantity },
                      { onError: (error) => toast.error(errorMessage(error)) },
                    )
                  }
                />
                <strong className="cart-line-total">
                  {formatEth(multiply(item.nft.price, item.quantity))}
                </strong>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${item.nft.name}`}
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate(
                      { id: item.nft.id, quantity: 0 },
                      { onError: (error) => toast.error(errorMessage(error)) },
                    )
                  }
                >
                  <Trash2 size={18} />
                </Button>
              </article>
            ))}
          </section>
          <aside className="summary">
            <h2>Resumo da carteira</h2>
            {user ? (
              <>
                <form
                  className="coupon-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const value = draft.trim().toUpperCase()
                    storage.write(`coupon:${user.id}`, value)
                    setCoupon(value)
                  }}
                >
                  <label className="field">
                    Código promocional
                    <input
                      placeholder="Digite o código promocional…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </label>
                  <Button type="submit" disabled={quote.isFetching}>
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
                  <dl aria-busy={quote.isFetching}>
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
                )}
              </>
            ) : (
              <p>
                Entre na sua conta para calcular taxas, aplicar cupons e revisar
                o total.
              </p>
            )}
            <Link className="button primary wide" to="/checkout">
              Revisar pagamento <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/">
              Continuar explorando
            </Link>
          </aside>
        </div>
      )}
      <section className="related">
        <h2>Colecionadores também viram</h2>
        <div className="nft-grid">
          {related.data?.items.slice(3, 8).map((nft) => (
            <NftCard nft={nft} key={nft.id} />
          ))}
        </div>
      </section>
    </main>
  )
}
