import type { CartItem } from '../types'

const CART_KEY = 'oak-cart'

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartItemKey(item: Pick<CartItem, 'productId' | 'color' | 'size'>): string {
  return `${item.productId}-${item.color}-${item.size}`
}
