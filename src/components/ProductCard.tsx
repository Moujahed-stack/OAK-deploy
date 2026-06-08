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
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
    >
      <div className="aspect-[3/4] overflow-hidden bg-brand-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <span className="text-4xl">👕</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="mt-1 font-medium text-gray-900 group-hover:text-brand-700">{product.name}</h3>
        <p className="mt-1 text-lg font-semibold text-brand-900">{formatCurrency(product.price)}</p>
      </div>
    </Link>
  )
}
