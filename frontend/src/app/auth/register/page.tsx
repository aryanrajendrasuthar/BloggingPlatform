'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/components/Layout/AuthProvider';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AUTHOR' });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await authApi.register(form);
      login(token, user);
      toast.success(`Welcome, ${user.name}!`);
      router.push(user.role === 'AUTHOR' || user.role === 'ADMIN' ? '/dashboard/new' : '/blog');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="font-bold text-xl text-brand-900">Inkwell</span>
          </Link>
          <h1 className="font-sans text-3xl font-bold text-brand-900">Create account</h1>
          <p className="text-brand-500 mt-2">Join our community of writers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-2xl p-8 shadow-sm space-y-5">
          {[
            { label: 'Full name', key: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '8+ characters' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-brand-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={placeholder}
                required
                minLength={key === 'password' ? 8 : undefined}
                className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">I want to…</label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="AUTHOR">Write and publish posts</option>
              <option value="READER">Read and comment</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
