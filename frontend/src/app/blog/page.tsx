import { Suspense } from 'react';
import { postsApi, taxonomyApi } from '@/lib/api';
import { PostCard } from '@/components/Post/PostCard';
import { Category, Post } from '@/types';
import Link from 'next/link';

export const revalidate = 60;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string; search?: string }>;
}

async function getData(params: Awaited<BlogPageProps['searchParams']>) {
  const apiParams: Record<string, string> = {
    page: params.page || '1',
    limit: '9',
    status: 'PUBLISHED',
  };
  if (params.category) apiParams.category = params.category;
  if (params.tag) apiParams.tag = params.tag;
  if (params.search) apiParams.search = params.search;

  const [result, categories] = await Promise.all([
    postsApi.getAll(apiParams).catch(() => ({
      posts: [] as Post[],
      pagination: { total: 0, page: 1, limit: 9, totalPages: 0 },
    })),
    taxonomyApi.getCategories().catch(() => [] as Category[]),
  ]);

  return { ...result, categories };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const { posts, pagination, categories } = await getData(params);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-sans text-4xl font-bold text-brand-900 mb-2">
          {params.tag ? `#${params.tag}` : params.category ? categories.find((c) => c.slug === params.category)?.name || params.category : 'All Posts'}
        </h1>
        <p className="text-brand-500">{pagination.total} {pagination.total === 1 ? 'post' : 'posts'}</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/blog"
          className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
            !params.category ? 'bg-accent text-white border-accent' : 'border-brand-200 text-brand-600 hover:bg-accent hover:text-white hover:border-accent'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog?category=${cat.slug}`}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              params.category === cat.slug
                ? 'bg-accent text-white border-accent'
                : 'border-brand-200 text-brand-600 hover:bg-accent hover:text-white hover:border-accent'
            }`}
          >
            {cat.name}
            {cat._count && <span className="ml-1 opacity-60 text-xs">({cat._count.posts})</span>}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="mb-10">
        <input
          type="search"
          name="search"
          defaultValue={params.search}
          placeholder="Search posts…"
          className="w-full max-w-md border border-brand-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </form>

      {/* Grid */}
      {posts.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                const sp = new URLSearchParams();
                if (params.category) sp.set('category', params.category);
                if (params.search) sp.set('search', params.search);
                sp.set('page', String(p));
                return (
                  <Link
                    key={p}
                    href={`/blog?${sp.toString()}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === p
                        ? 'bg-accent text-white'
                        : 'border border-brand-200 text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 text-brand-400">
          <p>No posts found{params.search ? ` for "${params.search}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}
