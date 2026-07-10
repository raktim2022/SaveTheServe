import Link from 'next/link';
import { ArrowRight, Heart, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/Button';

const footerGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'How it works', href: '/#process' },
      { label: 'Impact dashboard', href: '/#impact' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Organization',
    links: [
      { label: 'Register as NGO', href: '/register?type=ngo' },
      { label: 'Register as restaurant', href: '/register?type=restaurant' },
      { label: 'Sign in', href: '/login' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'About SaveTheServe', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Cookie policy', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-950 dark:bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-lg shadow-emerald-950/20 transition-transform group-hover:scale-105">
                S
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-white">SaveTheServe</p>
                <p className="text-sm text-slate-400">Food rescue and community distribution network</p>
              </div>
            </Link>

            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              SaveTheServe helps restaurants, donors, and NGOs move surplus food to communities with speed, traceability, and dignity. We focus on reliable coordination, transparent reporting, and measurable impact.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contact</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-400" />support@savetheserve.org</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-400" />+91 90000 00000</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Coverage</p>
                <p className="mt-3 text-sm text-slate-300 leading-6">Operational in partner cities with route-based pickup coordination and NGO verification.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trust</p>
                <p className="mt-3 text-sm text-slate-300 leading-6">Secure payments, verified partners, and clear audit trails across every donation workflow.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Stay informed</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Get operational updates and impact stories</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Receive important platform updates, product releases, and community impact summaries.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 dark:text-slate-400 outline-none transition focus:border-emerald-400"
              />
              <Button size="sm" className="rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 sm:py-0 w-full sm:w-auto flex items-center justify-center gap-2">
                <span className="sm:hidden text-sm font-semibold">Subscribe</span>
                <Mail className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">No spam. Only essential updates and service announcements.</p>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 py-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-white">Professional and secure by design</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We maintain a clear privacy posture, secure checkout integration, and accessible flows for donors, NGOs, and partner organizations.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 text-emerald-400" />
              India-wide community operations with local partner coordination
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">© {currentYear} SaveTheServe. All rights reserved.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Built for food rescue, donor trust, and verified community impact.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <span className="text-slate-700 dark:text-slate-200">•</span>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <span className="text-slate-700 dark:text-slate-200">•</span>
            <Link href="/cookies" className="transition-colors hover:text-white">Cookies</Link>
            <span className="text-slate-700 dark:text-slate-200">•</span>
            <Link href="/accessibility" className="transition-colors hover:text-white">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

