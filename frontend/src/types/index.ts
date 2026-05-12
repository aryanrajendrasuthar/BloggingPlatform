export type Role = 'AUTHOR' | 'READER' | 'ADMIN';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { posts: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  authorId: string;
  categoryId?: string;
  status: PostStatus;
  viewCount: number;
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'name' | 'avatarUrl' | 'bio'>;
  category?: Category;
  tags: Tag[];
  _count: { comments: number };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  replies?: Comment[];
}

export interface PaginatedResponse<T> {
  posts: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
