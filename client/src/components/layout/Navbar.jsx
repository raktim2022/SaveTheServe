'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight, Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const links = [
    { href: '/about', label: 'About' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const ActiveThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm dark:shadow-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-300">
              S
            </div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">
              SaveTheServe
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label="Toggle theme"
              >
                <ActiveThemeIcon className="h-4 w-4" />
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`} />
              </button>

              {themeOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-slate-900/50 overflow-hidden py-1 animate-fade-in">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => { setTheme(option.value); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href={
                      user.role === 'ADMIN' ? `/admin/${user.id}` :
                      user.role === 'RESTAURANT' ? `/donor/${user.id}` : `/ngo/${user.id}`
                    }
                    className="px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={logout}
                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register">
                    <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center gap-1.5">
                      Get started <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:bg-slate-900 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            
            {/* User Profile Summary Card */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{user.role?.toLowerCase()}</p>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Theme switcher for mobile users */}
            {/* <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="px-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Theme Preference</p>
              <div className="grid grid-cols-3 gap-2 px-1">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => { setTheme(option.value); }}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-600 dark:text-slate-300 bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div> */}

            {/* Auth Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'ADMIN' ? `/admin/${user.id}` : user.role === 'RESTAURANT' ? `/donor/${user.id}` : `/ngo/${user.id}`} 
                    className="block text-center px-4 py-3 rounded-xl text-sm font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setOpen(false); }} 
                    className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 transition-colors">
                      Get started
                    </button>
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
