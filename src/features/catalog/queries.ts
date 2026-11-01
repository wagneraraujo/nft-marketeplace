import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Catalog, CatalogSearch, Nft, NftReviews } from '@/contracts'
export const catalogOptions = (search: CatalogSearch) =>
  queryOptions({
    queryKey: ['catalog', search],
    queryFn: async ({ signal }) =>
      (await api.get<Catalog>('/nfts', { params: search, signal })).data,
    placeholderData: keepPreviousData,
  })
export const nftOptions = (id: string) =>
  queryOptions({
    queryKey: ['nft', id],
    queryFn: async ({ signal }) =>
      (await api.get<Nft>(`/nfts/${id}`, { signal })).data,
  })
export const reviewsOptions = (id: string) =>
  queryOptions({
    queryKey: ['nft-reviews', id],
    queryFn: async ({ signal }) =>
      (await api.get<NftReviews>(`/nfts/${id}/reviews`, { signal })).data,
  })
