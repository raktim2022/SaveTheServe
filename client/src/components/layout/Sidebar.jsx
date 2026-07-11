"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import clsx from "clsx";

/**
 * Sidebar component
 */
export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const getMenuItems = () => {
    if (!user) return [];

    const userId = user.id;

    if (user.role === "NGO") {
      return [
        { href: `/ngo/${userId}`, label: "Food Listings", icon: Package },
        {
          href: `/ngo/${userId}/requests`,
          label: "My Requests",
          icon: FileText,
        },
        { href: `/ngo/${userId}/volunteers`, label: "Volunteers", icon: Users },
        { href: `/ngo/${userId}/impact`, label: "Impact", icon: BarChart3 },
        { href: `/ngo/${userId}/history`, label: "History", icon: History },
        { href: `/ngo/${userId}/settings`, label: "Settings", icon: Settings },
      ];
    }

    if (user.role === "VOLUNTEER") {
      return [
        {
          href: `/volunteer/${userId}`,
          label: "My Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: `/volunteer/${userId}/settings`,
          label: "Settings",
          icon: Settings,
        },
      ];
    }

    if (user.role === "RESTAURANT") {
      return [
        { href: `/donor/${userId}`, label: "Dashboard", icon: LayoutDashboard },
        {
          href: `/donor/${userId}/food-listings`,
          label: "Food Listings",
          icon: Package,
        },
        {
          href: `/donor/${userId}/pickups`,
          label: "Pickup Requests",
          icon: Truck,
        },
        {
          href: `/donor/${userId}/impact`,
          label: "My Impact",
          icon: BarChart3,
        },
        {
          href: `/donor/${userId}/settings`,
          label: "Settings",
          icon: Settings,
        },
      ];
    }

    if (user.role === "ADMIN") {
      return [
        { href: `/admin/${userId}`, label: "Dashboard", icon: LayoutDashboard },
        {
          href: `/admin/${userId}/users`,
          label: "User Management",
          icon: Users,
        },
        {
          href: `/admin/${userId}/reports`,
          label: "Reports & Analytics",
          icon: BarChart3,
        },
        {
          href: `/admin/${userId}/settings`,
          label: "Settings",
          icon: Settings,
        },
      ];
    }

    return [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "NGO":
        return Heart;
      case "RESTAURANT":
        return ChefHat;
      case "ADMIN":
        return Shield;
      case "VOLUNTEER":
        return Handshake;
      default:
        return Users;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => {
            setMobileOpen(false);
            onClose();
          }}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex h-full w-72 flex-col border-r border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-sm transition-transform duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900/95 lg:translate-x-0 lg:shadow-lg",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-700">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo2.ico"
                alt="SaveTheServe"
                fill
                className="object-fill h-10 w-10"
              />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-slate-900 dark:text-white">
                SaveTheServe
              </p>
              <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                Dashboard
              </p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => {
              setMobileOpen(false);
              onClose();
            }}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={clsx(
                    "group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  <Icon
                    className={clsx(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-primary-600"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-300",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Notification Bell + User Profile */}
        {user && (
          <motion.div
            className="mb-8 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {/* Notification bell row */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Alerts
              </span>
              <NotificationBell />
            </div>
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary-600 to-secondary-500 font-bold text-white shadow">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <div className="flex items-center space-x-1">
                  <div
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      user.role === "NGO"
                        ? "bg-green-500"
                        : user.role === "RESTAURANT"
                          ? "bg-blue-500"
                          : user.role === "VOLUNTEER"
                            ? "bg-purple-500"
                            : "bg-purple-500",
                    )}
                  />
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </aside>
    </>
  );
}
