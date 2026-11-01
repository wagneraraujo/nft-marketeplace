import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/features/auth/form'
import { safeDestination } from '@/features/auth/redirect'
export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: safeDestination(s.redirect),
  }),
  component: Page,
})
function Page() {
  return <AuthForm mode="login" destination={Route.useSearch().redirect} />
}
