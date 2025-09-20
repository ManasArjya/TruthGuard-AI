// frontend/components/CommentSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { MessageCircle, ThumbsUp, ThumbsDown, Send, User } from 'lucide-react'

interface CommentSectionProps {
  claimId: string
}

interface Comment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  is_expert_response: boolean
  user: {
    full_name?: string
    email: string
    is_expert: boolean
    expert_domain?: string
  }
  created_at: string
  user_vote?: 'up' | 'down'
}

export default function CommentSection({ claimId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const session = useSession()

  useEffect(() => {
    fetchComments()
  }, [claimId])

  const fetchComments = async () => {
    try {
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments/${claimId}`,
        { headers }
      )
      
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitComment = async () => {
    if (!session || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            content: newComment,
            claim_id: claimId
          })
        }
      )

      if (response.ok) {
        setNewComment('')
        fetchComments() // Refresh comments
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!session) return

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/comments/${commentId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ vote_type: voteType })
        }
      )

      fetchComments() // Refresh comments
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 mr-2" />
        <h2 className="text-xl font-semibold">
          Discussion ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {session ? (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts, evidence, or ask questions..."
            className="textarea mb-4 resize-none"
            rows={4}
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Be respectful and provide sources when possible
            </div>
            <button
              onClick={submitComment}
              disabled={!newComment.trim() || submitting}
              className="btn-primary"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Posting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </div>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center">
          <p className="text-slate-600">
            <a href="/auth/login" className="text-primary-600 hover:text-primary-700">
              Sign in
            </a>{' '}
            to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-slate-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-slate-900">
                      {comment.user.full_name || comment.user.email.split('@')[0]}
                    </span>
                    {comment.user.is_expert && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Expert
                      </span>
                    )}
                    <span className="text-sm text-slate-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(comment.id, 'up')}
                      className={`flex items-center space-x-1 text-sm ${
                        comment.user_vote === 'up'
                          ? 'text-success-600'
                          : 'text-slate-500 hover:text-success-600'
                      } transition-colors`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.upvotes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleVote(comment.id, 'down')}
                      className={`flex items-center space-x-1 text-sm ${
                        comment.user_vote === 'down'
                          ? 'text-danger-600'
                          : 'text-slate-500 hover:text-danger-600'
                      } transition-colors`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{comment.downvotes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}