'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/Layout/AuthProvider';
import toast from 'react-hot-toast';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.login({ email, password });
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-accent mb-6">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-xl text-brand-900">Inkwell</span>
          </Link>
          <h1 className="font-sans text-3xl font-bold text-brand-900">Welcome back</h1>
          <p className="text-brand-500 mt-2">Sign in to continue writing</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-2xl p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-brand-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-accent hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
