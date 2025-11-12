'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

/**
 * Legacy machine detail page - redirects to assets page
 * This page is kept for backward compatibility but redirects to the new assets page
 */
export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const machineId = params.id as string

  useEffect(() => {
    // Try to find the asset by alias (machine ID) or ID
    const redirectToAsset = async () => {
      try {
        const supabase = createClient()
        
        // First try to find by alias (old machine IDs were often aliases)
        const { data: assetByAlias } = await supabase
          .from('assets')
          .select('id')
          .eq('alias', machineId)
          .maybeSingle()
        
        if (assetByAlias) {
          router.replace(`/assets/${assetByAlias.id}`)
          return
        }
        
        // If not found by alias, try as UUID
        if (machineId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const { data: assetById } = await supabase
            .from('assets')
            .select('id')
            .eq('id', machineId)
            .maybeSingle()
          
          if (assetById) {
            router.replace(`/assets/${assetById.id}`)
            return
          }
        }
        
        // If not found, redirect to assets list
        router.replace('/assets')
      } catch (error) {
        console.error('Error redirecting machine page:', error)
        router.replace('/assets')
      }
    }
    
    if (machineId) {
      redirectToAsset()
    } else {
      router.replace('/assets')
    }
  }, [machineId, router])

  return (
    <div className="p-8">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to asset page...</p>
      </div>
    </div>
  )
}
