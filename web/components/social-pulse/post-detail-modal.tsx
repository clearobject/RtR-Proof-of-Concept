'use client'

import { SocialPost } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  MessageCircle, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ExternalLink
} from 'lucide-react'
import { useMemo } from 'react'

interface PostDetailModalProps {
  post: SocialPost | null
  onClose: () => void
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

export function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  if (!post) return null

  const PlatformIcon = platformIcons[post.platform] || MessageCircle
  const platformColor = platformColors[post.platform] || 'text-gray-600'

  const sentimentInfo = useMemo(() => {
    if (post.sentiment_score >= 9) {
      return { label: 'Promoter', color: 'success', trend: TrendingUp, description: 'Highly satisfied customer' }
    } else if (post.sentiment_score >= 7) {
      return { label: 'Passive', color: 'warning', trend: Minus, description: 'Neutral or satisfied customer' }
    } else {
      return { label: 'Detractor', color: 'danger', trend: TrendingDown, description: 'Dissatisfied customer' }
    }
  }, [post.sentiment_score])

  const TrendIcon = sentimentInfo.trend

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PlatformIcon className={`w-6 h-6 ${platformColor}`} />
              <span className="capitalize">{post.platform} Post</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Author and Metadata */}
          <div className="flex items-center justify-between">
            <div>
              {post.author && (
                <p className="text-sm text-gray-600">@{post.author}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Posted {formatDate(post.posted_at)}
              </p>
            </div>
            <Badge variant={sentimentInfo.color as any} className="text-base px-3 py-1">
              <TrendIcon className="w-4 h-4 mr-1" />
              {post.sentiment_score}/10 - {sentimentInfo.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Engagement Metrics */}
          {post.engagement_count !== undefined && post.engagement_count > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm">
                {post.engagement_count.toLocaleString()} engagements
              </span>
            </div>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {post.category && (
              <Badge variant="neutral">
                Category: {post.category}
              </Badge>
            )}
            {post.occasion && (
              <Badge variant="neutral">
                Occasion: {post.occasion}
              </Badge>
            )}
          </div>

          {/* Sentiment Analysis */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Sentiment Analysis</h4>
            <p className="text-sm text-gray-600 mb-2">{sentimentInfo.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  post.sentiment_score >= 9
                    ? 'bg-green-500'
                    : post.sentiment_score >= 7
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(post.sentiment_score / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="secondary" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Original
            </Button>
            <Button variant="secondary" size="sm">
              Mark as Responded
            </Button>
            <Button variant="secondary" size="sm">
              Escalate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

