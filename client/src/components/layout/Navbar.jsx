'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';

// Top navigation with brand styling and mobile menu
export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#impact', label: 'Impact' },
    { href: '/#get-started', label: 'Get started' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white font-bold flex items-center justify-center shadow-brand-card">
              S
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 leading-tight">SaveTheServe</p>
              <p className="text-xs text-slate-500 leading-tight">Food rescue network</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary-700 transition">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600">Hi, {user.name}</span>
                <Link href="/profile" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                  Profile
                </Link>
                <Button size="sm" variant="outline" onClick={logout} className="border-slate-200 text-slate-700 hover:bg-primary-50">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary-700">
                  Log in
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-brand-card">
                    Get started <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-semibold text-slate-700 hover:text-primary-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/profile" className="text-sm font-semibold text-slate-700" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => { logout(); setOpen(false); }} className="border-slate-200 text-slate-700">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-slate-700" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

