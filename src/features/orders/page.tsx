import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useSession } from '@/features/auth/use-session'
import { orderOptions, ordersOptions } from './queries'
import { attemptStore } from '@/features/checkout/api'
import { formatEth } from '@/lib/decimal'
import { queryClient } from '@/lib/query-client'
import { Loading, ErrorState, Empty } from '@/components/feedback/states'
export function OrderPage({ id }: { id: string }) {
  const { data: user } = useSession()
  const query = useQuery(orderOptions(user?.id, id))
  const order = query.data
  useEffect(() => {
    if (user && order && order.status !== 'pending') {
      const attempt = attemptStore.get(user.id)
      if (attempt?.orderId === id) attemptStore.clear(user.id)
      void queryClient.invalidateQueries({ queryKey: ['cart', user.id] })
    }
  }, [id, order, user])
  if (query.isPending)
    return (
      <main className="page">
        <Loading />
      </main>
    )
  if (query.error)
    return (
      <main className="page">
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      </main>
    )
  if (!order) return null
  return (
    <main className="page receipt">
      <div className={`order-status ${order.status}`} role="status">
        {order.status === 'confirmed' ? (
          <CheckCircle2 size={52} />
        ) : order.status === 'declined' ? (
          <XCircle size={52} />
        ) : (
          <Clock3 size={52} />
        )}
        <span className="eyebrow">PEDIDO {order.id.slice(0, 8)}</span>
        <h1>
          {order.status === 'confirmed'
            ? 'A obra agora faz parte da sua coleção.'
            : order.status === 'declined'
              ? 'Pagamento não aprovado.'
              : 'Estamos acompanhando seu pedido.'}
        </h1>
        <p>
          {order.status === 'confirmed'
            ? 'Compra confirmada. Guarde os detalhes abaixo.'
            : order.status === 'declined'
              ? 'Seus itens continuam no carrinho. Revise os dados e tente novamente.'
              : 'Você pode atualizar a página. Sua compra será recuperada sem gerar outro pedido.'}
        </p>
      </div>
      <section className="panel">
        <h2>
          {order.status === 'confirmed'
            ? 'Recibo da compra'
            : 'Detalhes do pedido'}
        </h2>
        {order.quote.items.map((item) => (
          <div className="checkout-item" key={item.nft.id}>
            <img
              src={item.nft.image}
              alt={item.nft.name}
              width={64}
              height={64}
            />
            <div>
              <strong>{item.nft.name}</strong>
              <p>
                {item.quantity} × {formatEth(item.nft.price)}
              </p>
            </div>
          </div>
        ))}
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatEth(order.quote.subtotal)}</dd>
          </div>
          <div>
            <dt>Desconto</dt>
            <dd>{formatEth(order.quote.discount)}</dd>
          </div>
          <div>
            <dt>Taxas</dt>
            <dd>{formatEth(order.quote.fee)}</dd>
          </div>
          <div className="total">
            <dt>Total</dt>
            <dd>{formatEth(order.quote.total)}</dd>
          </div>
        </dl>
        {order.txHash && (
          <p className="hash">
            Transação simulada
            <br />
            {order.txHash}
          </p>
        )}
        <p>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
      </section>
      <Link
        className="button primary"
        to={order.status === 'declined' ? '/cart' : '/'}
      >
        {order.status === 'declined'
          ? 'Voltar ao carrinho'
          : 'Continuar explorando'}
      </Link>
    </main>
  )
}
export function OrdersPage() {
  const { data: user } = useSession()
  const query = useQuery(ordersOptions(user?.id))
  return (
    <main className="page">
      <div className="page-heading">
        <h1>
          Meus pedidos<span>.</span>
        </h1>
        <p>Acompanhe suas compras e consulte seus recibos.</p>
      </div>
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : !query.data?.length ? (
        <Empty>
          <h2>Você ainda não tem pedidos</h2>
          <Link to="/">Explorar NFTs</Link>
        </Empty>
      ) : (
        query.data.map((order) => (
          <Link
            key={order.id}
            className="order-row"
            to="/orders/$id"
            params={{ id: order.id }}
          >
            <span>Pedido {order.id.slice(0, 8)}</span>
            <span>
              {order.status === 'confirmed'
                ? 'Confirmado'
                : order.status === 'declined'
                  ? 'Recusado'
                  : 'Pendente'}
            </span>
            <strong>{formatEth(order.quote.total)} →</strong>
          </Link>
        ))
      )}
    </main>
  )
}
