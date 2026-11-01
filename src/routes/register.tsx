import { createFileRoute } from '@tanstack/react-router'
import { AuthForm } from '@/features/auth/form'
import { safeDestination } from '@/features/auth/redirect'
export const Route = createFileRoute('/register')({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: safeDestination(s.redirect),
  }),
  component: Page,
})
function Page() {
  return <AuthForm mode="register" destination={Route.useSearch().redirect} />
}
