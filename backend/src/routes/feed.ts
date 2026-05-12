import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

const escapeXml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// RSS 2.0 feed — last 20 published posts
router.get('/rss', async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: { select: { name: true, email: true } }, tags: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const now = new Date().toUTCString();

  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <description>${escapeXml(p.excerpt || '')}</description>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : now}</pubDate>
      <author>${escapeXml(p.author.email)} (${escapeXml(p.author.name)})</author>
      ${p.tags.map((t) => `<category>${escapeXml(t.name)}</category>`).join('')}
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blogging Platform</title>
    <link>${siteUrl}</link>
    <description>Latest articles from Blogging Platform</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(xml);
});

// XML Sitemap — all published post slugs
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  });

  const siteUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const urls = posts
    .map(
      (p) => `
  <url>
    <loc>${siteUrl}/blog/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${urls}
</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

export default router;
