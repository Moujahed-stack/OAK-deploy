import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { MobileMenu } from '../components/MobileMenu'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { signOut } from '../services/auth'
import { Button } from '../components/ui/Button'

export function MainLayout() {
  const { user, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdminRoute = location.pathname.startsWith('/admin')
  const showBottomNav = !isAdminRoute

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-brand-900">
            OAK
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex md:gap-4">
            <Link
              to="/cart"
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-900 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/orders" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50">
                  Orders
                </Link>
                <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
                    Admin
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: cart + menu */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-brand-50"
              aria-label="Cart"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-900 px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-brand-50"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={handleSignOut}
      />

      <main className={`flex-1 ${showBottomNav ? 'pb-nav' : ''}`}>
        <Outlet />
      </main>

      {showBottomNav && <BottomNav />}

      <footer className={`border-t border-brand-200 bg-white py-6 ${showBottomNav ? 'hidden sm:block' : ''}`}>
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} OAK Clothing. Quality apparel for every occasion.
        </div>
      </footer>
    </div>
  )
}
