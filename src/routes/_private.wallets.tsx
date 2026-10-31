import { createFileRoute } from '@tanstack/react-router'
import { WalletsPage } from '@/features/wallets/page'
export const Route = createFileRoute('/_private/wallets')({
  component: WalletsPage,
})
