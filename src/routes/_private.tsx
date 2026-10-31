import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { requireSession } from '@/features/auth/session'
export const Route = createFileRoute('/_private')({
  beforeLoad: async ({ location }) => {
    if (!(await requireSession()))
      throw redirect({ to: '/login', search: { redirect: location.href } })
  },
  component: Outlet,
})
