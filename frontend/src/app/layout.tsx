import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/Layout/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'Blogging Platform',
    template: '%s | Blogging Platform',
  },
  description: 'A premium platform for writers and readers.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'Blogging Platform',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': '/api/rss',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="Blogging Platform RSS" href="/api/rss" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', borderRadius: '8px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
