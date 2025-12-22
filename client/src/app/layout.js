import { Manrope } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'SaveTheServe | Food Rescue Platform',
  description: 'Connecting restaurants and NGOs to rescue surplus food and serve communities.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${manrope.className} bg-background text-slate-900 antialiased`}>        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
