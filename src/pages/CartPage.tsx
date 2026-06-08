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
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
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
    <div className="mx-auto max-w-7xl px-3 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Shopping Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2 sm:space-y-4">
          {items.map((item) => {
            const key = cartItemKey(item)
            return (
              <div
                key={key}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4"
              >
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50 sm:h-24 sm:w-20">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl sm:text-2xl">👕</div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div>
                    <h3 className="truncate font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-xs text-gray-500 sm:text-sm">
                      {item.color} / {item.size}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold sm:mt-1 sm:text-base">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center text-base disabled:opacity-40"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center text-base"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="min-h-[40px] px-2 text-sm text-red-600 active:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop summary */}
        <div className="hidden h-fit rounded-xl border border-gray-200 bg-white p-6 lg:block">
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

      {/* Mobile sticky checkout */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Subtotal</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(subtotal)}</p>
          </div>
          <Link to="/checkout" className="shrink-0">
            <Button size="lg" className="px-6">
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
