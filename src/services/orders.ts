import { supabase } from '../lib/supabase'
import { notifyAdminNewOrder } from './notifications'
import type { CartItem, Order, OrderItem, OrderStatus, OrderWithItems } from '../types'

function parseOrder(row: Record<string, unknown>): Order {
  return {
    ...row,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total_price: Number(row.total_price),
    status: row.status as OrderStatus,
  } as Order
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(parseOrder)
}

export async function fetchAllOrders(): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), customers(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row) => ({
    ...parseOrder(row),
    order_items: (row.order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })) as OrderItem[],
    customers: row.customers || null,
  }))
}

export async function fetchOrderById(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), customers(*)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return {
    ...parseOrder(data),
    order_items: (data.order_items || []).map((item: Record<string, unknown>) => ({
      ...item,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })) as OrderItem[],
    customers: data.customers || null,
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function countUserOrders(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

export interface CreateOrderInput {
  customerId: string
  userId: string | null
  customerName: string
  phone: string
  address: string
  subtotal: number
  discount: number
  totalPrice: number
  items: CartItem[]
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // Client-generated ID — avoids SELECT after INSERT, which RLS blocks for guest orders (user_id is null)
  const orderId = crypto.randomUUID()

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    customer_id: input.customerId,
    user_id: input.userId,
    customer_name: input.customerName,
    phone: input.phone,
    address: input.address,
    subtotal: input.subtotal,
    discount: input.discount,
    total_price: input.totalPrice,
    status: 'pending',
  })

  if (orderError) throw orderError

  const orderItems = input.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  // Fire-and-forget; logs to console if notification fails
  void notifyAdminNewOrder(orderId)

  return parseOrder({
    id: orderId,
    customer_id: input.customerId,
    user_id: input.userId,
    customer_name: input.customerName,
    phone: input.phone,
    address: input.address,
    subtotal: input.subtotal,
    discount: input.discount,
    total_price: input.totalPrice,
    status: 'pending',
    created_at: new Date().toISOString(),
  })
}

export async function getDashboardOrderStats(): Promise<{
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}> {
  const { data, error } = await supabase.from('orders').select('total_price, status')
  if (error) throw error

  const orders = data || []
  return {
    totalOrders: orders.length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + Number(o.total_price), 0),
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  }
}
