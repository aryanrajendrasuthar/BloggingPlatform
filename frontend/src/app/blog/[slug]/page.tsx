import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { postsApi, postsApi as api } from '@/lib/api';
import { formatDate } from '@/lib/auth';
import { CommentSection } from '@/components/Comment/CommentSection';
import { Clock, Eye, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Post } from '@/types';

// SSG with ISR — regenerate every 10 minutes
export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await postsApi.getBySlug(slug).catch(() => null);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: post.title,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.title }] : [],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

// Pre-generate paths for recent published posts at build time
export async function generateStaticParams() {
  const { posts } = await postsApi.getAll({ limit: '50', status: 'PUBLISHED' }).catch(() => ({
    posts: [] as Post[],
    pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
  }));
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await postsApi.getBySlug(slug).catch(() => null);
  if (!post || post.status !== 'PUBLISHED') notFound();

  // Related posts from same category (simple SSG approach)
  const related = post.category
    ? await postsApi
        .getAll({ category: post.category.slug, limit: '3', status: 'PUBLISHED' })
        .then(({ posts }) => posts.filter((p) => p.id !== post.id).slice(0, 3))
        .catch(() => [] as Post[])
    : [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-700 mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to blog
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {post.category && (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full hover:bg-accent hover:text-white transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-accent transition-colors"
            >
              <Tag className="w-3 h-3" />
              {tag.name}
            </Link>
          ))}
        </div>

        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-900 leading-tight mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-brand-500 leading-relaxed mb-8 font-serif">{post.excerpt}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-brand-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent font-bold">
              {post.author.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-brand-900 text-sm">{post.author.name}</p>
              {post.author.bio && <p className="text-brand-400 text-xs line-clamp-1">{post.author.bio}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-brand-400 ml-auto flex-wrap">
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.viewCount} views
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${siteUrl}/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </a>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {post.coverImageUrl && (
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-12 -mx-4 sm:mx-0">
          <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Post content */}
      <div
        className="prose prose-lg max-w-none font-serif text-brand-800
          prose-headings:font-sans prose-headings:font-bold prose-headings:text-brand-900
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-accent prose-blockquote:text-brand-600
          prose-code:font-mono prose-code:bg-brand-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-brand-900 prose-pre:text-brand-100
          prose-img:rounded-xl prose-img:mx-auto"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-brand-100">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-600 text-sm rounded-full hover:bg-accent hover:text-white transition-colors"
            >
              <Tag className="w-3 h-3" />
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Author bio card */}
      <div className="mt-16 p-6 bg-brand-50 rounded-2xl flex gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent-light flex items-center justify-center text-accent text-xl font-bold">
          {post.author.name[0].toUpperCase()}
        </div>
        <div>
          <p className="font-sans font-semibold text-brand-900">Written by {post.author.name}</p>
          {post.author.bio && (
            <p className="text-brand-500 text-sm mt-1 leading-relaxed">{post.author.bio}</p>
          )}
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-sans text-xl font-bold text-brand-900 mb-6">Related posts</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className="group p-4 border border-brand-100 rounded-xl hover:border-accent transition-colors"
              >
                <h3 className="font-sans font-semibold text-brand-900 group-hover:text-accent transition-colors text-sm leading-snug line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-brand-400 text-xs mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {rp.readingTime} min
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <CommentSection postSlug={post.slug} />
    </article>
  );
}
