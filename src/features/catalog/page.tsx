import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import type { CatalogSearch } from '@/contracts'
import { catalogOptions } from './queries'
import { NftCard } from './card'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
export function CatalogPage({
  search,
  onSearch,
}: {
  search: CatalogSearch
  onSearch: (value: CatalogSearch) => void
}) {
  const result = useQuery(catalogOptions(search))
  return (
    <main className="page">
      <section className="hero-market">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="dot" /> CRIATIVIDADE SEM LIMITES
          </span>
          <h1>
            Arte que abre
            <br />
            novos <em>mundos.</em>
          </h1>
          <p>
            Descubra obras únicas, encontre seu próximo artista favorito e
            comece sua coleção digital.
          </p>
          <a className="button primary" href="#catalog">
            Explorar NFTs <ArrowUpRight size={18} />
          </a>
          <div className="hero-note">
            <span className="mini-orbs">
              <i />
              <i />
              <i />
            </span>
            <span>
              Um espaço para artistas
              <br />
              <strong>e novos colecionadores.</strong>
            </span>
          </div>
        </div>
        <div className="hero-art">
          <img
            src="/art/art-1.svg"
            alt="Composição abstrata orbital da coleção Otherworld"
            width="720"
            height="720"
            fetchPriority="high"
          />
          <div className="featured-caption">
            <div>
              <span>COLEÇÃO EM DESTAQUE</span>
              <strong>Otherworld</strong>
            </div>
            <ArrowUpRight size={27} />
          </div>
          <div className="art-stamp">
            ARTE
            <br />
            ALÉM DO
            <br />
            ÓBVIO ↗
          </div>
        </div>
      </section>
      <section id="catalog" className="catalog-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENCONTRE SUA PRÓXIMA DESCOBERTA</span>
            <h2>
              Explore o extraordinário<span>.</span>
            </h2>
          </div>
          <ArrowDown size={27} />
        </div>
        <div className="filter-bar">
          <div className="category-tabs" aria-label="Categorias">
            {['', 'Arte', 'Fotografia', 'Colecionáveis'].map((category) => (
              <button
                key={category}
                aria-pressed={search.category === category}
                onClick={() => onSearch({ ...search, category, page: 1 })}
              >
                {category || 'Todos os NFTs'}
              </button>
            ))}
          </div>
          <span className="filter-label">
            <SlidersHorizontal size={17} /> Filtros
          </span>
        </div>
        <div className="search-row">
          <label className="search-input">
            <Search size={18} />
            <span className="sr-only">Buscar NFTs</span>
            <input
              placeholder="Busque por obra, coleção ou artista"
              value={search.q}
              onChange={(e) =>
                onSearch({ ...search, q: e.target.value, page: 1 })
              }
            />
          </label>
          <label>
            <span className="sr-only">Raridade</span>
            <select
              value={search.rarity}
              onChange={(e) =>
                onSearch({ ...search, rarity: e.target.value, page: 1 })
              }
            >
              <option value="">Todas as raridades</option>
              <option>Comum</option>
              <option>Raro</option>
              <option>Épico</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Ordenação</span>
            <select
              value={search.sort}
              onChange={(e) =>
                onSearch({
                  ...search,
                  sort: e.target.value as CatalogSearch['sort'],
                  page: 1,
                })
              }
            >
              <option value="newest">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </label>
        </div>
        <div className="results-line" aria-live="polite">
          <span>{result.data?.total ?? '…'} obras para descobrir</span>
          {result.isFetching && !result.isPending && <span>Atualizando…</span>}
        </div>
        {result.isPending ? (
          <Loading cards />
        ) : result.error ? (
          <ErrorState
            error={result.error}
            retry={() => void result.refetch()}
          />
        ) : result.data.items.length ? (
          <div className="nft-grid">
            {result.data.items.map((nft) => (
              <NftCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <Empty>
            <h3>Nenhuma obra encontrada</h3>
            <p>Experimente outra busca ou remova os filtros.</p>
            <Button
              onClick={() =>
                onSearch({
                  q: '',
                  category: '',
                  rarity: '',
                  sort: 'newest',
                  page: 1,
                })
              }
            >
              Limpar filtros
            </Button>
          </Empty>
        )}
        {result.data && result.data.pages > 1 && (
          <nav className="pagination" aria-label="Paginação">
            <Button
              variant="outline"
              disabled={search.page <= 1 || result.isPlaceholderData}
              onClick={() => onSearch({ ...search, page: search.page - 1 })}
            >
              Anterior
            </Button>
            <span>
              Página {search.page} de {result.data.pages}
            </span>
            <Button
              variant="outline"
              disabled={
                search.page >= result.data.pages || result.isPlaceholderData
              }
              onClick={() => onSearch({ ...search, page: search.page + 1 })}
            >
              Próxima
            </Button>
          </nav>
        )}
      </section>
    </main>
  )
}
