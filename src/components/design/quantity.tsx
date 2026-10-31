import { Minus, Plus } from 'lucide-react'
export function QuantityControl({
  value,
  max = 10,
  onChange,
  disabled,
  label,
}: {
  value: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
  label: string
}) {
  return (
    <div className="quantity-control">
      <button
        type="button"
        disabled={disabled || value <= 1}
        aria-label={`Diminuir edições de ${label}`}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={12} />
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
        <Plus size={12} />
      </button>
    </div>
  )
}
