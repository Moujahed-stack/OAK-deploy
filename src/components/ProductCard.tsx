import { Link } from 'react-router-dom'
import { getCategoryLabel } from '../lib/categories'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition active:scale-[0.98] sm:hover:shadow-lg"
    >
      <div className="aspect-[3/4] overflow-hidden bg-brand-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition sm:group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <span className="text-3xl sm:text-4xl">👕</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-brand-600 sm:text-xs">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-gray-900 sm:mt-1 sm:text-base sm:group-hover:text-brand-700">
          {product.name}
        </h3>
        <p className="mt-auto pt-1.5 text-base font-semibold text-brand-900 sm:pt-2 sm:text-lg">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  )
}
