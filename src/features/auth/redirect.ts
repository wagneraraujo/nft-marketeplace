export function safeDestination(input: unknown) {
  if (
    typeof input !== 'string' ||
    !input.startsWith('/') ||
    input.startsWith('//') ||
    input.includes('\\') ||
    /^\/(login|register)(\?|$)/.test(input)
  )
    return '/'
  return input
}
