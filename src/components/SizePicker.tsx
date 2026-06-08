import {
  getSizeOptionsForCategory,
  getSizeTypeForCategory,
  SIZE_TYPE_LABELS,
} from '../lib/categories'

interface SizePickerProps {
  category: string
  selected: string[]
  onChange: (sizes: string[]) => void
}

export function SizePicker({ category, selected, onChange }: SizePickerProps) {
  const options = getSizeOptionsForCategory(category)
  const sizeLabel = SIZE_TYPE_LABELS[getSizeTypeForCategory(category)]

  const toggle = (size: string) => {
    if (selected.includes(size)) {
      onChange(selected.filter((s) => s !== size))
    } else {
      onChange([...selected, size])
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Available {sizeLabel}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              selected.includes(size)
                ? 'border-brand-900 bg-brand-900 text-white'
                : 'border-gray-300 hover:border-brand-400'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="mt-2 text-xs text-amber-600">Select at least one size</p>
      )}
    </div>
  )
}
