export const scenarioNames = [
  'success',
  'empty',
  'slow',
  'out-of-order',
  'network-error',
  'server-error',
  'expired-session',
  'forbidden',
  'validation-error',
  'favorite-error',
  'late-profile-response',
  'price-change',
  'sold-out',
  'order-timeout',
  'payment-declined',
] as const
export type Scenario = (typeof scenarioNames)[number]
let active: Scenario = 'success'
export function scenario() {
  return active
}
export function setScenario(value: string) {
  active = scenarioNames.find((s) => s === value) ?? 'success'
  localStorage.setItem('nft-marketplace:scenario', active)
}
export function configureScenario() {
  setScenario(
    new URLSearchParams(location.search).get('scenario') ??
      localStorage.getItem('nft-marketplace:scenario') ??
      'success',
  )
}
