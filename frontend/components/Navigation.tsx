'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Shield, Menu, X, User, LogOut, Home, Search, BarChart3, Settings, Bell } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse Claims', href: '/browse', icon: Search },
    { name: 'About', href: '/about', icon: Shield },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass border-b backdrop-saturate-150 shadow-soft' 
          : 'bg-white/80 border-b border-transparent'
      }`}>
        <div className="container-responsive">
          <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center space-x-2 sm:space-x-3 group transition-transform duration-200 hover:scale-105"
              >
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 text-primary-600 group-hover:text-primary-700 transition-colors" />
                <span className="font-bold text-lg sm:text-xl lg:text-2xl text-slate-900 group-hover:text-primary-700 transition-colors">
                  <span className="hidden xs:inline">TruthGuard AI</span>
                  <span className="xs:hidden">TG AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigation.map((item) => {
                if (item.requiresAuth && !session) return null
                const isActive = isActivePath(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 xl:px-4 py-2.5 rounded-lg text-sm xl:text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-soft'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 xl:w-5 xl:h-5 ${
                      isActive ? 'text-primary-600' : ''
                    }`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              {session ? (
                <div className="flex items-center space-x-2 xl:space-x-3">
                  {/* Notifications */}
                  <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">3</span>
                    </span>
                  </button>

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 xl:space-x-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 xl:px-4 py-2.5 rounded-lg text-sm xl:text-base font-medium transition-colors">
                      <User className="w-4 h-4 xl:w-5 xl:h-5" />
                      <span className="hidden xl:block truncate max-w-[120px]">
                        {session.user?.email?.split('@')[0]}
                      </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {session.user?.email}
                          </p>
                          <p className="text-xs text-slate-500">Signed in</p>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <div className="border-t border-slate-100 my-2"></div>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 xl:space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 xl:px-4 py-2.5 rounded-lg text-sm xl:text-base font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm xl:text-base"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile/Tablet Actions */}
            <div className="flex lg:hidden items-center space-x-2 sm:space-x-3">
              {session && (
                <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">3</span>
                  </span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors touch-manipulation"
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
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
      </nav>

      {/* Mobile/Tablet Navigation Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Menu */}
          <div className="lg:hidden fixed top-16 sm:top-18 right-4 sm:right-6 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-large border border-slate-200 animate-slide-down overflow-hidden">
            <div className="py-4 sm:py-6">
              {/* User Section (Mobile) */}
              {session && (
                <div className="px-4 sm:px-6 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {session.user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="px-2 sm:px-4 space-y-1">
                {navigation.map((item) => {
                  if (item.requiresAuth && !session) return null
                  const isActive = isActivePath(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-primary-600' : 'text-slate-500'
                      }`} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
              
              {/* Auth Section */}
              {session ? (
                <div className="px-2 sm:px-4 mt-4 pt-4 border-t border-slate-100 space-y-1">
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5 flex-shrink-0 text-slate-500" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-left transition-colors"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="px-2 sm:px-4 mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 text-center rounded-xl text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full px-3 sm:px-4 py-3 sm:py-3.5 text-center rounded-xl text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}