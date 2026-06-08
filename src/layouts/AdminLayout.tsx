import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/promotions', label: 'Promotions' },
  { to: '/admin/settings', label: 'Settings' },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="border-b border-gray-200 p-6">
          <Link to="/" className="text-lg font-bold text-brand-900">OAK Admin</Link>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-900 text-white'
                    : 'text-gray-700 hover:bg-brand-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-3 py-3">
            <Link to="/admin" className="text-lg font-bold text-brand-900">OAK Admin</Link>
            <Link
              to="/"
              className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-brand-700 active:bg-brand-50"
            >
              ← Store
            </Link>
          </div>
          <nav className="grid grid-cols-3 gap-1.5 border-t border-gray-100 px-3 py-2 sm:grid-cols-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-[40px] items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium leading-tight sm:text-xs ${
                    isActive ? 'bg-brand-900 text-white' : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
