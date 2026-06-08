import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { OptionButton } from '../components/ui/OptionButton'
import { Spinner } from '../components/ui/Spinner'
import { useCart } from '../contexts/CartContext'
import { getCategoryLabel, getSizeTypeForCategory, SIZE_TYPE_LABELS } from '../lib/categories'
import { formatCurrency } from '../lib/format'
import { fetchProductById } from '../services/products'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-600">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
          Back to shop
        </Link>
      </div>
    )
  }

  const colors = product.colors.length ? product.colors : ['Default']
  const sizes = product.sizes.length ? product.sizes : ['One Size']
  const selectedColor = color || colors[0]
  const selectedSize = size || sizes[0]
  const sizeLabel = SIZE_TYPE_LABELS[getSizeTypeForCategory(product.category)]

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.image_url || '',
      color: selectedColor,
      size: selectedSize,
      quantity,
      unitPrice: product.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-28 sm:px-6 sm:pb-8 sm:py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 flex min-h-[44px] items-center gap-1 text-sm font-medium text-brand-700 sm:mb-4"
      >
        ← Back
      </button>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-brand-50 sm:aspect-[3/4]">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-brand-300">👕</div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600 sm:text-sm">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-2 text-xl font-semibold text-brand-900 sm:text-2xl">{formatCurrency(product.price)}</p>
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:mt-6 sm:text-base">{product.description}</p>
          )}

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <OptionButton key={c} label={c} selected={selectedColor === c} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{sizeLabel}</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <OptionButton key={s} label={s} selected={selectedSize === s} onClick={() => setSize(s)} />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
              <div className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-lg hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-base font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-lg hover:bg-gray-50 active:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop buttons */}
            <div className="hidden flex-col gap-3 sm:flex sm:flex-row">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                {added ? 'Added to Cart ✓' : 'Add to Cart'}
              </Button>
              <Link to="/cart" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky add to cart */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{formatCurrency(product.price * quantity)}</p>
            <p className="truncate text-xs text-gray-500">
              {selectedColor} · {selectedSize} · Qty {quantity}
            </p>
          </div>
          <Button size="lg" className="shrink-0 px-6" onClick={handleAddToCart}>
            {added ? 'Added ✓' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}
