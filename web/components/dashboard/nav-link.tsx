'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  Building2,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Map icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Wrench,
  Building2,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Users,
}

interface NavLinkProps {
  href: string
  label: string
  iconName: string
}

export function NavLink({ href, label, iconName }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  
  // Get the icon component from the map
  const Icon = iconMap[iconName] || LayoutDashboard

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white hover:bg-white/10'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 text-white" />
      <span className="text-white">{label}</span>
    </Link>
  )
}

