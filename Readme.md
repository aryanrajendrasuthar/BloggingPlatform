# Inkwell — Blogging Platform

A full-stack blogging platform with a rich text editor, SEO-optimised Next.js frontend, and a Node.js/Express REST API.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![AWS S3](https://img.shields.io/badge/AWS_S3-upload-orange?logo=amazon-aws)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker)

---

## Features

- **Rich text editor** powered by Tiptap with syntax-highlighted code blocks (lowlight)
- **Draft / Published / Archived** post workflow
- **Tags & Categories** with filterable blog listing
- **Threaded comments** (2-level nesting) with auth-gated creation
- **AWS S3** cover image and inline image uploads
- **Redis** real-time view counter with popular posts cache
- **RSS 2.0 feed** (`/api/rss`) and **XML sitemap** (`/api/sitemap.xml`)
- **Next.js SSR** (homepage, blog listing) + **SSG with ISR** (post detail pages)
- **OpenGraph / SEO metadata** with `generateMetadata` for every post
- **Author dashboard** — post stats, tab filters, inline edit/delete
- **JWT authentication** with role-based access (AUTHOR / READER / ADMIN)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Editor | Tiptap (StarterKit, CodeBlockLowlight, Image, Link) |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7 (ioredis) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Storage | AWS S3 (`@aws-sdk/client-s3`, multer-s3) |
| Validation | Zod |
| Container | Docker, Docker Compose |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  Next.js 14 (App Router)                                         │
│  ┌──────────┐ ┌───────────────┐ ┌──────────────────────────────┐│
│  │  /blog   │ │ /blog/[slug]  │ │ /dashboard  (client-side)    ││
│  │  SSR     │ │ SSG + ISR     │ │ post CRUD, Tiptap editor     ││
│  └──────────┘ └───────────────┘ └──────────────────────────────┘│
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────────┐
│  Express.js API  (port 4000)                                     │
│  /api/auth  /api/posts  /api/categories  /api/tags               │
│  /api/upload  /api/rss  /api/sitemap.xml                         │
│  Middleware: JWT auth, rate-limit, Helmet, CORS                  │
└──────────┬────────────────┬────────────────────────────────────┘
           │                │
    ┌──────▼──────┐  ┌──────▼──────┐
    │ PostgreSQL  │  │    Redis     │
    │ (Prisma)    │  │ view counts  │
    └─────────────┘  │ popular posts│
                     └─────────────┘
                            │
                     ┌──────▼──────┐
                     │   AWS S3    │
                     │   images    │
                     └─────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)
- AWS account with an S3 bucket

### 1. Clone and configure

```bash
git clone <repo-url>
cd BloggingPlatform

cp .env.example .env
# Edit .env with your credentials
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

Services start at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- RSS feed: http://localhost:4000/api/rss
- Sitemap: http://localhost:4000/api/sitemap.xml

### 3. Run locally (development)

**Backend**
```bash
cd backend
cp .env.example .env       # fill in DATABASE_URL, REDIS_URL, JWT_SECRET, AWS_*
npm install
npx prisma migrate dev
npm run dev                # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env.local # set NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev                # http://localhost:3000
```

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/posts` | optional | List posts (filters: category, tag, status, search) |
| GET | `/api/posts/:slug` | optional | Get post by slug + increment view |
| POST | `/api/posts` | AUTHOR | Create post |
| PATCH | `/api/posts/:id` | AUTHOR | Update post |
| DELETE | `/api/posts/:id` | AUTHOR | Delete post |
| GET | `/api/posts/my` | AUTHOR | My posts |
| GET | `/api/posts/popular` | — | Popular posts (Redis cache) |
| GET | `/api/posts/:slug/comments` | — | List comments |
| POST | `/api/posts/:slug/comments` | JWT | Add comment (supports parentId) |
| DELETE | `/api/posts/comments/:id` | JWT | Delete comment |
| GET | `/api/categories` | — | All categories |
| GET | `/api/tags` | — | All tags |
| POST | `/api/upload/image` | AUTHOR | Upload image to S3 |
| GET | `/api/rss` | — | RSS 2.0 feed |
| GET | `/api/sitemap.xml` | — | XML sitemap |

---

## Project Structure

```
BloggingPlatform/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB models
│   └── src/
│       ├── config/                # Redis, S3 clients
│       ├── controllers/           # Route handlers
│       ├── middleware/            # JWT auth, error handler
│       ├── routes/                # Express routers
│       ├── services/              # Redis service
│       └── server.ts              # Entry point
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── blog/              # SSR listing + SSG detail
│       │   ├── dashboard/         # Author dashboard + editor
│       │   └── auth/              # Login / register
│       ├── components/
│       │   ├── Tiptap/            # Rich text editor
│       │   ├── Comment/           # Threaded comments
│       │   ├── Post/              # PostCard component
│       │   └── Layout/            # Navbar, AuthProvider
│       ├── lib/                   # API client, auth helpers
│       └── types/                 # Shared TypeScript types
├── docker-compose.yml
├── .env.example
└── Readme.md
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `AWS_REGION` | S3 bucket region |
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_S3_BUCKET` | S3 bucket name |
| `NEXT_PUBLIC_API_URL` | Frontend → API base URL |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (for OG tags) |
