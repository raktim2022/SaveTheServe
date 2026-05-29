export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://savetheserve.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/ngo/',
          '/donor/',
          '/login',
          '/register',
          '/verify-email',
          '/forgot-password',
          '/*.json',
          '/private/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/ngo/',
          '/donor/',
          '/login',
          '/register',
          '/verify-email',
          '/forgot-password',
          '/private/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
