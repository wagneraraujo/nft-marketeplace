import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { ShoppingBag, Heart, ArrowUpRight, Hexagon, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth/use-session'
import { logout } from '@/features/auth/session'
import { cartOptions } from '@/features/cart/queries'
import { Button } from '@/components/ui/button'
import { SessionLifecycle } from '@/app/session-lifecycle'
export function Shell() {
  const { data: user } = useSession()
  const { data: cart } = useQuery(cartOptions(user?.id))
  const navigate = useNavigate()
  return (
    <>
      <SessionLifecycle />
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <div className="announcement">
        Um novo olhar para a arte digital <ArrowUpRight size={13} />
      </div>
      <header className="site-header">
        <Link to="/" className="brand">
          <Hexagon size={30} strokeWidth={2.5} /> nft<span>market.</span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link to="/" activeOptions={{ exact: true }}>
            Explorar
          </Link>
          <Link to="/favorites">
            <Heart size={17} /> Favoritos
          </Link>
          <Link to="/orders">Pedidos</Link>
        </nav>
        <div className="header-actions">
          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Carrinho, ${cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0} itens`}
          >
            <ShoppingBag size={20} />
            <span>
              {cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0}
            </span>
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="avatar" title="Meu perfil">
                {user.name.slice(0, 1)}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                onClick={() => {
                  void logout().then(() => navigate({ to: '/' }))
                }}
              >
                <LogOut size={17} />
              </Button>
            </>
          ) : (
            <Link
              className="button primary"
              to="/login"
              search={{ redirect: '/' }}
            >
              Entrar <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </header>
      <div id="main" tabIndex={-1}>
        <Outlet />
      </div>
      <footer>
        <Link to="/" className="brand">
          <Hexagon size={24} /> nftmarket.
        </Link>
        <p>Arte independente. Novas possibilidades.</p>
        <small>Marketplace demonstrativo · Nenhuma transação real</small>
      </footer>
    </>
  )
}
