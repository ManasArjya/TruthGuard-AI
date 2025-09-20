'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Plus,
} from 'lucide-react'

interface DashboardStats {
  total_claims: number
  pending_claims: number
  completed_claims: number
  rti_requests: number
  recent_claims: Array<{
    id: string
    content: string
    status: 'completed' | 'processing' | 'failed' | 'pending' | string
    created_at: string
  }>
}

function getMockStats(): DashboardStats {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  return {
    total_claims: 128,
    pending_claims: 7,
    completed_claims: 111,
    rti_requests: 10,
    recent_claims: [
      { id: '112', content: 'City plans to ban bicycles overnight.', status: 'processing', created_at: new Date(now - 1 * day).toISOString() },
      { id: '110', content: 'No evidence of microchips in vaccines.', status: 'completed', created_at: new Date(now - 2 * day).toISOString() },
      { id: '104', content: 'Shark swimming on flooded city street photo.', status: 'failed', created_at: new Date(now - 3 * day).toISOString() },
      { id: '101', content: 'Unprecedented warming trends affect weather patterns.', status: 'completed', created_at: new Date(now - 4 * day).toISOString() },
    ],
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!base) throw new Error('Missing NEXT_PUBLIC_BACKEND_URL')

      const response = await fetch(`${base}/api/v1/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = (await response.json()) as DashboardStats
      setStats(data)
      setUsingMock(false)
    } catch (error) {
      setStats(getMockStats())
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Redirecting...</div>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="card h-40" />
        </div>
      </div>
    )
  }

  const hasClaims = (stats?.recent_claims?.length ?? 0) > 0

  // ✅ Compute last 7 days activity dynamically
  const activitySeries = (() => {
    if (!stats?.recent_claims) return Array(7).fill(0)
    const today = new Date()
    const counts = Array(7).fill(0)

    stats.recent_claims.forEach(claim => {
      const claimDate = new Date(claim.created_at)
      const diffDays = Math.floor((today.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays >= 0 && diffDays < 7) {
        counts[6 - diffDays]++ // last 7 days, oldest → left
      }
    })
    return counts
  })()

  const maxVal = Math.max(...activitySeries, 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Track your fact-checking activity and submissions.</p>
          {usingMock && (
            <div className="mt-2 inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Showing sample data
            </div>
          )}
        </div>
        <Link href="/" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Claim
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Claims</span>
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.total_claims}</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Pending Analysis</span>
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div className="text-3xl font-bold text-warning-600">{stats.pending_claims}</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Completed</span>
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div className="text-3xl font-bold text-success-600">{stats.completed_claims}</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">RTI Requests</span>
              <AlertTriangle className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-primary-600">{stats.rti_requests}</div>
          </div>
        </div>
      )}

      {/* ✅ Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Activity (last 7 days)</h2>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex items-end gap-2 h-32">
          {activitySeries.map((v, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t bg-primary-500/80"
                style={{ height: `${(v / maxVal) * 100}%` }}
                title={`${v} claims`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500">Claims analyzed per day</div>
      </div>

      {/* Recent Claims */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Claims</h2>
          <Link href="/browse" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {!hasClaims ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No claims yet</h3>
            <p className="text-slate-600 mb-4">Start fact-checking by submitting your first claim.</p>
            <Link href="/" className="btn-primary">Submit First Claim</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {stats?.recent_claims?.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 truncate mb-2">{claim.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'completed'
                          ? 'bg-success-100 text-success-700'
                          : claim.status === 'processing'
                          ? 'bg-warning-100 text-warning-700'
                          : claim.status === 'failed'
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>
                <Link href={`/claims/${claim.id}`} className="ml-4 text-primary-600 hover:text-primary-700">
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
