import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatCurrency } from '../lib/format'
import { calculateBestDiscount } from '../lib/promotions'
import { findCustomerByPhone, upsertCustomer } from '../services/customers'
import { countUserOrders, createOrder } from '../services/orders'
import { fetchActivePromotions } from '../services/promotions'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const { user, profile } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: fetchActivePromotions,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    values: {
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  })

  const phone = watch('phone')

  const { data: existingCustomer } = useQuery({
    queryKey: ['customer', phone],
    queryFn: () => findCustomerByPhone(phone),
    enabled: phone?.length >= 7,
  })

  const { data: userOrderCount = 0 } = useQuery({
    queryKey: ['user-order-count', user?.id],
    queryFn: () => countUserOrders(user!.id),
    enabled: !!user,
  })

  const isFirstOrder = user
    ? userOrderCount === 0
    : !existingCustomer || existingCustomer.total_orders === 0

  const { discount, appliedPromotion } = calculateBestDiscount(promotions, {
    subtotal,
    isFirstOrder,
    isRegistered: !!user,
    totalSpent: existingCustomer?.total_spent || 0,
  })

  const total = Math.max(0, subtotal - discount)

  useEffect(() => {
    if (!items.length && !success) {
      navigate('/cart')
    }
  }, [items.length, success, navigate])

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true)
    setError('')
    try {
      const customer = await upsertCustomer({
        phone: data.phone,
        fullName: data.fullName,
        userId: user?.id || null,
      })

      await createOrder({
        customerId: customer.id,
        userId: user?.id || null,
        customerName: data.fullName,
        phone: data.phone,
        address: data.address,
        subtotal,
        discount,
        totalPrice: total,
        items,
      })

      clearCart()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-3 py-12 text-center sm:px-6 sm:py-16">
        <div className="mb-6 text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Thank you for your purchase. We&apos;ll process your order shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/">
            <Button size="lg" className="w-full">Continue Shopping</Button>
          </Link>
          {user && (
            <Link to="/orders">
              <Button variant="outline" size="lg" className="w-full">View Orders</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  const orderSummary = (
    <Card className="p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold sm:mb-6 sm:text-lg">Order Summary</h2>
      <div className="max-h-40 space-y-2 overflow-y-auto sm:max-h-none sm:space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-gray-600">
              {item.productName} × {item.quantity}
            </span>
            <span className="shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 sm:mt-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span className="min-w-0 truncate pr-2">
              Discount{appliedPromotion && ` (${appliedPromotion.name})`}
            </span>
            <span className="shrink-0">−{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Checkout</h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
        {/* Order summary first on mobile */}
        <div className="lg:order-2">{orderSummary}</div>

        <Card className="p-4 sm:p-6 lg:order-1">
          <h2 className="mb-4 text-base font-semibold sm:mb-6 sm:text-lg">Shipping Information</h2>
          {!user && (
            <p className="mb-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
              Guest checkout.{' '}
              <Link to="/login" className="font-medium underline">
                Sign in
              </Link>{' '}
              for rewards.
            </p>
          )}
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
            <Input
              label="Phone Number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Textarea label="Address" rows={3} error={errors.address?.message} {...register('address')} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="lg" className="hidden w-full sm:block" loading={submitting}>
              Place Order — {formatCurrency(total)}
            </Button>
          </form>
        </Card>
      </div>

      {/* Mobile sticky place order */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            size="lg"
            className="shrink-0 px-5"
            loading={submitting}
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  )
}
