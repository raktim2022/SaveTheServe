import Head from 'next/head';

export default function SEO({
  title = 'SaveTheServe',
  description = 'Connecting restaurants and NGOs to rescue surplus food and serve communities.',
  keywords = 'food rescue, food waste, NGO, restaurants, community service, food donation',
  image = '/images/og-image.jpg',
  url = '',
  type = 'website'
}) {
  const siteTitle = title === 'SaveTheServe' ? title : `${title} | SaveTheServe`;

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1e7f43" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="SaveTheServe" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Links */}
      <link rel="canonical" href={url} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SaveTheServe',
            description: description,
            url: url,
            logo: {
              '@type': 'ImageObject',
              url: `${url}/logo.png`,
            },
            sameAs: [
              // Add social media URLs here
            ],
          }),
        }}
      />
    </Head>
  );
}