'use client'

import Link from 'next/link'
import { Shield, Github, Twitter, Mail, ExternalLink, BookOpen, HelpCircle, Info, Lock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-slate-900">TruthGuard AI</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              AI-powered fact-checking with community verification. Building trust through transparency.
            </p>
            <div className="flex items-center gap-3 text-slate-500">
              <a className="hover:text-slate-800" aria-label="GitHub" href="#">
                <Github className="w-5 h-5" />
              </a>
              <a className="hover:text-slate-800" aria-label="Twitter" href="#">
                <Twitter className="w-5 h-5" />
              </a>
              <a className="hover:text-slate-800" aria-label="Email" href="mailto:team@truthguard.ai">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link></li>
              <li><Link href="/browse" className="text-slate-600 hover:text-slate-900">Browse Claims</Link></li>
              <li><Link href="/about" className="text-slate-600 hover:text-slate-900">About</Link></li>
              <li><Link href="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link></li>
            </ul>
          </div>

          {/* Know More */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Know More</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <Link href="/about#mission" className="text-slate-600 hover:text-slate-900">Our Mission</Link>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <Link href="/about#how-it-works" className="text-slate-600 hover:text-slate-900">How It Works</Link>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <Link href="/about#faq" className="text-slate-600 hover:text-slate-900">FAQ</Link>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <Link href="/about#trust" className="text-slate-600 hover:text-slate-900">Trust & Transparency</Link>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/about#learn-more" className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm">
                Know More <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Stay Updated</h4>
            <p className="text-sm text-slate-600 mb-3">Get product updates and research highlights.</p>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Your email" />
              <button className="btn-primary">Subscribe</button>
            </div>
            <p className="text-xs text-slate-500 mt-2">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-xs text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TruthGuard AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about#privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/about#terms" className="hover:text-slate-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}