import { supabase } from '../lib/supabase'
import type { Customer, Order } from '../types'

function parseCustomer(row: Record<string, unknown>): Customer {
  return {
    ...row,
    total_orders: Number(row.total_orders),
    total_spent: Number(row.total_spent),
  } as Customer
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (error) throw error
  return data ? parseCustomer(data) : null
}

export async function upsertCustomer(params: {
  phone: string
  fullName: string
  userId: string | null
}): Promise<Customer> {
  const existing = await findCustomerByPhone(params.phone)

  if (existing) {
    const updates: Record<string, string> = {}
    if (params.fullName && existing.full_name !== params.fullName) {
      updates.full_name = params.fullName
    }
    if (params.userId && !existing.user_id) {
      updates.user_id = params.userId
    }

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return parseCustomer(data)
    }
    return existing
  }

  const customerId = crypto.randomUUID()
  const { error } = await supabase.from('customers').insert({
    id: customerId,
    phone: params.phone,
    full_name: params.fullName,
    user_id: params.userId,
  })

  if (error) throw error
  return parseCustomer({
    id: customerId,
    phone: params.phone,
    full_name: params.fullName,
    user_id: params.userId,
    total_orders: 0,
    total_spent: 0,
    last_order_at: null,
    created_at: new Date().toISOString(),
  })
}

export async function fetchAllCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(parseCustomer)
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(parseCustomer)
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total_price: Number(row.total_price),
  })) as Order[]
}

export async function getCustomerCount(): Promise<number> {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}
