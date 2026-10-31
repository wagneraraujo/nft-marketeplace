import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { searchSchema, type CatalogSearch } from '@/contracts'
import { CatalogPage } from '@/features/catalog/page'
export const Route = createFileRoute('/')({
  validateSearch: (input: Partial<CatalogSearch> & SearchSchemaInput) =>
    searchSchema.parse(input),
  component: Page,
  head: () => ({
    meta: [
      { title: 'Explore arte digital | NFT Marketplace' },
      {
        name: 'description',
        content:
          'Explore coleções independentes de arte digital e encontre seu próximo NFT.',
      },
    ],
  }),
})
function Page() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <CatalogPage
      search={search}
      onSearch={(value) => void navigate({ search: value, resetScroll: false })}
    />
  )
}
