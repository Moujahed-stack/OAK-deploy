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
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mb-6 text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. We&apos;ll process your order shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
          {user && (
            <Link to="/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-lg font-semibold">Shipping Information</h2>
          {!user && (
            <p className="mb-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
              Checking out as guest.{' '}
              <Link to="/login" className="font-medium underline">
                Sign in
              </Link>{' '}
              to save your info and earn loyalty rewards.
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Phone Number" error={errors.phone?.message} {...register('phone')} />
            <Textarea label="Address" rows={3} error={errors.address?.message} {...register('address')} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Place Order — {formatCurrency(total)}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-6 text-lg font-semibold">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>
                  Discount
                  {appliedPromotion && ` (${appliedPromotion.name})`}
                </span>
                <span>−{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
