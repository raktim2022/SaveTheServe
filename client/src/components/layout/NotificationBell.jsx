'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const TYPE_ICONS = {
  'food:new': 'F',
  'food:status_changed': 'U',
  'request:new': 'R',
  'request:status_changed': 'S',
  'volunteer:application': 'V',
  notification: 'N',
};

function timeAgo(iso) {
  const delta = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (delta < 60) return 'just now';
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (!panelRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Bell className="h-8 w-8 mb-2 opacity-25" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors ${
                    !notification.read ? 'bg-green-50/50' : ''
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold shrink-0 mt-0.5 flex items-center justify-center">
                    {TYPE_ICONS[notification.type] ?? 'N'}
                  </span>
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                        {notification.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(notification.timestamp)}</p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
