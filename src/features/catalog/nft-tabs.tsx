import { Tabs } from '@base-ui/react/tabs'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Nft, NftReviews } from '@/contracts'
import { ErrorState } from '@/components/feedback/states'

export function NftTabs({
  nft,
  reviews,
  value,
  onChange,
}: {
  nft: Nft
  reviews: UseQueryResult<NftReviews, Error>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Tabs.Root
      id="nft-tabs"
      className="nft-tabs"
      value={value}
      onValueChange={(next) => onChange(String(next))}
    >
      <Tabs.List className="nft-tab-list" aria-label="Informações do NFT">
        <Tabs.Tab value="details">Detalhes do NFT</Tabs.Tab>
        <Tabs.Tab value="reviews">
          Avaliações de colecionadores
          {reviews.data ? ` (${reviews.data.total})` : ''}
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details" className="nft-tab-panel">
        <p>
          {nft.name} · {nft.presentation?.edition}.{' '}
          {nft.presentation?.paragraphs[0] ?? nft.description}
        </p>
        <p>{nft.presentation?.paragraphs[1]}</p>
        <dl>
          <dt>Rede:</dt>
          <dd>{nft.presentation?.network}</dd>
          <dt>Contrato:</dt>
          <dd>{nft.presentation?.contract}</dd>
          <dt>Direitos autorais:</dt>
          <dd>{nft.presentation?.royalties}</dd>
        </dl>
      </Tabs.Panel>
      <Tabs.Panel value="reviews" className="nft-tab-panel">
        {reviews.isPending ? (
          <p role="status">Carregando avaliações…</p>
        ) : reviews.error ? (
          <ErrorState
            error={reviews.error}
            retry={() => void reviews.refetch()}
          />
        ) : (
          <>
            <p>
              Avaliações demonstrativas ·{' '}
              {reviews.data.average.toFixed(1).replace('.', ',')} de 5
            </p>
            <ul className="nft-reviews">
              {reviews.data.items.map((review) => (
                <li key={review.id}>
                  <strong>{review.author}</strong>
                  <span aria-label={`${review.rating} de 5 estrelas`}>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                  <p>{review.comment}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Tabs.Panel>
    </Tabs.Root>
  )
}
