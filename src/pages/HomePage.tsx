import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '../components/ProductCard'
import { ProductFilters } from '../components/ProductFilters'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { getCategoryLabel, type ProductCategoryId } from '../lib/categories'
import { fetchActiveProducts } from '../services/products'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const category = (searchParams.get('category') || '') as ProductCategoryId | ''
  const size = searchParams.get('size') || ''

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', 'active', category, size],
    queryFn: () =>
      fetchActiveProducts({
        category: category || undefined,
        size: size || undefined,
      }),
  })

  const heading = useMemo(() => {
    if (category && size) return `${getCategoryLabel(category)} — ${size}`
    if (category) return getCategoryLabel(category)
    if (size) return `Size ${size}`
    return 'Shop All'
  }, [category, size])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-16 text-center sm:px-6">
        <p className="text-sm text-red-600 sm:text-base">Failed to load products. Check your Supabase configuration.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-12">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">{heading}</h1>
        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">Premium clothing for every occasion</p>
      </div>

      <ProductFilters />

      {!products?.length ? (
        <EmptyState
          title="No products match your filters"
          description="Try a different type or size, or clear filters."
        />
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
