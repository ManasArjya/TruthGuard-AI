// frontend/components/FeaturedClaims.tsx
import Link from 'next/link'
import VerdictBadge from './VerdictBadge'
import { MessageCircle, Clock } from 'lucide-react'

export default function FeaturedClaims() {
  const featuredClaims = [
    {
      id: '1',
      content: 'New climate report shows unprecedented warming trends affecting global weather patterns.',
      verdict: 'true' as const,
      confidence: 0.92,
      commentCount: 24,
      timeAgo: '2 hours ago'
    },
    {
      id: '2', 
      content: 'Recent vaccine study claims 98% effectiveness against new variant strains.',
      verdict: 'misleading' as const,
      confidence: 0.76,
      commentCount: 18,
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      content: 'Government announces new economic policy affecting small businesses nationwide.',
      verdict: 'uncertain' as const,
      confidence: 0.65,
      commentCount: 31,
      timeAgo: '6 hours ago'
    }
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Recently Analyzed Claims</h2>
        <p className="text-slate-600 max-w-2xl mx-auto px-2">
          See what the community is fact-checking and join the discussion on important topics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {featuredClaims.map((claim) => (
          <Link key={claim.id} href={`/claims/${claim.id}`} className="block">
            <div className="card hover:shadow-lg hover-raise cursor-pointer h-full transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <VerdictBadge 
                  verdict={claim.verdict}
                  confidence={claim.confidence}
                  size="sm"
                />
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {claim.timeAgo}
                </div>
              </div>
              
              <p className="text-slate-700 mb-4 line-clamp-3">
                {claim.content}
              </p>
              
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {claim.commentCount} comments
                </div>
                <span>View Analysis →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/browse" className="btn-primary">
          Browse All Claims
        </Link>
      </div>
    </section>
  )
}