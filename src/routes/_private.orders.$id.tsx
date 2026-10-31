import { createFileRoute } from '@tanstack/react-router'
import { OrderPage } from '@/features/orders/page'
export const Route = createFileRoute('/_private/orders/$id')({
  component: Page,
})
function Page() {
  return <OrderPage id={Route.useParams().id} />
}
