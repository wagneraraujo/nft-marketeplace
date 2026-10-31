import { z } from 'zod'
export const accountSchema = z.object({
  name: z.string().min(2, 'Informe ao menos 2 caracteres.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'Use ao menos 8 caracteres.'),
})
export const loginSchema = accountSchema.omit({ name: true })
export const profileSchema = z.object({
  username: z.string().max(40).optional(),
  ens: z.string().max(100).optional(),
  walletAlias: z.string().max(80).optional(),
  name: z.string().min(2),
  email: z.email(),
  avatar: z
    .string()
    .refine(
      (v) => v === '' || /^data:image\/(png|jpeg|webp);base64,/.test(v),
      'Envie uma imagem PNG, JPEG ou WebP.',
    ),
})
export const walletSchema = z.object({
  displayName: z.string().max(80).optional(),
  profileName: z.string().max(80).optional(),
  network: z.literal('Ethereum').optional(),
  type: z.enum(['MetaMask', 'WalletConnect', 'Coinbase Wallet']).optional(),
  email: z.union([z.email(), z.literal('')]).optional(),
  ens: z.string().max(100).optional(),
  secondaryAddress: z.string().max(100).optional(),
  referralCode: z.string().max(40).optional(),
  label: z.string().min(2, 'Informe um nome.'),
  address: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, 'Endereço Ethereum inválido.'),
  primary: z.boolean(),
})
export const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  password: z.string().min(8),
})
export const paymentSchema = z.object({
  walletId: z.string().min(1, 'Selecione uma carteira.'),
  accepted: z.boolean().refine((v) => v, 'Confirme a revisão dos valores.'),
})
export const searchSchema = z.object({
  q: z.string().catch(''),
  category: z.string().catch(''),
  rarity: z.string().catch(''),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).catch('newest'),
  page: z.coerce.number().int().positive().catch(1),
})
export type CatalogSearch = z.infer<typeof searchSchema>
export interface User {
  username?: string
  ens?: string
  walletAlias?: string
  id: string
  name: string
  email: string
  avatar: string
}
export interface Session {
  token: string
  user: User
}
export interface Nft {
  id: string
  name: string
  collection: string
  creator: string
  category: string
  rarity: string
  price: string
  stock: number
  version: number
  image: string
  description: string
}
export interface Catalog {
  items: Nft[]
  total: number
  pages: number
}
export interface CartItem {
  nft: Nft
  quantity: number
}
export interface Cart {
  items: CartItem[]
  version: number
  notices: string[]
}
export interface Quote {
  id: string
  version: number
  cartVersion: number
  expiresAt: number
  items: CartItem[]
  subtotal: string
  discount: string
  fee: string
  total: string
  coupon: string
}
export interface Wallet {
  displayName?: string
  profileName?: string
  network?: 'Ethereum'
  type?: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet'
  email?: string
  ens?: string
  secondaryAddress?: string
  referralCode?: string
  id: string
  label: string
  address: string
  primary: boolean
}
export interface Order {
  id: string
  userId: string
  version: number
  status: 'pending' | 'confirmed' | 'declined'
  quote: Quote
  walletId: string
  createdAt: string
  txHash?: string
}
export interface OrderInput {
  quoteId: string
  walletId: string
}
export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}
export const eventSchema = z.object({
  eventId: z.string(),
  resourceId: z.string(),
  version: z.number().int(),
  type: z.enum(['nft.updated', 'order.updated']),
  userId: z.string().optional(),
})
export type ResourceEvent = z.infer<typeof eventSchema>
