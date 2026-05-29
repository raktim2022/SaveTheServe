import Link from 'next/link';
import { ArrowRight, Heart, Mail } from 'lucide-react';
import Button from '@/components/common/Button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'How it works', href: '/#process' },
      { label: 'Impact dashboard', href: '/#impact' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Pricing', href: '/pricing' },
    ],
    organization: [
      { label: 'Register as NGO', href: '/register?type=ngo' },
      { label: 'Register as restaurant', href: '/register?type=restaurant' },
      { label: 'Sign in', href: '/login' },
      { label: 'Contact us', href: '/contact' },
    ],
    resources: [
      { label: 'About us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Support', href: '/support' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16 space-y-12">
          
          {/* Top Section with CTA */}
          <div className="grid lg:grid-cols-2 gap-12 pb-12 border-b border-slate-800">
            
            {/* Brand Section */}
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white font-bold flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  S
                </div>
                <div>
                  <p className="text-xl font-headings font-black text-white">SaveTheServe</p>
                  <p className="text-sm text-slate-400 font-semibold">Food rescue network</p>
                </div>
              </Link>

              <p className="text-slate-400 text-base leading-relaxed max-w-md font-body">
                Connecting restaurants, donors, and NGOs to move surplus food quickly, safely, and transparently. Together, we're reducing waste and feeding communities.
              </p>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                {['twitter', 'facebook', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href={`#${social}`}
                    className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-primary-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 font-semibold"
                  >
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-br from-primary-600/20 to-secondary-500/10 border border-primary-500/20 rounded-2xl p-8 space-y-4">
              <div className="space-y-2">
                <p className="font-headings text-xl font-black text-white">Stay Updated</p>
                <p className="text-slate-300 font-body">Get the latest on food rescue initiatives and community impact stories.</p>
              </div>

              <div className="flex gap-2 pt-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors duration-300"
                />
                <Button
                  size="sm"
                  className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-slate-500">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-4">
                <h3 className="font-headings font-bold text-white uppercase tracking-wider text-sm">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-primary-300 transition-colors duration-300 text-sm font-body hover:translate-x-1 transition-transform inline-flex items-center"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t border-slate-800 py-8">
          
          <div className="space-y-2">
            <p className="font-semibold text-slate-300">© {currentYear} SaveTheServe. All rights reserved.</p>
            <p className="text-slate-500 text-sm font-body">
              Built with <Heart className="h-4 w-4 inline text-red-500" /> for the community
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

