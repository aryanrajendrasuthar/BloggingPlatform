import Link from 'next/link';
import { BookOpen, Rss } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-900">
            <BookOpen className="w-5 h-5 text-accent" />
            <span>Inkwell</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-brand-500">
            <Link href="/blog" className="hover:text-brand-900 transition-colors">Blog</Link>
            <Link href="/api/rss" className="hover:text-brand-900 transition-colors flex items-center gap-1" target="_blank">
              <Rss className="w-3.5 h-3.5" /> RSS
            </Link>
            <Link href="/api/sitemap.xml" className="hover:text-brand-900 transition-colors" target="_blank">Sitemap</Link>
          </div>
          <p className="text-sm text-brand-400">
            &copy; {new Date().getFullYear()} Inkwell
          </p>
        </div>
      </div>
    </footer>
  );
}
