'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from '@supabase/auth-helpers-react'
import { 
  CheckCircle, XCircle, AlertTriangle, HelpCircle, 
  Clock, MessageCircle, ExternalLink, FileText, 
  ThumbsUp, ThumbsDown, Send 
} from 'lucide-react'
import VerdictBadge from "@/components/VerdictBadge"
import CommentSection from '@/components/CommentSection'
import RTIRequestPanel from '@/components/RTIRequestPanel'

interface Claim {
  id: string
  content: string
  content_type: string
  original_url?: string
  status: string
  created_at: string
}

interface Analysis {
  id: string
  verdict: 'true' | 'false' | 'misleading' | 'uncertain'
  confidence_score: number
  summary: string
  evidence: Array<{
    source: string
    excerpt: string
    credibility_score?: number
    url?: string
  }>
  sources: Array<{
    title: string
    url?: string
    type: string
    verified: boolean
  }>
  ai_reasoning: string
}

interface ClaimDetail {
  claim: Claim
  analysis?: Analysis
  comment_count: number
}

export default function ClaimDetailPage() {
  const params = useParams()
  const session = useSession()
  const [claimDetail, setClaimDetail] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const claimId = params.id as string

  useEffect(() => {
    fetchClaimDetail()
    
    // Poll for updates if claim is still processing
    const interval = setInterval(() => {
      if (claimDetail?.claim.status === 'processing') {
        fetchClaimDetail()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [claimId, claimDetail?.claim.status])

  const fetchClaimDetail = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/claims/${claimId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch claim')
      }

      const data = await response.json()
      setClaimDetail(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-6"></div>
          <div className="card">
            <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !claimDetail) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="card">
          <XCircle className="mx-auto h-16 w-16 text-danger-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Claim Not Found</h1>
          <p className="text-slate-600">
            {error || 'The claim you are looking for does not exist or has been removed.'}
          </p>
        </div>
      </div>
    )
  }

  const { claim, analysis } = claimDetail

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Claim Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <VerdictBadge 
                verdict={analysis?.verdict} 
                confidence={analysis?.confidence_score}
                processing={claim.status === 'processing'}
              />
              <span className="text-sm text-slate-500">
                {new Date(claim.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Fact-Check Analysis
            </h1>
          </div>
        </div>

        {/* Original Claim */}
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Original Claim
          </h2>
          <p className="text-slate-700 leading-relaxed">{claim.content}</p>
          
          {claim.original_url && (
            <div className="mt-4">
              <a
                href={claim.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Original Source
              </a>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {claim.status === 'processing' ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Analysis in Progress
            </h3>
            <p className="text-slate-600">
              Our AI is analyzing this claim. This typically takes 30-60 seconds.
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Analysis Summary</h3>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Evidence */}
            {analysis.evidence.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Supporting Evidence</h3>
                <div className="space-y-4">
                  {analysis.evidence.map((evidence, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{evidence.source}</h4>
                        {evidence.credibility_score && (
                          <span className="text-sm text-slate-500">
                            Credibility: {Math.round(evidence.credibility_score * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">{evidence.excerpt}</p>
                      {evidence.url && (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                        >
                          Read full source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            <div>
              <h3 className="text-lg font-semibold mb-3">AI Analysis Reasoning</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 leading-relaxed">{analysis.ai_reasoning}</p>
              </div>
            </div>

            {/* Sources */}
            {analysis.sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Referenced Sources</h3>
                <div className="grid gap-3">
                  {analysis.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">{source.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <span>Type: {source.type}</span>
                          {source.verified && (
                            <span className="inline-flex items-center text-success-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="mx-auto h-12 w-12 text-danger-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Analysis Failed
            </h3>
            <p className="text-slate-600">
              We encountered an issue analyzing this claim. Please try submitting it again.
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Comments Section */}
        <div className="lg:col-span-2">
          <div id="comments">
            <CommentSection claimId={claimId} />
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          {/* RTI Request Panel */}
          <RTIRequestPanel claimId={claimId} claimContent={claim.content} />
          
          {/* Share & Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Share This Analysis</h3>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1">
                Copy Link
              </button>
              <button className="btn-secondary px-3">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}