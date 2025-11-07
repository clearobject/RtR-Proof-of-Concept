'use client'

import { useState, useEffect } from 'react'
import { SocialPost } from '@/lib/types'
import { PostCard } from '@/components/social-pulse/post-card'
import { PostDetailModal } from '@/components/social-pulse/post-detail-modal'
import { Filters, SocialPostFilters } from '@/components/social-pulse/filters'
import { BrandHealthDashboard } from '@/components/social-pulse/brand-health-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SentimentPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SocialPostFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [showDashboard, setShowDashboard] = useState(true)
  const postsPerPage = 20

  useEffect(() => {
    loadPosts()
  }, [filters, currentPage])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.platform) params.append('platform', filters.platform)
      if (filters.category) params.append('category', filters.category)
      if (filters.minSentiment) params.append('min_sentiment', filters.minSentiment)
      if (filters.maxSentiment) params.append('max_sentiment', filters.maxSentiment)
      if (filters.startDate) params.append('start_date', filters.startDate)
      if (filters.endDate) params.append('end_date', filters.endDate)
      if (filters.search) params.append('search', filters.search)
      
      params.append('limit', postsPerPage.toString())
      params.append('offset', ((currentPage - 1) * postsPerPage).toString())

      const response = await fetch(`/api/social/posts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setTotalPosts(data.total || 0)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Pulse</h1>
          <p className="text-gray-600 mt-2">
            Customer sentiment analysis and brand health monitoring
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
        </Button>
      </div>

      {/* Brand Health Dashboard */}
      {showDashboard && (
        <div>
          <BrandHealthDashboard />
        </div>
      )}

      {/* Filters */}
      <Filters filters={filters} onFiltersChange={setFilters} />

      {/* Posts Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Social Posts ({totalPosts.toLocaleString()})
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No posts found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  )
}
