'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Layout/AuthProvider';
import { postsApi } from '@/lib/api';
import { Post } from '@/types';
import { formatDate } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  PenSquare, Eye, MessageCircle, Clock, Trash2, Edit, Plus,
  BookOpen, FileText, Archive, Globe,
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const map = {
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-yellow-100 text-yellow-700',
    ARCHIVED: 'bg-brand-100 text-brand-500',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status as keyof typeof map]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'READER') { router.push('/blog'); return; }

    postsApi.getMy(token!).then(setPosts).catch(() => toast.error('Failed to load posts')).finally(() => setLoading(false));
  }, [user, token, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await postsApi.delete(id, token!);
      setPosts((p) => p.filter((post) => post.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = activeTab === 'all' ? posts : posts.filter((p) => p.status === activeTab.toUpperCase());
  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'PUBLISHED').length,
    draft: posts.filter((p) => p.status === 'DRAFT').length,
    archived: posts.filter((p) => p.status === 'ARCHIVED').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-sans text-3xl font-bold text-brand-900">Dashboard</h1>
          <p className="text-brand-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Posts', value: counts.all, icon: BookOpen, color: 'text-accent' },
          { label: 'Published', value: counts.published, icon: Globe, color: 'text-green-600' },
          { label: 'Drafts', value: counts.draft, icon: FileText, color: 'text-yellow-600' },
          { label: 'Archived', value: counts.archived, icon: Archive, color: 'text-brand-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-brand-100 rounded-xl p-5">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold text-brand-900">{value}</p>
            <p className="text-sm text-brand-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-brand-100 mb-6">
        {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-brand-500 hover:text-brand-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-2 text-xs opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Post list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-brand-400">
          <PenSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No posts yet</p>
          <Link href="/dashboard/new" className="text-accent hover:underline text-sm">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-brand-50">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-start justify-between gap-4 py-5 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={post.status} />
                  {post.category && (
                    <span className="text-xs text-brand-400">{post.category.name}</span>
                  )}
                </div>
                <h3 className="font-sans font-semibold text-brand-900 text-base leading-snug mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-brand-400">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime}m</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post._count.comments}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {post.status === 'PUBLISHED' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="p-2 text-brand-400 hover:text-accent rounded-lg hover:bg-brand-50 transition-colors"
                    title="View post"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="p-2 text-brand-400 hover:text-accent rounded-lg hover:bg-brand-50 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-brand-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
