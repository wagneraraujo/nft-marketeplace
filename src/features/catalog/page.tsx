import { artworkProps } from '@/lib/artwork'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react'
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
  const [filters, setFilters] = useState(false)
  return (
    <main className="page catalog-page">
      <div className="mobile-search">
        <label className="search-field">
          <Search size={21} />
          <input
            aria-label="Buscar NFTs"
            placeholder="Explorar coleções"
            value={search.q}
            onChange={(e) =>
              onSearch({ ...search, q: e.target.value, page: 1 })
            }
          />
        </label>
        <button
          className="filter-toggle"
          aria-label="Mostrar filtros"
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal />
        </button>
      </div>
      <section className="hero-market">
        <div className="hero-copy">
          <span className="hero-welcome">Bem-vindo à Kurio</span>
          <h1>
            <span className="desktop-hero-title">
              SEJA DONO DO FUTURO
              <br />
              DA ARTE DIGITAL
            </span>
            <span className="mobile-hero-title">
              SEJA DONO DA
              <br />
              CULTURA DIGITAL
            </span>
          </h1>
          <p>
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e torne-se parte da
            cultura do amanhã.
          </p>
          <p className="mobile-hero-description">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <a className="button primary" href="#catalog">
            EXPLORAR <ArrowRight size={17} />
          </a>
        </div>
        <img
          className="hero-ape"
          {...artworkProps(
            '/figma/8f387.png',
            '(max-width: 700px) 138px, (max-width: 1100px) 45vw, 450px',
          )}
          alt="Emerald Ape, destaque da coleção Kurio"
          width={450}
          height={450}
          fetchPriority="high"
        />
        <img
          className="hero-mini-ape"
          {...artworkProps('/figma/83794.png', '58px')}
          alt=""
          width={58}
          height={58}
        />
        <span className="hero-dots" aria-hidden="true">
          •••
        </span>
      </section>
      <section
        id="catalog"
        className="catalog-section"
        aria-labelledby="catalog-title"
      >
        <h2 id="catalog-title" className="sr-only">
          Coleções de NFTs
        </h2>
        <aside className={`catalog-sidebar ${filters ? 'is-open' : ''}`}>
          <div className="filter-group">
            <h2>Coleções</h2>
            {[
              ['', 'Todas as coleções'],
              ['Arte', 'Arte digital'],
              ['Fotografia', 'Fotografia'],
              ['Colecionáveis', 'Colecionáveis'],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={search.category === value}
                onClick={() =>
                  onSearch({ ...search, category: value, page: 1 })
                }
              >
                {label}
                <span>{value ? '12' : '36'}</span>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h2>Raridade</h2>
            {['', 'Comum', 'Raro', 'Épico'].map((value) => (
              <button
                key={value}
                aria-pressed={search.rarity === value}
                onClick={() => onSearch({ ...search, rarity: value, page: 1 })}
              >
                {value || 'Todas as raridades'}
              </button>
            ))}
          </div>
          <label className="search-field desktop-search">
            <Search size={16} />
            <input
              aria-label="Buscar NFTs"
              value={search.q}
              placeholder="Buscar coleção"
              onChange={(e) =>
                onSearch({ ...search, q: e.target.value, page: 1 })
              }
            />
          </label>
          <div className="featured-nft">
            <h3>NFT EM DESTAQUE</h3>
            <strong>OFERTA LIMITADA</strong>
            <Link to="/nfts/$id" params={{ id: 'nft-2' }}>
              <img
                {...artworkProps(
                  '/figma/83794.png',
                  '(max-width: 1100px) 210px, 310px',
                )}
                alt="Sage Nomad #009"
                width={310}
                height={310}
              />
            </Link>
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <div className="category-tabs">
              <button
                aria-pressed={search.sort === 'newest'}
                onClick={() => onSearch({ ...search, sort: 'newest', page: 1 })}
              >
                Todos os NFTs
              </button>
              <button
                aria-pressed={search.sort === 'price-desc'}
                onClick={() =>
                  onSearch({ ...search, sort: 'price-desc', page: 1 })
                }
              >
                Em alta
              </button>
            </div>
            <label className="catalog-sort">
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
                <option value="newest">
                  Ordenar por: Lançados recentemente
                </option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>
          <div className="results-line sr-only" aria-live="polite">
            {result.data?.total ?? '…'} obras para descobrir
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
              <button
                aria-label="Anterior"
                disabled={search.page <= 1 || result.isPlaceholderData}
                onClick={() => onSearch({ ...search, page: search.page - 1 })}
              >
                ‹
              </button>
              {Array.from({ length: result.data.pages }, (_, i) => (
                <button
                  key={i}
                  aria-label={`Página ${i + 1}`}
                  aria-current={search.page === i + 1 ? 'page' : undefined}
                  disabled={result.isPlaceholderData}
                  onClick={() => onSearch({ ...search, page: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
              <button
                aria-label="Próxima"
                disabled={
                  search.page >= result.data.pages || result.isPlaceholderData
                }
                onClick={() => onSearch({ ...search, page: search.page + 1 })}
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </section>
      <section className="promotions">
        <div>
          <img
            {...artworkProps('/figma/8f387.png', '285px')}
            alt=""
            width={285}
            height={250}
          />
          <div>
            <h2>
              Lançamentos gênesis
              <br />
              de edição limitada
            </h2>
            <p>
              Colecione criações únicas
              <br />
              de artistas em ascensão.
            </p>
            <a className="button primary" href="#catalog">
              Explorar →
            </a>
          </div>
        </div>
        <div>
          <img
            {...artworkProps('/figma/9add2.png', '285px')}
            alt=""
            width={285}
            height={250}
          />
          <div>
            <h2>
              Arte digital selecionada
              <br />e muito mais
            </h2>
            <p>
              Explore novos artistas,
              <br />
              coleções verificadas e uma
              <br />
              cultura que se transforma.
            </p>
            <a className="button primary" href="#catalog">
              Explorar →
            </a>
          </div>
        </div>
      </section>
      <section className="editorial">
        <h2>Diário da Cunhagem</h2>
        <p>
          Histórias, guias e inspiração para colecionadores novos e veteranos da
          propriedade digital.
        </p>
        <div className="editorial-grid">
          {[
            ['9add2.png', 'Como funciona a propriedade de NFTs'],
            ['8f387.png', '10 artistas digitais para acompanhar'],
            ['83794.png', 'Raridade, atributos e procedência'],
            ['b7cfc.png', 'Como proteger sua carteira'],
          ].map(([image, title], i) => (
            <article key={title}>
              <img
                {...artworkProps(
                  `/figma/${image}`,
                  '(max-width: 1100px) 45vw, 268px',
                )}
                alt=""
                width={268}
                height={200}
                loading="lazy"
              />
              <div>
                <h3>{title}</h3>
                <p>Descubra a coleção Kurio e encontre sua próxima obra.</p>
                <Link to="/nfts/$id" params={{ id: `nft-${i + 1}` }}>
                  Ver coleção →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
