import Image from 'next/image'

import { createClient } from '@/lib/supabase/server'
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
  
  // Check if Supabase is configured before trying to use it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('[Dashboard Layout] Auth error:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        })
        // Don't throw - allow page to render without user
      } else {
        user = authUser
        
        if (authUser) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', authUser.id)
              .single()
            
            if (profileError) {
              console.error('[Dashboard Layout] Profile query error:', {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint,
              })
              // Table might not exist or user profile not created yet
              // Continue without role - user can still access dashboard
            } else {
              userRole = profile?.role || null
            }
          } catch (profileErr: any) {
            console.error('[Dashboard Layout] Profile fetch exception:', {
              message: profileErr?.message,
              stack: profileErr?.stack,
            })
            // Continue without role
          }
        }
      }
    } catch (error: any) {
      // Log detailed error information for debugging
      console.error('[Dashboard Layout] Fatal error:', {
        message: error?.message,
        code: (error as any)?.code,
        stack: error?.stack,
        name: error?.name,
      })
      // Don't throw - let the page render and middleware will handle auth
      // This prevents the 500 error and allows graceful degradation
    }
  } else {
    console.warn('[Dashboard Layout] Supabase not configured - env vars missing')
  }


  const navItems = [
    { href: '/dashboard', label: 'Digital Twin', iconName: 'LayoutDashboard' },
    { href: '/alerts', label: 'Alerts', iconName: 'AlertTriangle' },
    { href: '/maintenance', label: 'Maintenance', iconName: 'Wrench' },
    { href: '/assets', label: 'Assets', iconName: 'Building2' },
    { href: '/capex', label: 'Capex Planning', iconName: 'TrendingUp' },
    { href: '/sentiment', label: 'Social Pulse', iconName: 'MessageSquare' },
  ]

  // Add user management for admins and managers
  if (userRole === 'admin' || userRole === 'manager') {
    navItems.push({ href: '/users', label: 'User Management', iconName: 'Users' })
  }

  return (
    <div className="flex h-screen bg-rtr-cream">
      {/* Sidebar */}
      <aside className="w-72 bg-rtr-wine border-r border-rtr-wine-light flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-rtr-wine-light/20 flex flex-col items-center text-center space-y-3">
          <Image
            src="/images/rtr-logo.svg"
            alt="Rent the Runway logo"
            width={120}
            height={160}
            priority
            className="w-28 h-auto"
          />
          <h1 className="text-xl font-semibold tracking-wide text-white">
            Rent the Runway
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              iconName={item.iconName}
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

