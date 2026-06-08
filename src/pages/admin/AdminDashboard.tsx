import { useQuery } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../lib/format'
import { getCustomerCount } from '../../services/customers'
import { getDashboardOrderStats } from '../../services/orders'
import { fetchAllProducts } from '../../services/products'

export function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchAllProducts,
  })

  const { data: orderStats, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: getDashboardOrderStats,
  })

  const { data: customerCount, isLoading: customersLoading } = useQuery({
    queryKey: ['admin', 'customer-count'],
    queryFn: getCustomerCount,
  })

  const loading = productsLoading || ordersLoading || customersLoading

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const stats = [
    { label: 'Total Products', value: products?.length ?? 0 },
    { label: 'Total Orders', value: orderStats?.totalOrders ?? 0 },
    { label: 'Total Revenue', value: formatCurrency(orderStats?.totalRevenue ?? 0) },
    { label: 'Pending Orders', value: orderStats?.pendingOrders ?? 0 },
    { label: 'Total Customers', value: customerCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
