import { AuthResponse, Category, Comment, PaginatedResponse, Post, Tag, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: (token: string) => request<User>('/auth/me', {}, token),

  updateProfile: (data: Partial<User>, token: string) =>
    request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }, token),
};

// ── POSTS ────────────────────────────────────────────────────────────────────

export const postsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Post>>(`/posts${query}`);
  },

  getBySlug: (slug: string, token?: string) =>
    request<Post>(`/posts/${slug}`, {}, token),

  getPopular: () => request<Post[]>('/posts/popular'),

  getMy: (token: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<Post[]>(`/posts/my${query}`, {}, token);
  },

  create: (data: Partial<Post> & { tags?: string[] }, token: string) =>
    request<Post>('/posts', { method: 'POST', body: JSON.stringify(data) }, token),

  update: (id: string, data: Partial<Post> & { tags?: string[] }, token: string) =>
    request<Post>(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  delete: (id: string, token: string) =>
    request<void>(`/posts/${id}`, { method: 'DELETE' }, token),
};

// ── COMMENTS ──────────────────────────────────────────────────────────────────

export const commentsApi = {
  getByPost: (slug: string) => request<Comment[]>(`/posts/${slug}/comments`),

  create: (slug: string, data: { content: string; parentId?: string }, token: string) =>
    request<Comment>(`/posts/${slug}/comments`, { method: 'POST', body: JSON.stringify(data) }, token),

  delete: (id: string, token: string) =>
    request<void>(`/posts/comments/${id}`, { method: 'DELETE' }, token),
};

// ── TAXONOMY ──────────────────────────────────────────────────────────────────

export const taxonomyApi = {
  getCategories: () => request<Category[]>('/categories'),
  getTags: () => request<Tag[]>('/tags'),
  getTagBySlug: (slug: string) => request<Tag & { posts: Post[] }>(`/tags/${slug}`),
};

// ── UPLOAD ────────────────────────────────────────────────────────────────────

export const uploadApi = {
  image: async (file: File, token: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new ApiError(res.status, 'Upload failed');
    return res.json();
  },
};

export { ApiError };
