import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, formatDate } from '../lib/format'
import { fetchUserOrders } from '../services/orders'

export function OrdersPage() {
  const { user } = useAuth()

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => fetchUserOrders(user!.id),
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-600">Failed to load orders.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">My Orders</h1>

      {!orders?.length ? (
        <EmptyState
          title="No orders yet"
          description="Your order history will appear here."
          action={
            <Link to="/" className="text-brand-700 hover:underline">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div>
                <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-semibold">{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
