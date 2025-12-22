'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

/**
 * Sidebar component
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { href: `/${user.role}`, label: 'Dashboard', icon: '📊' },
    ];

    if (user.role === 'ngo') {
      return [
        ...commonItems,
        { href: '/ngo/requests', label: 'My Requests', icon: '📋' },
        { href: '/ngo/history', label: 'History', icon: '📜' },
      ];
    }

    if (user.role === 'restaurant') {
      return [
        ...commonItems,
        { href: '/donor/food-listings', label: 'Food Listings', icon: '🍽️' },
        { href: '/donor/pickups', label: 'Pickups', icon: '📦' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/reports', label: 'Reports', icon: '📈' },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-sm border-r border-slate-100 shadow-brand-card/40 fixed h-full flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white font-bold flex items-center justify-center">S</div>
          <div>
            <p className="text-base font-semibold text-slate-900 leading-tight">SaveTheServe</p>
            <p className="text-xs text-slate-500 leading-tight">Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition border',
              pathname === item.href
                ? 'bg-primary-50 text-primary-800 border-primary-100'
                : 'text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-100'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="p-5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

