'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Layout/AuthProvider';
import { postsApi, taxonomyApi, uploadApi } from '@/lib/api';
import { Category } from '@/types';
import { TiptapEditor } from '@/components/Tiptap/Editor';
import toast from 'react-hot-toast';
import { ArrowLeft, Image as ImageIcon, Loader2, X } from 'lucide-react';

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string;
  status: 'DRAFT' | 'PUBLISHED';
  coverImageUrl: string;
}

const INITIAL: FormState = {
  title: '',
  excerpt: '',
  content: '',
  categoryId: '',
  tags: '',
  status: 'DRAFT',
  coverImageUrl: '',
};

export default function NewPostPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'READER') { router.push('/blog'); return; }
    taxonomyApi.getCategories().then(setCategories).catch(() => {});
  }, [user, router]);

  const set = <K extends keyof FormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingCover(true);
    try {
      const { url } = await uploadApi.image(file, token);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    } catch {
      toast.error('Cover image upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInlineImageUpload = useCallback(
    async (file: File): Promise<string> => {
      if (!token) throw new Error('Not authenticated');
      const { url } = await uploadApi.image(file, token);
      return url;
    },
    [token],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content || form.content === '<p></p>') { toast.error('Content is required'); return; }

    setSaving(true);
    try {
      const tagList = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const post = await postsApi.create(
        {
          title: form.title.trim(),
          excerpt: form.excerpt.trim() || undefined,
          content: form.content,
          categoryId: form.categoryId || undefined,
          coverImageUrl: form.coverImageUrl || undefined,
          status: form.status,
          tags: tagList,
        },
        token!,
      );

      toast.success(form.status === 'PUBLISHED' ? 'Post published!' : 'Draft saved!');
      router.push(form.status === 'PUBLISHED' ? `/blog/${post.slug}` : '/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <h1 className="font-sans text-xl font-bold text-brand-900">New post</h1>
        <div className="w-20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="Post title…"
            required
            className="w-full text-3xl font-bold font-sans text-brand-900 placeholder-brand-300 border-none outline-none bg-transparent py-2"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">
            Excerpt <span className="text-brand-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.excerpt}
            onChange={set('excerpt')}
            placeholder="A short summary shown in post listings…"
            rows={2}
            className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">Cover image</label>
          {form.coverImageUrl ? (
            <div className="relative rounded-xl overflow-hidden aspect-[3/1] bg-brand-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coverImageUrl: '' }))}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-brand-600 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="flex items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-brand-200 rounded-xl text-brand-400 hover:border-accent hover:text-accent transition-colors text-sm"
            >
              {uploadingCover ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Click to upload cover image
                </>
              )}
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1.5">Content</label>
          <TiptapEditor
            content={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            onImageUpload={handleInlineImageUpload}
            placeholder="Tell your story…"
          />
        </div>

        {/* Meta row */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-brand-100">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">Category</label>
            <select
              value={form.categoryId}
              onChange={set('categoryId')}
              className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">
              Tags <span className="text-brand-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="nextjs, typescript, webdev"
              className="w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Status + Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-100">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-brand-700">Publish as:</label>
            <div className="flex rounded-xl overflow-hidden border border-brand-200">
              {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    form.status === s
                      ? 'bg-accent text-white'
                      : 'text-brand-500 hover:bg-brand-50'
                  }`}
                >
                  {s === 'DRAFT' ? 'Draft' : 'Published'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : form.status === 'PUBLISHED' ? 'Publish' : 'Save draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
