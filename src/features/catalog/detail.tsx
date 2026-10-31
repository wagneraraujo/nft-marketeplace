import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShieldCheck, ArrowUpRight } from 'lucide-react'
import { nftOptions } from './queries'
import { useCartMutation } from '@/features/cart/queries'
import { useSession } from '@/features/auth/use-session'
import { formatEth } from '@/lib/decimal'
import { errorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/feedback/states'
export function NftDetail({ id }: { id: string }) {
  const query = useQuery(nftOptions(id))
  const { data: user } = useSession()
  const mutation = useCartMutation(user?.id)
  const [quantity, setQuantity] = useState(1)
  if (query.isPending)
    return (
      <main className="page" role="status" aria-label="Carregando obra">
        <div className="breadcrumbs" aria-hidden="true">
          Carregando obra…
        </div>
        <div className="detail-grid" aria-hidden="true">
          <div className="detail-loading-art" />
          <div className="detail-loading-copy">
            <div className="skeleton">
              <div />
              <span />
              <span />
            </div>
          </div>
        </div>
      </main>
    )
  if (query.error)
    return (
      <main className="page">
        <ErrorState error={query.error} retry={() => void query.refetch()} />
        <Link to="/">Voltar ao catálogo</Link>
      </main>
    )
  const nft = query.data
  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link to="/">Explorar</Link>
        <span>/</span>
        <span>{nft.collection}</span>
      </div>
      <div className="detail-grid">
        <img
          className="detail-art"
          src={nft.image}
          alt={nft.name}
          width={720}
          height={720}
          fetchPriority="high"
        />
        <section className="detail-copy">
          <span className="eyebrow">{nft.collection} ↗</span>
          <h1>{nft.name}</h1>
          <p className="muted">
            Criado por <strong>{nft.creator}</strong>
          </p>
          <p>{nft.description}</p>
          <div className="traits">
            <span>{nft.category}</span>
            <span>{nft.rarity}</span>
            <span>{nft.stock} edições disponíveis</span>
          </div>
          <div className="purchase-box">
            <small>Preço por edição</small>
            <h2>{formatEth(nft.price)}</h2>
            <label className="field">
              Quantidade
              <input
                type="number"
                min="1"
                max={Math.min(10, nft.stock)}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <Button
              className="wide"
              disabled={
                !nft.stock ||
                mutation.isPending ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > Math.min(10, nft.stock)
              }
              onClick={() =>
                mutation.mutate(
                  { id, quantity },
                  {
                    onSuccess: () =>
                      toast.success('NFT adicionado ao carrinho.'),
                    onError: (error) => toast.error(errorMessage(error)),
                  },
                )
              }
            >
              {mutation.isPending
                ? 'Adicionando…'
                : nft.stock
                  ? 'Adicionar ao carrinho'
                  : 'Edição esgotada'}
              <ArrowUpRight size={18} />
            </Button>
            {mutation.isSuccess && (
              <Link className="text-link" to="/cart">
                Ver carrinho →
              </Link>
            )}
          </div>
          <p className="trust">
            <ShieldCheck size={18} /> Valores e disponibilidade são revisados
            antes da compra.
          </p>
          {query.isFetching && (
            <p role="status">Atualizando disponibilidade…</p>
          )}
        </section>
      </div>
    </main>
  )
}
