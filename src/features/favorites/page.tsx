import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useSession } from '@/features/auth/use-session'
import { favoriteOptions } from './queries'
import { nftOptions } from '@/features/catalog/queries'
import { NftCard } from '@/features/catalog/card'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
function FavoriteCard({ id }: { id: string }) {
  const query = useQuery(nftOptions(id))
  return query.data ? (
    <NftCard nft={query.data} />
  ) : query.error ? (
    <ErrorState error={query.error} />
  ) : (
    <Loading />
  )
}
export function FavoritesPage() {
  const { data: user } = useSession()
  const query = useQuery(favoriteOptions(user?.id))
  return (
    <main className="page">
      <div className="page-heading">
        <h1>
          Seus favoritos<span>.</span>
        </h1>
        <p>As obras que merecem um segundo olhar.</p>
      </div>
      {query.isPending ? (
        <Loading cards />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : !query.data?.length ? (
        <Empty>
          <h2>Sua seleção começa aqui</h2>
          <Link to="/">Explore e salve suas obras favoritas</Link>
        </Empty>
      ) : (
        <div className="nft-grid">
          {query.data.map((id) => (
            <FavoriteCard key={id} id={id} />
          ))}
        </div>
      )}
    </main>
  )
}
