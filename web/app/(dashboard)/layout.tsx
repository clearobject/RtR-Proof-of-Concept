import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  Wrench,
  Building2,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { NavLink } from '@/components/dashboard/nav-link'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let userRole: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
    
    if (authUser) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()
      userRole = profile?.role || null
    }
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

  // Add user management for admins and managers
  if (userRole === 'admin' || userRole === 'manager') {
    navItems.push({ href: '/users', label: 'User Management', icon: Users })
  }

  return (
    <div className="flex h-screen bg-rtr-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-rtr-wine border-r border-rtr-wine-light flex flex-col">
        <div className="p-6 border-b border-rtr-wine-light/20">
          <h1 className="text-xl font-bold text-white">
            Rent the Runway
          </h1>
          <p className="text-sm text-white/80 mt-1">Operations Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>
        <div className="p-4 border-t border-rtr-wine-light/20">
          <div className="mb-4">
            <p className="text-xs text-white/70 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-white">
              {user?.email || 'User'}
            </p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-rtr-cream">
        {children}
      </main>
    </div>
  )
}

