const prefix = 'nft-marketplace:'
export const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(prefix + key)
      return value ? (JSON.parse(value) as T) : fallback
    } catch {
      return fallback
    }
  },
  write(key: string, value: unknown) {
    localStorage.setItem(prefix + key, JSON.stringify(value))
  },
  remove(key: string) {
    localStorage.removeItem(prefix + key)
  },
}
export const sessionStore = {
  token: () => storage.read<string | null>('session', null),
  set: (token: string) => storage.write('session', token),
  clear: () => storage.remove('session'),
}
export function visitorId() {
  let id = storage.read<string | null>('visitor', null)
  if (!id) {
    id = crypto.randomUUID()
    storage.write('visitor', id)
  }
  return id
}
