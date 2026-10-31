import type { Nft, User, Wallet } from '@/contracts'
export const seedUsers: User[] = [
  { id: 'user-1', name: 'Alex Morgan', email: 'alex@example.com', avatar: '' },
  { id: 'user-2', name: 'Sam Rivera', email: 'sam@example.com', avatar: '' },
]
const titles = [
  'Orbital dream',
  'Liquid memory',
  'Silent planet',
  'Electric bloom',
  'Parallel self',
  'Solar archive',
]
const categories = ['Arte', 'Fotografia', 'Colecionáveis']
export const seedNfts: Nft[] = Array.from({ length: 36 }, (_, i) => ({
  id: `nft-${i + 1}`,
  name: `${titles[i % titles.length]} #${String(i + 1).padStart(3, '0')}`,
  collection: ['Otherworld', 'Chromatic studies', 'Digital nature'][i % 3],
  creator: ['Luna Studio', 'Noah Kim', 'Maya Chen'][i % 3],
  category: categories[i % 3],
  rarity: ['Comum', 'Raro', 'Épico'][i % 3],
  price: ['0.12', '0.25', '0.48', '0.75', '1.2', '2.4'][i % 6],
  stock: i === 35 ? 0 : 5 + (i % 8),
  version: 1,
  image: `/art/art-${(i % 6) + 1}.svg`,
  description:
    'Uma edição digital que explora novas relações entre forma, luz e espaço. Parte de uma coleção independente de arte generativa.',
}))
export const seedWallets = (id: string): Wallet[] => [
  {
    id: `wallet-${id}`,
    label: 'Minha carteira',
    address: `0x${id === 'user-1' ? 'a' : 'b'}`.padEnd(42, '1'),
    primary: true,
  },
]
