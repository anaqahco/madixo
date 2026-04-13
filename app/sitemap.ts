import type { MetadataRoute } from 'next';
import { BLOG_POSTS, USE_CASES, COMPARISONS } from '@/lib/blog';

function normalizeSiteUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://madixo.ai'
  ).replace(/\/$/, '');
}

function getLatestBlogDate() {
  return BLOG_POSTS.reduce((latest, post) => {
    const candidate = new Date(post.updatedAt || post.publishedAt);
    return candidate > latest ? candidate : latest;
  }, new Date('2026-01-01'));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = normalizeSiteUrl();
  const latestBlogDate = getLatestBlogDate();
  const collectionDate = latestBlogDate;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: latestBlogDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: latestBlogDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/use-cases`,
      lastModified: collectionDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/compare-to`,
      lastModified: collectionDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${siteUrl}/refund-policy`,
      lastModified: new Date('2026-03-30'),
      changeFrequency: 'monthly',
      priority: 0.35,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly',
    priority: post.featured ? 0.9 : 0.82,
  }));

  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((item) => ({
    url: `${siteUrl}/use-cases/${item.slug}`,
    lastModified: collectionDate,
    changeFrequency: 'monthly',
    priority: 0.84,
  }));

  const comparisonPages: MetadataRoute.Sitemap = COMPARISONS.map((item) => ({
    url: `${siteUrl}/compare-to/${item.slug}`,
    lastModified: collectionDate,
    changeFrequency: 'monthly',
    priority: 0.84,
  }));

  return [...staticPages, ...blogPages, ...useCasePages, ...comparisonPages];
}
