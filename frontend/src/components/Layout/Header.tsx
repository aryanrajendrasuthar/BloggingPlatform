'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PenSquare, BookOpen, User, LogOut, Menu, X, Rss } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isAuthor = user?.role === 'AUTHOR' || user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-sans font-bold text-xl text-brand-900 hover:text-accent transition-colors"
        >
          <BookOpen className="w-6 h-6 text-accent" strokeWidth={2} />
          <span>Inkwell</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blog" className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors">
            Blog
          </Link>
          <Link href="/api/rss" className="text-brand-400 hover:text-accent transition-colors" title="RSS Feed" target="_blank">
            <Rss className="w-4 h-4" />
          </Link>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                Get started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {isAuthor && (
                <Link
                  href="/dashboard/new"
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  Write
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-brand-600 hover:text-brand-900"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-100 bg-white px-4 py-4 space-y-3">
          <Link href="/blog" className="block text-sm font-medium text-brand-700" onClick={() => setMobileOpen(false)}>
            Blog
          </Link>
          {!user ? (
            <>
              <Link href="/auth/login" className="block text-sm text-brand-600" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link href="/auth/register" className="block text-sm text-accent font-medium" onClick={() => setMobileOpen(false)}>
                Get started
              </Link>
            </>
          ) : (
            <>
              {isAuthor && (
                <Link href="/dashboard/new" className="block text-sm text-accent font-medium" onClick={() => setMobileOpen(false)}>
                  Write a post
                </Link>
              )}
              <Link href="/dashboard" className="block text-sm text-brand-700" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm text-brand-400">
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
