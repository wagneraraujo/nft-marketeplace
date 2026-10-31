import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '@/features/auth/use-session'
import { cartOptions, useCartMutation } from './queries'
import { formatEth } from '@/lib/decimal'
import { errorMessage } from '@/lib/api'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
export function CartPage() {
  const { data: user } = useSession()
  const query = useQuery(cartOptions(user?.id))
  const mutation = useCartMutation(user?.id)
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">SUA COLEÇÃO COMEÇA AQUI</span>
        <h1>
          Meu carrinho<span>.</span>
        </h1>
        <p>Revise suas descobertas antes de continuar.</p>
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
                  <strong>{formatEth(item.nft.price)}</strong>
                  {item.quantity > item.nft.stock && (
                    <p className="field-error">
                      Disponibilidade alterada: {item.nft.stock} edições.
                    </p>
                  )}
                </div>
                <label className="quantity">
                  <span>Quantidade</span>
                  <select
                    aria-label={`Quantidade de ${item.nft.name}`}
                    value={item.quantity}
                    disabled={mutation.isPending}
                    onChange={(e) =>
                      mutation.mutate(
                        { id: item.nft.id, quantity: Number(e.target.value) },
                        {
                          onError: (error) => toast.error(errorMessage(error)),
                        },
                      )
                    }
                  >
                    {Array.from(
                      {
                        length: Math.max(
                          item.quantity,
                          Math.min(10, item.nft.stock),
                        ),
                      },
                      (_, i) => (
                        <option key={i + 1}>{i + 1}</option>
                      ),
                    )}
                  </select>
                </label>
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
            <span className="eyebrow">PRÓXIMO PASSO</span>
            <h2>Quase na sua coleção.</h2>
            <p>
              O total, as taxas e os cupons serão calculados na revisão do
              pagamento.
            </p>
            <p>
              {query.data.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
              edições selecionadas
            </p>
            <Link className="button primary wide" to="/checkout">
              Revisar pagamento <ArrowRight size={17} />
            </Link>
            <Link className="text-link" to="/">
              Continuar explorando
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}
