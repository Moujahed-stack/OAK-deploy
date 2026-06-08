export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface Customer {
  id: string
  user_id: string | null
  full_name: string | null
  phone: string
  total_orders: number
  total_spent: number
  last_order_at: string | null
  created_at: string
}

import type { ProductCategoryId } from '../lib/categories'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: ProductCategoryId
  colors: string[]
  sizes: string[]
  active: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'completed' | 'rejected'

export interface Order {
  id: string
  customer_id: string | null
  user_id: string | null
  customer_name: string
  phone: string
  address: string
  subtotal: number
  discount: number
  total_price: number
  status: OrderStatus
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string | null
  color: string | null
  size: string | null
  quantity: number
  unit_price: number
}

export type DiscountType = 'percentage' | 'fixed'

export interface Promotion {
  id: string
  name: string
  active: boolean
  discount_type: DiscountType
  discount_value: number
  min_total_spent: number | null
  min_order_amount: number | null
  first_order_only: boolean
  registered_users_only: boolean
  created_at: string
}

export interface CartItem {
  productId: string
  productName: string
  image: string
  color: string
  size: string
  quantity: number
  unitPrice: number
}

export interface CheckoutFormData {
  fullName: string
  phone: string
  address: string
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalCustomers: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
  customers?: Customer | null
}
