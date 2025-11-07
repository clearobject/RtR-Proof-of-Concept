'use client'

import { SocialPost } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  MessageCircle, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useMemo } from 'react'

interface PostCardProps {
  post: SocialPost
  onClick?: () => void
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: MessageCircle,
  reddit: MessageCircle,
  trustpilot: MessageCircle,
}

const platformColors = {
  instagram: 'text-pink-600',
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  tiktok: 'text-black',
  reddit: 'text-orange-500',
  trustpilot: 'text-green-600',
}

export function PostCard({ post, onClick }: PostCardProps) {
  const PlatformIcon = platformIcons[post.platform] || MessageCircle
  const platformColor = platformColors[post.platform] || 'text-gray-600'

  const sentimentInfo = useMemo(() => {
    if (post.sentiment_score >= 9) {
      return { label: 'Promoter', color: 'success', trend: TrendingUp }
    } else if (post.sentiment_score >= 7) {
      return { label: 'Passive', color: 'warning', trend: Minus }
    } else {
      return { label: 'Detractor', color: 'danger', trend: TrendingDown }
    }
  }, [post.sentiment_score])

  const TrendIcon = sentimentInfo.trend

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <PlatformIcon className={`w-5 h-5 ${platformColor}`} />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {post.platform}
            </span>
            {post.author && (
              <span className="text-sm text-gray-500">@{post.author}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={sentimentInfo.color as any}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {post.sentiment_score}/10
            </Badge>
          </div>
        </div>

        <p className="text-gray-800 mb-3 line-clamp-3">{post.content}</p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.engagement_count !== undefined && post.engagement_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.engagement_count.toLocaleString()}</span>
              </div>
            )}
            <span>{formatDate(post.posted_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            {post.category && (
              <Badge variant="neutral" className="text-xs">
                {post.category}
              </Badge>
            )}
            {post.occasion && (
              <Badge variant="neutral" className="text-xs">
                {post.occasion}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

