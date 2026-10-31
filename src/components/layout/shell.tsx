import { AssetIcon } from '@/components/design/asset-icon'
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import {
  Heart,
  LogOut,
  LogIn,
  ScanLine,
  ShieldCheck,
  Palette,
  Bell,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth/use-session'
import { logout } from '@/features/auth/session'
import { cartOptions } from '@/features/cart/queries'
import { Button } from '@/components/ui/button'
import { SessionLifecycle } from '@/app/session-lifecycle'
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Kurio, início">
      KURIO
    </Link>
  )
}
export function MarketplaceFooter() {
  return (
    <footer className="market-footer">
      <div className="footer-services">
        {(
          [
            [
              ShieldCheck,
              'Segurança da carteira',
              'Proteja seus ativos e descubra como evitar riscos.',
            ],
            [
              Palette,
              'Criadores em destaque',
              'Conheça artistas, coleções e comunidades que movem a cultura digital.',
            ],
            [
              Bell,
              'Alertas de lançamentos',
              'Novidades da comunidade e novas edições em destaque.',
            ],
          ] as const
        ).map(([Icon, title, copy]) => (
          <div key={title}>
            <span className="service-icon">
              <Icon size={26} />
            </span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
        <div>
          <h3>Antecipe-se ao próximo lançamento</h3>
          <p>Explore novas coleções e acompanhe seus favoritos.</p>
          <Link to="/favorites" className="text-link">
            Ver meus favoritos →
          </Link>
        </div>
      </div>
      <div className="footer-contact">
        <Brand />
        <span>
          Feito por colecionadores,
          <br />
          criadores e cultura
        </span>
        <span>contato@kurio.demo</span>
        <span>Marketplace demonstrativo</span>
      </div>
      <div className="footer-links">
        <div>
          <h3>Meu perfil</h3>
          <Link to="/profile">Meu perfil</Link>
          <Link to="/wallets">Minha carteira</Link>
          <Link to="/orders">Meus pedidos</Link>
        </div>
        <div>
          <h3>Central de ajuda</h3>
          <span>Explore, descubra, colecione.</span>
          <span>Todos os pagamentos são simulados.</span>
        </div>
        <div>
          <h3>Coleções</h3>
          <Link to="/">Arte digital</Link>
          <Link to="/">Fotografia</Link>
          <Link to="/">Colecionáveis</Link>
        </div>
        <div>
          <h3>Kurio</h3>
          <p>
            O futuro da cultura digital
            <br />
            começa com uma descoberta.
          </p>
        </div>
      </div>
      <small>© {new Date().getFullYear()} Kurio. Projeto demonstrativo.</small>
    </footer>
  )
}
export function Shell() {
  const { data: user } = useSession()
  const { data: cart } = useQuery(cartOptions(user?.id))
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const auth = ['/login', '/register'].includes(pathname)
  const account = ['/profile', '/wallets'].includes(pathname)
  const count = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  return (
    <div
      className={`app-shell ${auth ? 'auth-shell' : ''} ${account ? 'account-shell' : ''} ${pathname.startsWith('/nfts/') ? 'detail-shell' : ''} ${['/cart', '/checkout'].includes(pathname) ? 'transaction-shell' : ''}`}
    >
      <SessionLifecycle />
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegação principal">
          <Link to="/" activeOptions={{ exact: true }}>
            Início
          </Link>
          <a href="/#catalog">Mercado</a>
          <Link to="/favorites">Coleções</Link>
          <Link to="/orders">Pedidos</Link>
        </nav>
        <div className="header-actions">
          <Link to="/" aria-label="Pesquisar coleções">
            <AssetIcon src="/figma/bd8c9.svg" />
          </Link>
          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Carrinho, ${count} itens`}
          >
            <AssetIcon src="/figma/c0c08.svg" />
            {count > 0 && <span>{count}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="profile-link" title="Meu perfil">
                {user.name.slice(0, 1)}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                onClick={() => void logout().then(() => navigate({ to: '/' }))}
              >
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Link
              className="button primary login-link"
              aria-label="Entrar"
              to="/login"
              search={{ redirect: '/' }}
            >
              <LogIn size={16} /> Entrar
            </Link>
          )}
        </div>
      </header>
      <div id="main" tabIndex={-1}>
        <Outlet />
      </div>
      {!account && !auth && <MarketplaceFooter />}
      <nav className="mobile-nav" aria-label="Navegação móvel">
        <Link to="/" aria-label="Início">
          <AssetIcon src="/figma/b096d.svg" />
        </Link>
        <Link to="/favorites" aria-label="Favoritos">
          <Heart />
        </Link>
        <Link to="/" className="scan-link" aria-label="Explorar NFTs">
          <ScanLine size={30} />
        </Link>
        <Link to="/cart" aria-label={`Carrinho, ${count} itens`}>
          <AssetIcon src="/figma/352b3.svg" />
        </Link>
        <Link
          to="/profile"
          aria-label={user ? 'Meu perfil' : 'Entrar'}
          title={user ? 'Meu perfil' : undefined}
        >
          {user ? (
            <span>{user.name.slice(0, 1)}</span>
          ) : (
            <AssetIcon src="/figma/99dca.svg" />
          )}
        </Link>
      </nav>
    </div>
  )
}
