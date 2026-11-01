import { Link, useNavigate } from '@tanstack/react-router'
import {
  UserRound,
  WalletCards,
  ShoppingBag,
  Heart,
  LogOut,
} from 'lucide-react'
import { logout } from '@/features/auth/session'
export function AccountSidebar() {
  const navigate = useNavigate()
  return (
    <nav className="account-sidebar" aria-label="Minha conta">
      <Link to="/profile">
        <UserRound />
        Meu perfil
      </Link>
      <Link to="/wallets">
        <WalletCards />
        Minhas carteiras
      </Link>
      <Link to="/orders">
        <ShoppingBag />
        Meus pedidos
      </Link>
      <Link to="/favorites">
        <Heart />
        Favoritos
      </Link>
      <button onClick={() => void logout().then(() => navigate({ to: '/' }))}>
        <LogOut />
        Sair
      </button>
    </nav>
  )
}
