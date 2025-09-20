'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Shield, Menu, X, User, LogOut, Home, Search, BarChart3 } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse Claims', href: '/browse', icon: Search },
    { name: 'About', href: '/about', icon: Shield },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
  ]

  return (
    <nav className="glass border-b sticky top-0 z-50 backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 md:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-7 w-7 md:h-8 md:w-8 text-primary-600" />
              <span className="font-bold text-lg md:text-xl text-slate-900">
                TruthGuard AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-8">
            {navigation.map((item) => {
              if (item.requiresAuth && !session) return null
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block truncate max-w-[120px]">
                    {session.user?.email?.split('@')[0]}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              if (item.requiresAuth && !session) return null
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {!session && (
              <div className="border-t border-slate-200 mt-4 pt-4">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
