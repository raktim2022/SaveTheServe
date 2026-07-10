'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  Users, 
  BarChart3, 
  Truck, 
  Settings,
  Heart,
  ChefHat,
  Shield,
  Handshake,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

/**
 * Sidebar component
 */
export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const userId = user.id;

    if (user.role === 'NGO') {
      return [
        { href: `/ngo/${userId}`, label: 'Food Listings', icon: Package },
        { href: `/ngo/${userId}/requests`, label: 'My Requests', icon: FileText },
        { href: `/ngo/${userId}/volunteers`, label: 'Volunteers', icon: Users },
        { href: `/ngo/${userId}/impact`, label: 'Impact', icon: BarChart3 },
        { href: `/ngo/${userId}/history`, label: 'History', icon: History },
        { href: `/ngo/${userId}/settings`, label: 'Settings', icon: Settings },
      ];
    }

    if (user.role === 'VOLUNTEER') {
      return [
        { href: `/volunteer/${userId}`, label: 'My Dashboard', icon: LayoutDashboard },
        { href: `/volunteer/${userId}/settings`, label: 'Settings', icon: Settings },
      ];
    }

    if (user.role === 'RESTAURANT') {
      return [
        { href: `/donor/${userId}`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/donor/${userId}/food-listings`, label: 'Food Listings', icon: Package },
        { href: `/donor/${userId}/pickups`, label: 'Pickup Requests', icon: Truck },
        { href: `/donor/${userId}/impact`, label: 'My Impact', icon: BarChart3 },
        { href: `/donor/${userId}/settings`, label: 'Settings', icon: Settings },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { href: `/admin/${userId}`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/admin/${userId}/users`, label: 'User Management', icon: Users },
        { href: `/admin/${userId}/reports`, label: 'Reports & Analytics', icon: BarChart3 },
        { href: `/admin/${userId}/settings`, label: 'Settings', icon: Settings },
      ];
    }

    return [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'NGO':        return Heart;
      case 'RESTAURANT': return ChefHat;
      case 'ADMIN':      return Shield;
      case 'VOLUNTEER':  return Handshake;
      default:           return Users;
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside 
      className={clsx(
        "w-64 bg-white/95 dark:bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-100 dark:border-slate-700 shadow-lg fixed h-full flex flex-col z-30 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary-600 to-secondary-500 text-white font-bold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-tight">SaveTheServe</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Dashboard</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-white'
                )}
              >
                <Icon className={clsx(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-300'
                )} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Notification Bell + User Profile */}
      {user && (
        <motion.div 
          className="p-4 mb-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {/* Notification bell row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Alerts</span>
            <NotificationBell />
          </div>
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold shadow">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <div className="flex items-center space-x-1">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                                user.role === 'NGO' ? 'bg-green-500' :
                  user.role === 'RESTAURANT' ? 'bg-blue-500' :
                  user.role === 'VOLUNTEER' ? 'bg-purple-500' :
                  'bg-purple-500'
                )} />
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </aside>
  );
}

