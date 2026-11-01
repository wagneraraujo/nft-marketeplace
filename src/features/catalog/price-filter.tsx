import { useState } from 'react'
import type { CatalogSearch } from '@/contracts'
import { compare } from '@/lib/decimal'

export function PriceFilter({
  search,
  onSearch,
}: {
  search: CatalogSearch
  onSearch: (value: CatalogSearch) => void
}) {
  const [minimum, setMinimum] = useState(search.minPrice ?? '0.02')
  const [maximum, setMaximum] = useState(search.maxPrice ?? '12.30')
  return (
    <div className="filter-group price-filter">
      <h2>Faixa de preço</h2>
      <div className="price-range">
        <input
          type="range"
          aria-label="Preço mínimo em ETH"
          min="0.02"
          max="12.30"
          step="0.01"
          value={minimum}
          onChange={(event) =>
            setMinimum(
              compare(event.target.value, maximum) > 0
                ? maximum
                : event.target.value,
            )
          }
        />
        <input
          type="range"
          aria-label="Preço máximo em ETH"
          min="0.02"
          max="12.30"
          step="0.01"
          value={maximum}
          onChange={(event) =>
            setMaximum(
              compare(event.target.value, minimum) < 0
                ? minimum
                : event.target.value,
            )
          }
        />
      </div>
      <output className="price-output">
        Preço: {minimum.replace('.', ',')} – {maximum.replace('.', ',')} ETH
      </output>
      <button
        className="price-apply"
        onClick={() =>
          onSearch({ ...search, minPrice: minimum, maxPrice: maximum, page: 1 })
        }
      >
        Aplicar
      </button>
      {(search.minPrice || search.maxPrice) && (
        <button
          className="price-clear"
          onClick={() =>
            onSearch({
              ...search,
              minPrice: undefined,
              maxPrice: undefined,
              page: 1,
            })
          }
        >
          Limpar preço
        </button>
      )}
    </div>
  )
}
