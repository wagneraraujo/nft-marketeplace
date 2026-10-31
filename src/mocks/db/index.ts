import type {
  User,
  Nft,
  Wallet,
  Quote,
  Order,
  Cart,
  CartItem,
} from '@/contracts'
import { seedNfts, seedUsers, seedWallets } from '../fixtures'
import { add, multiply, percentage, subtract } from '@/lib/decimal'
interface Account extends User {
  hash: string
  salt: string
}
interface RawCart {
  items: Record<string, number>
  version: number
  notices: string[]
}
interface Database {
  outcomes?: Record<string, 'confirmed' | 'declined'>
  schema: number
  users: Account[]
  nfts: Nft[]
  carts: Record<string, RawCart>
  favorites: Record<string, string[]>
  wallets: Record<string, Wallet[]>
  sessions: Record<string, { userId: string; expiresAt: number }>
  quotes: Record<string, { userId: string; quote: Quote }>
  orders: Record<string, Order>
  attempts: Record<string, { fingerprint: string; orderId: string }>
}
const key = 'nft-marketplace:mock-db:v1'
export async function passwordHash(password: string, salt: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(salt + password),
      ),
    ),
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
export let db: Database
export function save() {
  localStorage.setItem(key, JSON.stringify(db))
}
export async function reset() {
  for (const name of Object.keys(localStorage)) {
    if (
      name.startsWith('nft-marketplace:attempt:') ||
      name.startsWith('nft-marketplace:coupon:') ||
      name === 'nft-marketplace:visitor'
    )
      localStorage.removeItem(name)
  }
  const users = await Promise.all(
    seedUsers.map(async (user) => {
      const salt = crypto.randomUUID()
      return { ...user, salt, hash: await passwordHash('Demo1234!', salt) }
    }),
  )
  db = {
    schema: 1,
    users,
    nfts: structuredClone(seedNfts),
    carts: {},
    favorites: {},
    wallets: Object.fromEntries(users.map((u) => [u.id, seedWallets(u.id)])),
    sessions: {},
    quotes: {},
    orders: {},
    attempts: {},
  }
  save()
}
export async function initialize() {
  try {
    const value = localStorage.getItem(key)
    if (value) {
      const parsed = JSON.parse(value) as Database
      if (parsed.schema === 1) {
        db = parsed
        return
      }
    }
  } catch {
    /* Reset invalid local demo data. */
  }
  await reset()
}
export function publicUser(account: Account): User {
  const { id, name, email, avatar } = account
  return { id, name, email, avatar }
}
export function rawCart(owner: string) {
  return (db.carts[owner] ??= { items: {}, version: 1, notices: [] })
}
export function getCart(owner: string): Cart {
  const cart = rawCart(owner)
  return {
    version: cart.version,
    notices: cart.notices,
    items: Object.entries(cart.items).flatMap(([id, quantity]) => {
      const nft = db.nfts.find((n) => n.id === id)
      return nft ? [{ nft, quantity }] : []
    }),
  }
}
export function mergeCart(visitor: string, userId: string) {
  const guest = rawCart(visitor)
  const user = rawCart(userId)
  for (const [id, count] of Object.entries(guest.items)) {
    const nft = db.nfts.find((n) => n.id === id)
    if (!nft) continue
    const requested = (user.items[id] ?? 0) + count
    const quantity = Math.min(nft.stock, requested, 10)
    if (quantity) user.items[id] = quantity
    if (quantity < requested)
      user.notices.push(`Quantidade de ${nft.name} ajustada à disponibilidade.`)
  }
  user.version++
  delete db.carts[visitor]
  save()
}
export function makeQuote(userId: string, coupon: string): Quote {
  const cart = getCart(userId)
  const subtotal = cart.items.reduce(
    (sum, item) => add(sum, multiply(item.nft.price, item.quantity)),
    '0',
  )
  const discount = coupon === 'ART10' ? percentage(subtotal, '0.1') : '0'
  const fee = percentage(subtract(subtotal, discount), '0.025')
  const quote: Quote = {
    id: crypto.randomUUID(),
    version: 1,
    cartVersion: cart.version,
    expiresAt: Date.now() + 120000,
    items: structuredClone(cart.items),
    subtotal,
    discount,
    fee,
    total: add(subtract(subtotal, discount), fee),
    coupon,
  }
  db.quotes[quote.id] = { userId, quote }
  save()
  return quote
}
export function sameItems(items: CartItem[], owner: string) {
  const cart = getCart(owner)
  return (
    cart.items.length === items.length &&
    items.every((item) =>
      cart.items.some(
        (current) =>
          current.nft.id === item.nft.id &&
          current.quantity === item.quantity &&
          current.nft.version === item.nft.version &&
          current.nft.price === item.nft.price &&
          current.nft.stock >= current.quantity,
      ),
    )
  )
}
