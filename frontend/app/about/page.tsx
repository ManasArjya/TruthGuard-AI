'use client'

import { Shield, CheckCircle, Globe, Users, Sparkles, Cpu, BookOpen, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const highlights = [
    { icon: Cpu, title: 'AI-Powered Verification', text: 'Advanced LLMs and retrieval augmentations analyze claims with transparent reasoning.' },
    { icon: Users, title: 'Community Wisdom', text: 'Expert and community feedback improve accuracy and context over time.' },
    { icon: Globe, title: 'Open Sources', text: 'Evidence links to verifiable sources so you can inspect everything yourself.' },
    { icon: Shield, title: 'Trust by Design', text: 'Bias controls, source ratings, and transparent confidence scores.' },
  ]

  const timeline = [
    { year: '2024', title: 'Concept & Prototype', text: 'Built the first version to combat misinformation at scale.' },
    { year: '2025', title: 'Community Launch', text: 'Introduced open discussions, expert badges, and RTI workflows.' },
  ]

  const faqs = [
    { q: 'How does TruthGuard AI verify claims?', a: 'We combine AI analysis with citation retrieval and community review. Each claim shows a verdict, confidence, sources, and reasoning.' },
    { q: 'Are sources peer-reviewed?', a: 'We rank sources by credibility and indicate verification status. You can see and evaluate the links yourself.' },
    { q: 'Is my data private?', a: 'We store only what is necessary and provide clear privacy controls. See Privacy in the footer.' },
  ]

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-sky-50 border">
        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
          <div className="flex items-start gap-4 mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              About TruthGuard AI
            </h1>
          </div>
          <p className="max-w-3xl text-slate-700 text-lg">
            We help people navigate misinformation using transparent AI analysis and community-driven verification.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/browse" className="btn-primary inline-flex items-center">Explore Claims <ArrowRight className="w-4 h-4 ml-2" /></Link>
            <a href="#learn-more" className="btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-200/40 rounded-full blur-3xl" />
      </section>

      {/* Highlights */}
      <section id="how-it-works">
        <h2 className="text-2xl font-bold mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((h) => (
            <div key={h.title} className="card hover-raise h-full">
              <div className="flex items-center gap-3 mb-2">
                <h.icon className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">{h.title}</h3>
              </div>
              <p className="text-slate-600 text-sm">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-slate-700 mb-3">
            Empower everyone to evaluate claims quickly with transparent, evidence-backed analysis.
          </p>
          <ul className="space-y-2 text-slate-700 text-sm">
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success-600 mt-0.5" /> Transparent AI reasoning and confidence</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success-600 mt-0.5" /> Verifiable sources with credibility indicators</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-success-600 mt-0.5" /> Community discussion to challenge and refine</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">What makes us different?</h3>
          <p className="text-slate-600 text-sm">
            TruthGuard focuses on transparency. We show not just verdicts, but also evidence, sources, and reasoning used by the AI and the community.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Journey</h2>
        <div className="relative pl-6">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-6">
            {timeline.map((t) => (
              <div key={t.year} className="relative">
                <div className="absolute -left-1 top-1.5 w-3 h-3 bg-primary-600 rounded-full" />
                <div className="card">
                  <div className="text-sm text-primary-600 font-medium">{t.year}</div>
                  <div className="font-semibold">{t.title}</div>
                  <p className="text-slate-600 text-sm">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <h2 className="text-2xl font-bold mb-6">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {faqs.map((f) => (
            <div key={f.q} className="card">
              <div className="font-medium mb-1">{f.q}</div>
              <p className="text-slate-600 text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn More & Policies anchors for footer links */}
      <section id="learn-more" className="card">
        <h2 className="text-2xl font-bold mb-2">Learn More</h2>
        <p className="text-slate-600 text-sm mb-3">
          Dive into our methodology, models, and data practices.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/browse" className="btn-secondary">Browse Latest Claims</Link>
          <a href="#trust" className="btn-secondary">Trust & Transparency</a>
          <a href="#privacy" className="btn-secondary">Privacy</a>
          <a href="#terms" className="btn-secondary">Terms</a>
        </div>
      </section>

      <section id="trust" className="card">
        <h2 className="text-xl font-semibold mb-2">Trust & Transparency</h2>
        <p className="text-slate-600 text-sm">We publish how verdicts are reached and expose source credibility scoring. Feedback loops improve results safely.</p>
      </section>

      <section id="privacy" className="card">
        <h2 className="text-xl font-semibold mb-2">Privacy</h2>
        <p className="text-slate-600 text-sm">We minimize data collection and provide controls. Contact us for data requests.</p>
      </section>

      <section id="terms" className="card">
        <h2 className="text-xl font-semibold mb-2">Terms</h2>
        <p className="text-slate-600 text-sm">By using TruthGuard AI, you agree to use content responsibly and respect community guidelines.</p>
      </section>
    </div>
  )
}