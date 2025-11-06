import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Wrench,
  Building2,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // If Supabase is not configured, user will be null
    // Middleware will handle redirect
    // Silently handle errors - middleware will redirect if needed
    // Don't log during build to avoid build failures
  }


  const navItems = [
    { href: '/dashboard', label: 'Digital Twin', icon: LayoutDashboard },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/assets', label: 'Assets', icon: Building2 },
    { href: '/capex', label: 'Capex Planning', icon: TrendingUp },
    { href: '/sentiment', label: 'Social Pulse', icon: MessageSquare },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Rent the Runway
          </h1>
          <p className="text-sm text-gray-600 mt-1">Operations Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-900">
              {user?.email || 'User'}
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

