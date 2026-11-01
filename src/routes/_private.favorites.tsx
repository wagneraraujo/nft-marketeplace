import { createFileRoute } from '@tanstack/react-router'
import { FavoritesPage } from '@/features/favorites/page'
export const Route = createFileRoute('/_private/favorites')({
  component: FavoritesPage,
})
