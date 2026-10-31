import type { Nft, User, Wallet } from '@/contracts'
export const seedUsers: User[] = [
  { id: 'user-1', name: 'Alex Morgan', email: 'alex@example.com', avatar: '' },
  { id: 'user-2', name: 'Sam Rivera', email: 'sam@example.com', avatar: '' },
]
const titles = [
  'Emerald Ape #042',
  'Sage Nomad #009',
  'Neon Vessel #552',
  'Cosmic Bloom #118',
  'Violet Nomad #314',
  'Ivory Baron #088',
  'Golden Beat #207',
  'Golden Frequency #071',
  'Golden Signal #160',
]
const artworks = [
  '8f387.png',
  '83794.png',
  '9add2.png',
  '83794.png',
  '83794.png',
  '9add2.png',
  'b7cfc.png',
  'b7cfc.png',
  'b7cfc.png',
]
export const seedNfts: Nft[] = Array.from({ length: 36 }, (_, i) => ({
  id: `nft-${i + 1}`,
  name:
    i < 9
      ? titles[i]
      : `${titles[i % 9].split(' #')[0]} #${String(400 + i).padStart(3, '0')}`,
  collection: 'Kurio Apes',
  creator: 'Kurio Editions',
  category: ['Arte', 'Fotografia', 'Colecionáveis'][i % 3],
  rarity: ['Comum', 'Raro', 'Épico'][i % 3],
  price: [
    '1.19',
    '1.69',
    '1.99',
    '1.29',
    '1.39',
    '1.79',
    '0.99',
    '0.59',
    '0.39',
  ][i % 9],
  stock: i === 35 ? 0 : 5 + (i % 8),
  version: 1,
  image: `/figma/${artworks[i % 9]}`,
  description:
    'Um colecionável digital finalizado à mão da coleção Kurio Editions. Uma edição que explora identidade, cultura e novas formas de colecionar arte digital.',
}))
export const seedWallets = (id: string): Wallet[] => [
  {
    id: `wallet-${id}`,
    label: 'Minha carteira',
    address: `0x${id === 'user-1' ? 'a' : 'b'}`.padEnd(42, '1'),
    primary: true,
  },
]
