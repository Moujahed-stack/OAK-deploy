import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { OrderStatusSelect } from '../../components/admin/OrderStatusSelect'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../lib/format'
import { fetchAllOrders, updateOrderStatus } from '../../services/orders'
import type { OrderStatus } from '../../types'

export function AdminOrdersPage() {
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchAllOrders,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-stats'] })
    },
  })

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    await statusMutation.mutateAsync({ id: orderId, status })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">Orders</h1>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="font-semibold text-brand-700 active:underline"
                >
                  #{order.id.slice(0, 8)}
                </Link>
                <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.phone}</p>
              </div>
              <p className="shrink-0 text-base font-bold text-gray-900">{formatCurrency(order.total_price)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              <OrderStatusSelect
                orderId={order.id}
                status={order.status}
                onUpdate={handleStatusUpdate}
                compact
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Order</th>
              <th className="px-4 py-3 font-medium text-gray-700">Customer</th>
              <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-700">Total</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(order.total_price)}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect
                    orderId={order.id}
                    status={order.status}
                    onUpdate={handleStatusUpdate}
                    compact
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
