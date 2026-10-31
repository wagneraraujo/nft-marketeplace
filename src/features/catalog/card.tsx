import { Link, useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Nft } from '@/contracts'
import { formatEth } from '@/lib/decimal'
import { errorMessage } from '@/lib/api'
import { useSession } from '@/features/auth/use-session'
import {
  favoriteOptions,
  useFavoriteMutation,
} from '@/features/favorites/queries'
export function NftCard({ nft }: { nft: Nft }) {
  const { data: user } = useSession()
  const favorites = useQuery(favoriteOptions(user?.id))
  const mutation = useFavoriteMutation(user?.id)
  const navigate = useNavigate()
  const active = favorites.data?.includes(nft.id) ?? false
  return (
    <article className="nft-card">
      <div className="art-wrap">
        <Link
          to="/nfts/$id"
          params={{ id: nft.id }}
          aria-label={`Ver ${nft.name}`}
        >
          <img
            src={nft.image}
            alt={nft.name}
            width={720}
            height={720}
            loading="lazy"
          />
        </Link>
        <span className="rarity">{nft.rarity}</span>
        <button
          type="button"
          className={`favorite ${active ? 'selected' : ''}`}
          aria-label={`${active ? 'Remover dos' : 'Adicionar aos'} favoritos: ${nft.name}`}
          aria-pressed={active}
          disabled={mutation.isPending}
          onClick={() => {
            if (!user) {
              void navigate({
                to: '/login',
                search: { redirect: location.pathname + location.search },
              })
              return
            }
            mutation.mutate(
              { id: nft.id, active: !active },
              { onError: (error) => toast.error(errorMessage(error)) },
            )
          }}
        >
          <Heart size={18} fill={active ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="nft-info">
        <h3>
          <Link to="/nfts/$id" params={{ id: nft.id }}>
            {nft.name}
          </Link>
        </h3>
        <p className="card-price">{formatEth(nft.price)}</p>
      </div>
    </article>
  )
}
