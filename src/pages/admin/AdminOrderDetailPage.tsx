import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OrderStatusSelect } from '../../components/admin/OrderStatusSelect'
import { Card } from '../../components/ui/Card'
import { OrderStatusBadge } from '../../components/OrderStatusBadge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../lib/format'
import { fetchOrderById, updateOrderStatus } from '../../services/orders'
import type { OrderStatus } from '../../types'

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => fetchOrderById(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-stats'] })
    },
  })

  const handleStatusUpdate = async (_orderId: string, status: OrderStatus) => {
    await statusMutation.mutateAsync(status)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!order) {
    return <p className="text-gray-600">Order not found.</p>
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{order.phone}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Address</dt>
              <dd className="mt-1 font-medium">{order.address}</dd>
            </div>
            {order.customers && (
              <>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <dt className="text-gray-500">Lifetime Orders</dt>
                  <dd>{order.customers.total_orders}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lifetime Spent</dt>
                  <dd>{formatCurrency(order.customers.total_spent)}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Update status</h2>
          <p className="mb-4 text-sm text-gray-600">
            Change the order status manually. Updates save immediately.
          </p>
          <OrderStatusSelect
            orderId={order.id}
            status={order.status}
            onUpdate={handleStatusUpdate}
          />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <div className="space-y-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-gray-500">
                  {item.color} / {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatCurrency(item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>−{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total_price)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
