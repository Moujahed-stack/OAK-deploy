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
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">Customers</h1>

      <div className="mb-4 sm:mb-6">
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Mobile cards / desktop list */}
        <div className="space-y-2 lg:overflow-hidden lg:rounded-xl lg:border lg:border-gray-200 lg:bg-white">
          {customers?.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => setSelected(customer)}
              className={`w-full rounded-xl border p-4 text-left transition active:scale-[0.99] lg:rounded-none lg:border-0 lg:border-b lg:border-gray-100 lg:p-4 lg:last:border-b-0 ${
                selected?.id === customer.id
                  ? 'border-brand-300 bg-brand-50 lg:bg-brand-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-gray-900">{customer.full_name || '—'}</p>
                <p className="shrink-0 text-sm font-medium text-brand-900">
                  {formatCurrency(customer.total_spent)}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
                <span>{customer.phone}</span>
                <span>{customer.total_orders} orders</span>
              </div>
            </button>
          ))}
        </div>

        <Card className="p-4 sm:p-6">
          {selected ? (
            <>
              <h2 className="mb-4 text-lg font-semibold">{selected.full_name || 'Customer'}</h2>
              <dl className="mb-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="text-right font-medium">{selected.phone}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Total Orders</dt>
                  <dd className="font-medium">{selected.total_orders}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Total Spent</dt>
                  <dd className="font-semibold">{formatCurrency(selected.total_spent)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Last Order</dt>
                  <dd className="font-medium">
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
                      className="flex justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm"
                    >
                      <span>#{order.id.slice(0, 8)}</span>
                      <span className="font-medium">{formatCurrency(order.total_price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-gray-500">Select a customer to view details.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
