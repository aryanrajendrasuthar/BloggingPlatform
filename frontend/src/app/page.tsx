import Link from 'next/link';
import { postsApi, taxonomyApi } from '@/lib/api';
import { PostCard } from '@/components/Post/PostCard';
import { Category, Post } from '@/types';
import { ArrowRight } from 'lucide-react';

// SSR — fetched on every request for fresh data
export const revalidate = 60;

async function getData() {
  const [{ posts }, popular, categories] = await Promise.all([
    postsApi.getAll({ limit: '7', status: 'PUBLISHED' }).catch(() => ({ posts: [], pagination: { total: 0, page: 1, limit: 7, totalPages: 0 } })),
    postsApi.getPopular().catch(() => [] as Post[]),
    taxonomyApi.getCategories().catch(() => [] as Category[]),
  ]);
  return { posts, popular, categories };
}

export default async function HomePage() {
  const { posts, categories } = await getData();
  const [featured, ...rest] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="font-sans text-5xl sm:text-6xl font-extrabold text-brand-900 mb-4 leading-tight">
          Stories worth <span className="text-accent">reading</span>
        </h1>
        <p className="text-xl text-brand-500 max-w-xl mx-auto">
          Thoughtful articles from writers who care about their craft.
        </p>
      </section>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href="/blog"
            className="px-4 py-1.5 rounded-full border border-brand-200 text-sm font-medium text-brand-600 hover:bg-accent hover:text-white hover:border-accent transition-colors"
          >
            All
          </Link>
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className="px-4 py-1.5 rounded-full border border-brand-200 text-sm font-medium text-brand-600 hover:bg-accent hover:text-white hover:border-accent transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Featured post */}
      {featured && (
        <section className="mb-16">
          <PostCard post={featured} featured />
        </section>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <section className="mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-200 rounded-full text-sm font-medium text-brand-700 hover:bg-accent hover:text-white hover:border-accent transition-colors"
            >
              Browse all posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="text-center py-24 text-brand-400">
          <p className="text-lg">No posts yet. Be the first to write!</p>
          <Link href="/auth/register" className="mt-4 inline-block text-accent hover:underline">
            Start writing →
          </Link>
        </div>
      )}
    </div>
  );
}
