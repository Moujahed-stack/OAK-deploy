import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  onSignOut: () => void
}

export function MobileMenu({ open, onClose, onSignOut }: MobileMenuProps) {
  const { user, isAdmin } = useAuth()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <span className="font-bold text-brand-900">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <MenuLink to="/" onClick={onClose}>Shop</MenuLink>
            <MenuLink to="/cart" onClick={onClose}>Cart</MenuLink>
            {user ? (
              <>
                <MenuLink to="/orders" onClick={onClose}>My Orders</MenuLink>
                <MenuLink to="/profile" onClick={onClose}>Profile</MenuLink>
                {isAdmin && <MenuLink to="/admin" onClick={onClose}>Admin Dashboard</MenuLink>}
              </>
            ) : (
              <>
                <MenuLink to="/login" onClick={onClose}>Sign In</MenuLink>
                <MenuLink to="/register" onClick={onClose}>Create Account</MenuLink>
              </>
            )}
          </div>
        </nav>

        {user && (
          <div className="border-t border-gray-200 p-4 safe-bottom">
            <Button variant="outline" className="w-full" onClick={() => { onSignOut(); onClose() }}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function MenuLink({
  to,
  onClick,
  children,
}: {
  to: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-4 py-3 text-base font-medium text-gray-800 hover:bg-brand-50 active:bg-brand-100"
    >
      {children}
    </Link>
  )
}
