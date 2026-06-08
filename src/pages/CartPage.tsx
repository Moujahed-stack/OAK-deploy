import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useCart } from '../contexts/CartContext'
import { cartItemKey } from '../lib/cart'
import { formatCurrency } from '../lib/format'

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Browse our collection and add items to your cart."
          action={
            <Link to="/">
              <Button>Continue Shopping</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const key = cartItemKey(item)
            return (
              <div
                key={key}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">👕</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      {item.color} / {item.size}
                    </p>
                    <p className="mt-1 font-medium">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-sm disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="mt-4 flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Discounts applied at checkout</p>
          <Link to="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
          <Link to="/" className="mt-3 block text-center text-sm text-brand-700 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
