import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary-600 to-secondary-500 text-white font-bold flex items-center justify-center">S</div>
              <div>
                <p className="text-lg font-semibold">SaveTheServe</p>
                <p className="text-sm text-slate-400">Food rescue network</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting restaurants, donors, and NGOs to move surplus food quickly, safely, and transparently.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-300 hover:text-white">
              Talk to our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link href="/#impact" className="hover:text-white">Impact dashboard</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">For organizations</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/register?type=ngo" className="hover:text-white">Register as NGO</Link></li>
              <li><Link href="/register?type=restaurant" className="hover:text-white">Register as restaurant/donor</Link></li>
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Stay updated</h3>
            <p className="text-sm text-slate-400">Get product updates and success stories.</p>
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-100 hover:bg-white/10">
              Subscribe
            </Button>
            <div className="text-xs text-slate-500">Privacy-first. No spam.</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <div className="space-y-1">
            <p>© {currentYear} SaveTheServe. All rights reserved.</p>
            <p className="text-slate-600 text-xs">
              A capstone project — built with ❤️ for the community.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

