import { artworkProps } from '@/lib/artwork'
import { catalogOptions } from './queries'
import { NftCard } from './card'
import { QuantityControl } from '@/components/design/quantity'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ChevronLeft, Heart, X } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { AssetIcon } from '@/components/design/asset-icon'
import {
  favoriteOptions,
  useFavoriteMutation,
} from '@/features/favorites/queries'
import { NftTabs } from './nft-tabs'
import { nftOptions, reviewsOptions } from './queries'
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
  const favorites = useQuery(favoriteOptions(user?.id))
  const favorite = useFavoriteMutation(user?.id)
  const reviews = useQuery(reviewsOptions(id))
  const [tab, setTab] = useState('details')
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
            <div className="detail-art-frame">
              <div className="detail-loading-art" />
            </div>
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
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/">Mercado</Link>
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
          <div className="detail-art-frame">
            <img
              className="detail-art"
              {...artworkProps(
                nft.image,
                '(max-width: 700px) calc(100vw - 56px), (max-width: 1100px) 45vw, 404px',
              )}
              alt={nft.name}
              width={404}
              height={404}
              fetchPriority="high"
            />
            <Dialog.Root>
              <Dialog.Trigger className="detail-zoom" aria-label="Ampliar obra">
                <AssetIcon src="/figma/9ae7b.svg" />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="art-zoom-backdrop" />
                <Dialog.Popup className="art-zoom-dialog">
                  <Dialog.Title className="sr-only">{nft.name}</Dialog.Title>
                  <img
                    {...artworkProps(nft.image, '90vw')}
                    alt={nft.name}
                    width={960}
                    height={960}
                  />
                  <Dialog.Close
                    className="art-zoom-close"
                    aria-label="Fechar ampliação"
                  >
                    <X />
                  </Dialog.Close>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
        <section className="detail-copy">
          <h1>{nft.name}</h1>
          <div className="detail-price-row">
            <strong className="detail-price">{formatEth(nft.price)}</strong>
            <a
              href="#nft-tabs"
              className="detail-rating"
              onClick={() => setTab('reviews')}
            >
              <span className="detail-stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((star) => (
                  <AssetIcon
                    key={star}
                    src={star === 4 ? '/figma/89357.svg' : '/figma/19a5f.svg'}
                  />
                ))}
              </span>
              {reviews.data
                ? `${reviews.data.total} avaliações de colecionadores`
                : 'Avaliações de colecionadores'}
              <span className="detail-mobile-rating" aria-hidden="true">
                ★ {reviews.data?.average.toFixed(1)}({reviews.data?.total})
              </span>
            </a>
          </div>
          <div className="detail-about">
            <h2>Sobre este NFT:</h2>
            <p>{nft.description}</p>
          </div>
          <div className="detail-editions">
            <h2>Edição:</h2>
            <div
              aria-label={`Edição ${nft.presentation?.edition ?? 'limitada'}`}
            >
              {['1/1', '1/10', '1/50', 'ABERTA'].map((edition, index) => (
                <span
                  key={edition}
                  className={
                    edition === nft.presentation?.edition ? 'is-current' : ''
                  }
                >
                  <AssetIcon
                    src={
                      [
                        '/figma/091e2.svg',
                        '/figma/a9dab.svg',
                        '/figma/c4842.svg',
                        '/figma/6605d.svg',
                      ][index]
                    }
                  />
                  <span>{edition}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="purchase-box">
            <strong className="purchase-mobile-price">
              {formatEth(nft.price)}
            </strong>
            <label className="field">
              <span className="detail-quantity-caption">Qtd.</span>
              <QuantityControl
                value={quantity}
                max={Math.min(10, nft.stock)}
                onChange={setQuantity}
                label={nft.name}
                detail
              />
            </label>
            <Button
              className="detail-buy"
              aria-label={
                nft.stock
                  ? 'Comprar NFT: adicionar ao carrinho'
                  : 'Edição esgotada'
              }
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
              {mutation.isPending ? (
                'Adicionando…'
              ) : nft.stock ? (
                <>
                  <span className="detail-buy-desktop">COMPRAR</span>
                  <span className="detail-buy-mobile">Comprar NFT</span>
                </>
              ) : (
                'Edição esgotada'
              )}
            </Button>
            {user ? (
              <Button
                variant="outline"
                className="detail-favorite"
                aria-pressed={favorites.data?.includes(id) ?? false}
                disabled={favorite.isPending}
                onClick={() =>
                  favorite.mutate(
                    { id, active: !favorites.data?.includes(id) },
                    { onError: (error) => toast.error(errorMessage(error)) },
                  )
                }
              >
                {favorites.data?.includes(id) ? (
                  <Heart size={20} fill="currentColor" />
                ) : (
                  <AssetIcon src="/figma/d427d.svg" />
                )}
                {favorites.data?.includes(id) ? 'Favoritado' : 'Favoritar'}
              </Button>
            ) : (
              <Link
                className="button detail-favorite"
                to="/login"
                search={{ redirect: `/nfts/${id}` }}
              >
                <AssetIcon src="/figma/d427d.svg" />
                Favoritar
              </Link>
            )}
            <Link
              className="detail-mobile-cart"
              to="/cart"
              aria-label="Ver carrinho"
            >
              <AssetIcon src="/figma/3c537.svg" />
            </Link>
          </div>
          {mutation.isSuccess && (
            <Link className="text-link detail-cart-next" to="/cart">
              Ver carrinho →
            </Link>
          )}
          <dl className="detail-metadata">
            <div>
              <dt>ID do token:</dt>
              <dd>{nft.presentation?.tokenId ?? nft.id}</dd>
            </div>
            <div>
              <dt>Coleção:</dt>
              <dd>{nft.collection}</dd>
            </div>
            <div>
              <dt>Atributos:</dt>
              <dd>{nft.presentation?.attributes.join(', ') ?? nft.rarity}</dd>
            </div>
          </dl>
          <div className="detail-share">
            <strong>Compartilhar este NFT:</strong>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no LinkedIn"
            >
              <AssetIcon src="/figma/a4abe.svg" />
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(location.href)}`}
              aria-label="Compartilhar por e-mail"
            >
              <AssetIcon src="/figma/bec29.svg" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no X"
            >
              <AssetIcon src="/figma/fbcbd.svg" />
            </a>
          </div>
        </section>
      </div>
      <NftTabs nft={nft} reviews={reviews} value={tab} onChange={setTab} />
      <section className="related">
        <h2>Mais desta coleção</h2>
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
