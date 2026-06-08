import { useSearchParams } from 'react-router-dom'
import {
  getCategoryById,
  getFilterSizesForCategory,
  PRODUCT_CATEGORIES,
  SIZE_TYPE_LABELS,
  type ProductCategoryId,
} from '../lib/categories'
import { Select } from './ui/Select'

export function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  const size = searchParams.get('size') || ''

  const sizeTypeLabel = category
    ? SIZE_TYPE_LABELS[getCategoryById(category)?.sizeType ?? 'clothing']
    : 'Size'

  const categoryOptions = [
    { value: '', label: 'All types' },
    ...PRODUCT_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.label,
    })),
  ]

  const sizeOptions = [
    { value: '', label: 'All sizes' },
    ...getFilterSizesForCategory(category || null).map((s) => ({
      value: s,
      label: s,
    })),
  ]

  const setFilter = (key: 'category' | 'size', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    if (key === 'category') {
      next.delete('size')
    }
    setSearchParams(next, { replace: true })
  }

  const clearAll = () => setSearchParams({}, { replace: true })

  const hasFilters = category || size

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          value={category}
          onChange={(e) => setFilter('category', e.target.value)}
          options={categoryOptions}
        />
        <Select
          label={sizeTypeLabel}
          value={size}
          onChange={(e) => setFilter('size', e.target.value)}
          options={sizeOptions}
        />
      </div>

      {category && (
        <p className="mt-3 text-xs text-gray-500">
          {getCategoryById(category as ProductCategoryId)?.description}
        </p>
      )}
    </div>
  )
}
