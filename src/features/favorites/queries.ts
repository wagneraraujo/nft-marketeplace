import { queryOptions, useMutation } from '@tanstack/react-query'
import { sessionStore } from '@/lib/storage'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
export const favoriteOptions = (userId?: string) =>
  queryOptions({
    queryKey: ['favorites', userId],
    queryFn: async ({ signal }) =>
      (await api.get<string[]>('/favorites', { signal })).data,
    enabled: !!userId,
    staleTime: 10000,
  })
export function useFavoriteMutation(userId?: string) {
  const key = favoriteOptions(userId).queryKey
  return useMutation({
    mutationFn: async (input: { id: string; active: boolean }) =>
      (
        await api.put<string[]>(`/favorites/${input.id}`, {
          active: input.active,
        })
      ).data,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<string[]>(key)
      queryClient.setQueryData<string[]>(key, (old) =>
        input.active
          ? [...new Set([...(old ?? []), input.id])]
          : (old ?? []).filter((id) => id !== input.id),
      )
      return { previous, key, token: sessionStore.token() }
    },
    onError: (_error, _input, context) => {
      if (context && context.token === sessionStore.token())
        queryClient.setQueryData(context.key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
