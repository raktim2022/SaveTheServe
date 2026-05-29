import { Manrope } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata = {
  title: {
    template: '%s | SaveTheServe',
    default: 'SaveTheServe | Food Rescue Platform',
  },
  description: 'Connecting restaurants and NGOs to rescue surplus food and serve communities. Join our mission to reduce food waste and help those in need.',
  keywords: ['food rescue', 'food waste', 'NGO', 'restaurants', 'community service', 'food donation', 'sustainability'],
  authors: [{ name: 'SaveTheServe Team' }],
  creator: 'SaveTheServe',
  publisher: 'SaveTheServe',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://savetheserve.com',
    title: 'SaveTheServe | Food Rescue Platform',
    description: 'Connecting restaurants and NGOs to rescue surplus food and serve communities.',
    siteName: 'SaveTheServe',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SaveTheServe - Food Rescue Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaveTheServe | Food Rescue Platform',
    description: 'Connecting restaurants and NGOs to rescue surplus food and serve communities.',
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#16a34a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SaveTheServe',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en" className="h-full">
      <body suppressHydrationWarning className={`${manrope.className} bg-background text-slate-900 antialiased`}>        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
