import { assetDimensions } from '@/lib/design-assets'
export function AssetIcon({
  src,
  className = '',
  label,
}: {
  src: string
  className?: string
  label?: string
}) {
  const dimensions = assetDimensions[src]
  return (
    <span
      className={`asset-icon ${className}`}
      aria-hidden={label ? undefined : true}
    >
      <img
        src={src}
        alt={label ?? ''}
        width={Number(dimensions?.width) || undefined}
        height={Number(dimensions?.height) || undefined}
      />
    </span>
  )
}
