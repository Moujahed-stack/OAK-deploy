import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const shopClass = (active: boolean) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition ${
    active ? 'text-brand-900' : 'text-gray-500'
  }`

export function BottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { itemCount } = useCart()

  const accountPath = user ? '/profile' : '/login'
  const isShop = pathname === '/' || pathname.startsWith('/product')
  const isCart = pathname === '/cart' || pathname === '/checkout'
  const isAccount =
    pathname === '/profile' ||
    pathname === '/orders' ||
    pathname === '/login' ||
    pathname === '/register'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-200 bg-white/95 backdrop-blur md:hidden safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch">
        <Link to="/" className={shopClass(isShop)}>
          <ShopIcon active={isShop} />
          Shop
        </Link>
        <Link to="/cart" className={`relative ${shopClass(isCart)}`}>
          <span className="relative">
            <CartIcon active={isCart} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-900 px-1 text-[10px] font-bold text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </span>
          Cart
        </Link>
        <Link to={accountPath} className={shopClass(isAccount)}>
          <AccountIcon active={isAccount} />
          {user ? 'Account' : 'Sign In'}
        </Link>
      </div>
    </nav>
  )
}

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={active ? 'currentColor' : 'currentColor'} strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function CartIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
