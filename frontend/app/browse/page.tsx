'use client'

// frontend/app/browse/page.tsx
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import VerdictBadge from '@/components/VerdictBadge'
import { MessageCircle, Clock, Search, X } from 'lucide-react'

interface ClaimItem {
  id: string
  content: string
  verdict: 'true' | 'false' | 'misleading' | 'uncertain'
  confidence: number
  commentCount: number
  timeAgo: string
  contentType: 'text' | 'url' | 'image' | 'video'
}

const MOCK_CLAIMS: ClaimItem[] = [
  { id: '101', content: 'New climate report shows unprecedented warming trends affecting global weather patterns.', verdict: 'true', confidence: 0.92, commentCount: 24, timeAgo: '2 hours ago', contentType: 'url' },
  { id: '102', content: 'Recent vaccine study claims 98% effectiveness against new variant strains.', verdict: 'misleading', confidence: 0.76, commentCount: 18, timeAgo: '4 hours ago', contentType: 'text' },
  { id: '103', content: 'Government announces new economic policy affecting small businesses nationwide.', verdict: 'uncertain', confidence: 0.65, commentCount: 31, timeAgo: '6 hours ago', contentType: 'url' },
  { id: '104', content: 'Photo shows a shark swimming on a flooded city street during recent storms.', verdict: 'false', confidence: 0.89, commentCount: 45, timeAgo: '1 day ago', contentType: 'image' },
  { id: '105', content: 'Video claims a new engine runs entirely on water without external power.', verdict: 'false', confidence: 0.94, commentCount: 52, timeAgo: '1 day ago', contentType: 'video' },
  { id: '106', content: 'Experts say global inflation is expected to cool over the next two quarters.', verdict: 'true', confidence: 0.81, commentCount: 12, timeAgo: '3 days ago', contentType: 'text' },
  { id: '107', content: 'A common kitchen spice cures chronic diseases in 48 hours.', verdict: 'misleading', confidence: 0.71, commentCount: 39, timeAgo: '3 days ago', contentType: 'url' },
  { id: '108', content: 'Satellite images show new deforestation hotspots emerging this month.', verdict: 'true', confidence: 0.84, commentCount: 21, timeAgo: '4 days ago', contentType: 'image' },
  { id: '109', content: 'Celebrity interview claims a complete ban on all social media platforms next year.', verdict: 'uncertain', confidence: 0.52, commentCount: 11, timeAgo: '5 days ago', contentType: 'video' },
  { id: '110', content: 'New study finds no evidence of microchips in any vaccines tested.', verdict: 'true', confidence: 0.97, commentCount: 64, timeAgo: '1 week ago', contentType: 'text' },
  { id: '111', content: 'Image shows a historic building supposedly moved 10 miles without damage.', verdict: 'misleading', confidence: 0.61, commentCount: 7, timeAgo: '1 week ago', contentType: 'image' },
  { id: '112', content: 'Short clip claims a city banned all bicycles overnight.', verdict: 'false', confidence: 0.9, commentCount: 26, timeAgo: '2 weeks ago', contentType: 'video' },
]

// Lightweight example comments per claim
const MOCK_COMMENTS: Record<string, { user: string; text: string; date: string }[]> = {
  '101': [
    { user: 'alice', text: 'Link to the IPCC summary backs this up.', date: '2025-09-01' },
    { user: 'bob', text: 'Also covered by NOAA monthly report.', date: '2025-09-02' },
  ],
  '102': [
    { user: 'chris', text: 'Effectiveness depends on the cohort size; title is overstated.', date: '2025-09-05' },
  ],
}

export default function BrowsePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'discussed' | 'confidence'>('newest')
  const [page, setPage] = useState(1)
  const [commentsFor, setCommentsFor] = useState<ClaimItem | null>(null)
  const [previewFor, setPreviewFor] = useState<ClaimItem | null>(null)
  const pageSize = 9

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = MOCK_CLAIMS.filter(c => c.content.toLowerCase().includes(q))

    if (sort === 'newest') {
      list = list
    } else if (sort === 'discussed') {
      list = [...list].sort((a, b) => b.commentCount - a.commentCount)
    } else if (sort === 'confidence') {
      list = [...list].sort((a, b) => b.confidence - a.confidence)
    }

    return list
  }, [query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const resetToFirst = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const openClaim = useCallback((id: string) => router.push(`/claims/${id}`), [router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommentsFor(null)
        setPreviewFor(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Browse Claims</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{filtered.length} results</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => resetToFirst(() => setQuery(e.target.value))}
            placeholder="Search claims..."
            className="input pl-9"
          />
        </div>

        {/* Sort */}
        <div className="inline-flex border border-slate-200 rounded-lg p-1 bg-white shadow-sm w-full md:w-auto">
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${sort === 'newest' ? 'bg-primary-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            onClick={() => resetToFirst(() => setSort('newest'))}
          >
            Newest
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${sort === 'discussed' ? 'bg-primary-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            onClick={() => resetToFirst(() => setSort('discussed'))}
          >
            Most Discussed
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm ${sort === 'confidence' ? 'bg-primary-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            onClick={() => resetToFirst(() => setSort('confidence'))}
          >
            High Confidence
          </button>
        </div>
      </div>

      {/* List */}
      {pageItems.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-600">No results found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((claim) => (
            <div key={claim.id} className="card hover-raise hover:shadow-lg h-full">
              <div className="flex items-start justify-between mb-4">
                <VerdictBadge verdict={claim.verdict} confidence={claim.confidence} size="sm" />
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {claim.timeAgo}
                </div>
              </div>

              <button
                onClick={() => openClaim(claim.id)}
                className="text-left text-slate-800 mb-4 line-clamp-3 hover:text-slate-900"
                aria-label="Open claim details"
              >
                {claim.content}
              </button>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs capitalize">
                    {claim.contentType}
                  </span>
                  <button
                    onClick={() => setCommentsFor(claim)}
                    className="inline-flex items-center hover:text-slate-700"
                    aria-label="Open comments"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {claim.commentCount}
                  </button>
                </div>
                <button
                  onClick={() => router.push(`/claims/${claim.id}#comments`)}
                  className="text-primary-600 hover:text-primary-700"
                  aria-label="Open full discussion"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      )}

      {/* Comments Modal */}
      {commentsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCommentsFor(null)} />
          <div className="relative z-10 w-full max-w-xl mx-4 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Discussion ({commentsFor.commentCount})</h3>
              <button className="p-2 text-slate-500 hover:text-slate-700" onClick={() => setCommentsFor(null)} aria-label="Close comments">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-700 mb-4">{commentsFor.content}</p>
            <div className="space-y-4 max-h-80 overflow-auto pr-1">
              {(MOCK_COMMENTS[commentsFor.id] ?? [
                { user: 'guest', text: 'No comments yet. Be the first to comment on the detail page.', date: new Date().toISOString().slice(0,10) },
              ]).map((c, i) => (
                <div key={i} className="border-b last:border-b-0 border-slate-200 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{c.user}</span>
                    <span className="text-xs text-slate-500">{c.date}</span>
                  </div>
                  <p className="text-slate-700 text-sm">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary" onClick={() => openClaim(commentsFor.id)}>Open full discussion</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewFor(null)} />
          <div className="relative z-10 w-full max-w-xl mx-4 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Analysis Preview</h3>
              <button className="p-2 text-slate-500 hover:text-slate-700" onClick={() => setPreviewFor(null)} aria-label="Close preview">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <VerdictBadge verdict={previewFor.verdict} confidence={previewFor.confidence} size="sm" />
              <span className="text-xs text-slate-500">{previewFor.timeAgo}</span>
            </div>
            <p className="text-slate-800 mb-4">{previewFor.content}</p>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
              <p>
                This is a sample preview. The full page shows summary, evidence, AI reasoning, and sources.
                Confidence: {Math.round(previewFor.confidence * 100)}%.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setPreviewFor(null)}>Close</button>
              <button className="btn-primary" onClick={() => openClaim(previewFor.id)}>Open full analysis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}