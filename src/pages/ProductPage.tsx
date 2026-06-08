import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useCart } from '../contexts/CartContext'
import { getCategoryLabel, getSizeTypeForCategory, SIZE_TYPE_LABELS } from '../lib/categories'
import { formatCurrency } from '../lib/format'
import { fetchProductById } from '../services/products'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-brand-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-brand-300">👕</div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {getCategoryLabel(product.category)}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-brand-900">{formatCurrency(product.price)}</p>
          {product.description && (
            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedColor === c
                        ? 'border-brand-900 bg-brand-900 text-white'
                        : 'border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">{sizeLabel}</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === s
                        ? 'border-brand-900 bg-brand-900 text-white'
                        : 'border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
    </div>
  )
}
