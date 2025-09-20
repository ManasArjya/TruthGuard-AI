'use client'

import { useEffect, useState } from 'react'

type Stat = {
  label: string
  base: number
  factor?: number // growth factor applied with scroll progress
  isPercent?: boolean
  decimals?: number
  change: number // percent change this month (display only)
}

export default function StatsSection() {
  // Scroll progress across the whole page: 0 (top) → 1 (bottom)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight)
      const p = Math.min(1, Math.max(0, doc.scrollTop / max))
      setProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const stats: Stat[] = [
    { label: 'Claims Analyzed', base: 10247, factor: 0.35, change: 12 },
    { label: 'Community Members', base: 5891, factor: 0.3, change: 8 },
    { label: 'RTI Requests', base: 342, factor: 0.5, change: 23 },
    { label: 'Accuracy Rate', base: 94.2, isPercent: true, decimals: 1, change: 2 },
  ]

  // Derive a scroll-boosted value for each stat
  const getDisplayValue = (s: Stat) => {
    if (s.isPercent) {
      // Increase towards 100% as you scroll; gentle approach
      const target = 100
      const extra = (target - s.base) * (progress * 0.8) // up to 80% of remaining gap
      return Math.min(target, s.base + extra)
    }
    const factor = s.factor ?? 0.3
    // Increase by a fraction of base as progress rises
    return s.base + s.base * factor * progress
  }

  const formatNumber = (v: number, decimals = 0, group = true) => {
    if (group) {
      return Number(v.toFixed(decimals)).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    }
    return v.toFixed(decimals)
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Trust Through Transparency</h2>
        <p className="text-slate-600 max-w-2xl mx-auto px-2">
          Join thousands of users who rely on TruthGuard AI for accurate, 
          AI-powered fact-checking and community-driven verification.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
        {stats.map((stat) => {
          const value = getDisplayValue(stat)
          const isPercent = !!stat.isPercent
          const decimals = stat.decimals ?? (isPercent ? 1 : 0)
          return (
            <div key={stat.label} className="text-center p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1 md:mb-2 tabular-nums">
                {formatNumber(value, decimals, !isPercent)}{isPercent ? '%' : ''}
              </div>
              <div className="text-xs md:text-sm text-slate-600 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-success-600 font-medium">
                {stat.change}% this month
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}