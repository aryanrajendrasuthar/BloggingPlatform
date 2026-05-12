import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { formatDate } from '@/lib/auth';
import { Clock, MessageCircle, Eye } from 'lucide-react';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block post-card">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
          {post.coverImageUrl && (
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className={`p-8 flex flex-col justify-center ${!post.coverImageUrl ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <span className="px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full">
                  {post.category.name}
                </span>
              )}
              <span className="text-xs text-brand-400">Featured</span>
            </div>
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-brand-900 mb-3 group-hover:text-accent transition-colors leading-tight">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-brand-600 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-brand-400">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
                  {post.author.name[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium text-brand-600">{post.author.name}</span>
              <span>·</span>
              <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block post-card">
      <article className="rounded-xl overflow-hidden border border-brand-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {post.coverImageUrl && (
          <div className="relative aspect-[16/9]">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          {post.category && (
            <span className="inline-block px-2.5 py-0.5 bg-accent-light text-accent text-xs font-semibold rounded-full mb-3 self-start">
              {post.category.name}
            </span>
          )}
          <h3 className="font-sans text-lg font-bold text-brand-900 mb-2 group-hover:text-accent transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-brand-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-brand-400 mt-auto pt-4 border-t border-brand-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
                {post.author.name[0].toUpperCase()}
              </div>
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTime}m
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {post._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.viewCount}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
