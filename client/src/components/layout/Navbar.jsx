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
    { href: '/#process', label: 'How it works' },
    { href: '/#impact', label: 'Impact' },
    { href: '/#get-started', label: 'Get started' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-white/95 via-white/95 to-primary-50/50 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white font-bold flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              S
            </div>
            <div>
              <p className="text-base font-headings font-black text-slate-950 leading-tight">SaveTheServe</p>
              <p className="text-xs text-slate-500 font-semibold leading-tight">Food rescue</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-slate-700 hover:text-primary-700 transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600 font-medium">Hi, {user.name}</span>
                <Link 
                  href={
                    user.role === 'ADMIN' ? `/admin/${user.id}` :
                    user.role === 'RESTAURANT' ? `/donor/${user.id}` : `/ngo/${user.id}`
                  } 
                  className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={logout} 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-300"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary-700 transition-colors duration-300">
                  Log in
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm" 
                    className="rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-700"
                  >
                    Get started <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border-2 border-slate-300 p-2 text-slate-700 hover:bg-slate-100 transition-all duration-300"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-gradient-to-b from-white/95 via-white/90 to-primary-50/50 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-semibold text-slate-700 hover:text-primary-700 transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/profile" className="text-sm font-semibold text-slate-700" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => { logout(); setOpen(false); }} className="border-2 border-slate-300 text-slate-700">
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

