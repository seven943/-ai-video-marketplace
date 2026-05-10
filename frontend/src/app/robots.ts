import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/chat', '/admin', '/profile', '/dashboard', '/notifications', '/api'],
      },
    ],
    sitemap: 'https://aivideo.com/sitemap.xml',
  };
}
