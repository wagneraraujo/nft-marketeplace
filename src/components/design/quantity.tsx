import { Minus, Plus } from 'lucide-react'
import { AssetIcon } from './asset-icon'
export function QuantityControl({
  value,
  max = 10,
  onChange,
  disabled,
  label,
  detail = false,
}: {
  value: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
  label: string
  detail?: boolean
}) {
  return (
    <div className="quantity-control">
      <button
        type="button"
        disabled={disabled || value <= 1}
        aria-label={`Diminuir edições de ${label}`}
        onClick={() => onChange(value - 1)}
      >
        {detail ? (
          <>
            <AssetIcon
              className="quantity-desktop-icon"
              src="/figma/7d18c.svg"
            />
            <AssetIcon
              className="quantity-mobile-icon"
              src="/figma/dd0fb.svg"
            />
          </>
        ) : (
          <Minus size={12} />
        )}
      </button>
      <select
        aria-label={`Quantidade de ${label}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: Math.max(value, max) }, (_, i) => (
          <option key={i + 1}>{i + 1}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={disabled || value >= max}
        aria-label={`Aumentar edições de ${label}`}
        onClick={() => onChange(value + 1)}
      >
        {detail ? (
          <>
            <AssetIcon
              className="quantity-desktop-icon"
              src="/figma/a803c.svg"
            />
            <AssetIcon
              className="quantity-mobile-icon"
              src="/figma/f8641.svg"
            />
          </>
        ) : (
          <Plus size={12} />
        )}
      </button>
    </div>
  )
}
