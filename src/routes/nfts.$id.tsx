import { createFileRoute } from '@tanstack/react-router'
import { NftDetail } from '@/features/catalog/detail'
export const Route = createFileRoute('/nfts/$id')({
  component: Page,
  head: () => ({
    meta: [
      { title: 'Detalhes da obra | NFT Marketplace' },
      {
        name: 'description',
        content:
          'Conheça a obra digital, sua coleção, preço e disponibilidade.',
      },
    ],
  }),
})
function Page() {
  const { id } = Route.useParams()
  return <NftDetail id={id} />
}
