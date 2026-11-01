import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/profile/page'
export const Route = createFileRoute('/_private/profile')({
  component: ProfilePage,
})
