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
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
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
