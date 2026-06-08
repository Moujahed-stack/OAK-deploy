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
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 sm:mb-8 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="min-h-[36px] px-2 text-sm font-medium text-brand-700 active:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
        <p className="mt-2 text-xs text-gray-500 sm:mt-3">
          {getCategoryById(category as ProductCategoryId)?.description}
        </p>
      )}
    </div>
  )
}
