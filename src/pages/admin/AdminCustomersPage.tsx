import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../lib/format'
import { fetchAllCustomers, fetchCustomerOrders, searchCustomers } from '../../services/customers'
import type { Customer } from '../../types'

export function AdminCustomersPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: () => (search ? searchCustomers(search) : fetchAllCustomers()),
  })

  const { data: customerOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'customer-orders', selected?.id],
    queryFn: () => fetchCustomerOrders(selected!.id),
    enabled: !!selected,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Customers</h1>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-700">Orders</th>
                <th className="px-4 py-3 font-medium text-gray-700">Spent</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelected(customer)}
                  className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                    selected?.id === customer.id ? 'bg-brand-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{customer.full_name || '—'}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.total_orders}</td>
                  <td className="px-4 py-3">{formatCurrency(customer.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card>
          {selected ? (
            <>
              <h2 className="mb-4 text-lg font-semibold">{selected.full_name || 'Customer'}</h2>
              <dl className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Phone</dt>
                  <dd>{selected.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Orders</dt>
                  <dd>{selected.total_orders}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Spent</dt>
                  <dd className="font-semibold">{formatCurrency(selected.total_spent)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Order</dt>
                  <dd>
                    {selected.last_order_at ? formatDate(selected.last_order_at) : '—'}
                  </dd>
                </div>
              </dl>

              <h3 className="mb-3 font-medium">Order History</h3>
              {ordersLoading ? (
                <Spinner className="h-6 w-6" />
              ) : !customerOrders?.length ? (
                <p className="text-sm text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span>#{order.id.slice(0, 8)}</span>
                      <span>{formatCurrency(order.total_price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a customer to view details.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
