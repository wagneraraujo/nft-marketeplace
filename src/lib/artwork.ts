// Delivery variants of original Figma images; unknown/historical URLs stay valid.
export function artworkProps(src: string, sizes: string) {
  const match = /^\/figma\/(8f387|83794|9add2|b7cfc)\.png$/.exec(src)
  if (!match) return { src }
  const base = `/figma/responsive/${match[1]}`
  return {
    src: `${base}-1254.webp`,
    srcSet: [320, 640, 960, 1254]
      .map((width) => `${base}-${width}.webp ${width}w`)
      .join(', '),
    sizes,
  }
}
