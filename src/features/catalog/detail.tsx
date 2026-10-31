import { artworkProps } from '@/lib/artwork'
import { catalogOptions } from './queries'
import { NftCard } from './card'
import { QuantityControl } from '@/components/design/quantity'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ShieldCheck, ArrowUpRight, ChevronLeft, Heart } from 'lucide-react'
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
  const [activeImage, setActiveImage] = useState(0)
  const related = useQuery(
    catalogOptions({
      q: '',
      category: '',
      rarity: '',
      sort: 'newest',
      page: 1,
    }),
  )
  if (query.isPending)
    return (
      <main
        className="page detail-loading-page"
        role="status"
        aria-label="Carregando obra"
      >
        <div className="breadcrumbs" aria-hidden="true">
          Carregando obra…
        </div>
        <div className="detail-grid" aria-hidden="true">
          <div className="detail-mobile-back">
            <span />
            <span />
          </div>
          <div className="detail-gallery">
            <div className="detail-thumbnails" />
            <div className="detail-loading-art" />
          </div>
          <section className="detail-copy detail-loading-copy">
            <div className="skeleton">
              <div />
              <span />
              <span />
            </div>
          </section>
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
        <div className="detail-mobile-back">
          <Link to="/" aria-label="Voltar ao catálogo">
            <ChevronLeft size={20} />
          </Link>
          <Link to="/favorites" aria-label="Favoritos">
            <Heart size={19} />
          </Link>
        </div>
        <div className="detail-gallery">
          <div className="detail-thumbnails">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                aria-label={`Visualizar miniatura ${index + 1} de ${nft.name}`}
                aria-pressed={activeImage === index}
                onClick={() => setActiveImage(index)}
              >
                <img
                  {...artworkProps(nft.image, '100px')}
                  alt=""
                  width={100}
                  height={100}
                />
              </button>
            ))}
          </div>
          <img
            className="detail-art"
            {...artworkProps(
              nft.image,
              '(max-width: 700px) calc(100vw - 56px), (max-width: 1100px) 45vw, 444px',
            )}
            alt={nft.name}
            width={444}
            height={444}
            fetchPriority="high"
          />
        </div>
        <section className="detail-copy">
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
              <QuantityControl
                value={quantity}
                max={Math.min(10, nft.stock)}
                onChange={setQuantity}
                label={nft.name}
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
      <section className="detail-description">
        <h2>Descrição do NFT</h2>
        <p>{nft.description}</p>
        <p>
          A coleção {nft.collection} reúne personagens com identidade própria e
          atributos selecionados por {nft.creator}. Consulte a disponibilidade e
          revise a cotação antes de concluir sua compra.
        </p>
        <p>
          ID do token: {nft.id} · Categoria: {nft.category} · Raridade:{' '}
          {nft.rarity}
        </p>
      </section>
      <section className="related">
        <h2>Você também pode gostar</h2>
        <div className="nft-grid">
          {related.data?.items
            .filter((item) => item.id !== id)
            .slice(0, 5)
            .map((item) => (
              <NftCard nft={item} key={item.id} />
            ))}
        </div>
      </section>
    </main>
  )
}
