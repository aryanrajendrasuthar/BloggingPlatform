'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import { commentsApi } from '@/lib/api';
import { useAuth } from '../Layout/AuthProvider';
import { formatDate } from '@/lib/auth';
import { MessageCircle, Reply, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: Comment;
  onDelete: (id: string) => void;
  onReply: (parentId: string, parentAuthor: string) => void;
}

function CommentItem({ comment, onDelete, onReply }: CommentItemProps) {
  const { user } = useAuth();

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-sm font-bold mt-0.5">
          {comment.author.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-brand-900 text-sm">{comment.author.name}</span>
            <span className="text-brand-400 text-xs">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-brand-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onReply(comment.id, comment.author.name)}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-accent transition-colors"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            {user && (user.id === comment.authorId || user.role === 'ADMIN') && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-brand-100 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} onDelete={onDelete} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ postSlug }: { postSlug: string }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const data = await commentsApi.getByPost(postSlug);
      setComments(data);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !text.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.create(postSlug, { content: text.trim(), parentId: replyTo?.id }, token);
      setText('');
      setReplyTo(null);
      await loadComments();
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(id, token);
      await loadComments();
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <section className="mt-16">
      <h2 className="font-sans text-xl font-bold text-brand-900 mb-8 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-accent">
              <Reply className="w-3.5 h-3.5" />
              Replying to <strong>{replyTo.author}</strong>
              <button type="button" onClick={() => setReplyTo(null)} className="text-brand-400 hover:text-brand-700 ml-1">
                ✕
              </button>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={4}
            className="w-full border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-brand-50 rounded-xl text-sm text-brand-600">
          <a href="/auth/login" className="text-accent hover:underline font-medium">Sign in</a> to leave a comment.
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-brand-400 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              onReply={(id, author) => setReplyTo({ id, author })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
