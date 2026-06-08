import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  cartItemKey,
  clearCart as clearCartStorage,
  getCart,
  getCartItemCount,
  getCartSubtotal,
  saveCart,
} from '../lib/cart'
import type { CartItem } from '../types'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: CartItem) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = cartItemKey(item)
      const existing = prev.find((i) => cartItemKey(i) === key)
      if (existing) {
        return prev.map((i) =>
          cartItemKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i))
    )
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartItemKey(i) !== key))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    clearCartStorage()
  }, [])

  const value = useMemo(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      subtotal: getCartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
