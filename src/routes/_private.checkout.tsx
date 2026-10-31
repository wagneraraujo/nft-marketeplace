import { createFileRoute } from '@tanstack/react-router'
import { CheckoutPage } from '@/features/checkout/page'
export const Route = createFileRoute('/_private/checkout')({
  component: CheckoutPage,
})
