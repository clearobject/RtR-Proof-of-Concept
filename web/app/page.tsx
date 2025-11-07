'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Client-side redirect to login
    // Middleware will handle auth checks
    router.replace('/login')
  }, [router])

  // Show content immediately - don't wait for useEffect
  // This ensures something renders even if JavaScript fails
  return (
    <div className="flex min-h-screen items-center justify-center bg-rtr-cream">
      <div className="text-center">
        <p className="text-rtr-slate">Redirecting to login...</p>
        <p className="text-sm text-rtr-slate mt-2">
          <a href="/login" className="text-rtr-wine underline">
            Click here if you are not redirected
          </a>
        </p>
      </div>
    </div>
  )
}
