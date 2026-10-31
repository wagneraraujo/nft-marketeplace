import Decimal from 'decimal.js'
export const add = (a: string, b: string) => new Decimal(a).plus(b).toFixed()
export const multiply = (value: string, quantity: number) =>
  new Decimal(value).times(quantity).toFixed()
export const percentage = (value: string, rate: string) =>
  new Decimal(value).times(rate).toFixed(6)
export const subtract = (a: string, b: string) =>
  new Decimal(a).minus(b).toFixed()
export const compare = (a: string, b: string) => new Decimal(a).comparedTo(b)
export const formatEth = (value: string) =>
  `${new Decimal(value).toDecimalPlaces(6).toFixed()} ETH`
