'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavLinkProps {
  href: string
  label: string
  icon: LucideIcon
}

export function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/90 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  )
}

