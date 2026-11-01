import { AssetIcon } from '@/components/design/asset-icon'
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { Heart, LogOut, LogIn, ScanLine } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/features/auth/use-session'
import { logout } from '@/features/auth/session'
import { cartOptions } from '@/features/cart/queries'
import { Button } from '@/components/ui/button'
import { SessionLifecycle } from '@/app/session-lifecycle'
import { catalogCategories } from '@/contracts'
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
        {[
          [
            'W',
            'Segurança da carteira',
            'Proteja sua carteira e colecione arte digital com confiança.',
          ],
          [
            'C',
            'Criadores em destaque',
            'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
          ],
          [
            'D',
            'Alertas de lançamentos',
            'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
          ],
        ].map(([icon, title, copy]) => (
          <div key={title}>
            <span className="service-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
        <div className="footer-newsletter">
          <h3>Antecipe-se ao próximo lançamento</h3>
          <div className="newsletter-field">
            <input
              type="email"
              aria-label="E-mail para novidades"
              placeholder="digite seu e-mail..."
              disabled
            />
            <button
              type="button"
              disabled
              title="Newsletter indisponível nesta demonstração"
            >
              Enviar
            </button>
          </div>
          <p>
            Receba lançamentos selecionados, histórias de criadores e novidades
            do mercado.
          </p>
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
          <Link to="/orders">Minha coleção</Link>
          <button
            type="button"
            disabled
            title="Atividade indisponível nesta demonstração"
          >
            Atividade
          </button>
          <button
            type="button"
            disabled
            title="Estúdio indisponível nesta demonstração"
          >
            Estúdio do criador
          </button>
          <Link to="/favorites">Lista de interesse</Link>
        </div>
        <div>
          <h3>Central de ajuda</h3>
          {[
            'Central de ajuda',
            'Como comprar NFTs',
            'Carteira e segurança',
            'Política do mercado',
            'Denunciar item',
          ].map((label) => (
            <button
              key={label}
              type="button"
              disabled
              title="Conteúdo indisponível nesta demonstração"
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          <h3>Coleções</h3>
          {catalogCategories
            .filter(({ value }) =>
              ['Arte', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'].includes(
                value,
              ),
            )
            .map(({ value, label }) => (
              <Link key={value} to="/" search={{ category: value, page: 1 }}>
                {label}
              </Link>
            ))}
        </div>
        <div className="footer-community">
          <div>
            <h3>Redes sociais</h3>
            <div className="footer-social">
              {[
                ['Facebook', '/figma/99280.svg'],
                ['Instagram', '/figma/d48dd.svg'],
                ['X', '/figma/b4111.svg'],
                ['LinkedIn', '/figma/b8b84.svg'],
                ['YouTube', '/figma/ca2da.svg'],
              ].map(([label, src]) => (
                <button
                  type="button"
                  key={label}
                  disabled
                  aria-label={`${label}: perfil indisponível nesta demonstração`}
                  title={`${label}: perfil não configurado`}
                >
                  <AssetIcon src={src} />
                </button>
              ))}
            </div>
          </div>
          <div className="footer-wallets">
            <h3>Carteiras compatíveis</h3>
            <span>METAMASK · WALLETCONNECT · COINBASE</span>
          </div>
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
            {count > 0 && <span className="cart-count">{count}</span>}
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
