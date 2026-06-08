import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { signOut } from '../services/auth'
import { Button } from '../components/ui/Button'

export function MainLayout() {
  const { user, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-brand-900">
            OAK
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50">
              Cart
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-900 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/orders" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 sm:block">
                  Orders
                </Link>
                <Link to="/profile" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 sm:block">
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
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-brand-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} OAK Clothing. Quality apparel for every occasion.
        </div>
      </footer>
    </div>
  )
}
