'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

/**
 * NotificationBell component
 *
 * @param {boolean} inSidebar - When true the panel is rendered via a React portal and
 *                              positioned using fixed viewport coordinates so it can never
 *                              overflow the screen edge, regardless of where the button sits.
 */
export default function NotificationBell({ inSidebar = false }) {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute fixed coordinates from the button's bounding rect so the panel
  // always stays inside the viewport, even when the button is inside the sidebar.
  const computeStyle = useCallback(() => {
    if (!inSidebar || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const PANEL_W = Math.min(320, window.innerWidth - 16); // max 320px, min 16px margin
    const MARGIN = 8; // gap between button and panel

    // Open upward: bottom edge of panel = top of button
    const bottom = window.innerHeight - rect.top + MARGIN;

    // Horizontally: prefer right-aligned to button, but clamp so it never leaves viewport
    let right = window.innerWidth - rect.right;
    // If the panel would overflow the left edge, push it right
    const leftEdge = window.innerWidth - right - PANEL_W;
    if (leftEdge < 8) right = window.innerWidth - PANEL_W - 8;
    // Never let right go negative (off right edge)
    if (right < 8) right = 8;

    setPanelStyle({
      position: 'fixed',
      bottom: `${bottom}px`,
      right: `${right}px`,
      width: `${PANEL_W}px`,
      zIndex: 9999,
    });
  }, [inSidebar]);

  const handleToggle = () => {
    if (!open) computeStyle();
    setOpen((prev) => !prev);
  };

  // Recompute on window resize / scroll while open
  useEffect(() => {
    if (!open || !inSidebar) return;
    const update = () => computeStyle();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, inSidebar, computeStyle]);

  // ─── Panel content (shared between portal and inline) ─────────────────────
  const panelContent = (
    <div
      ref={panelRef}
      style={inSidebar ? panelStyle : undefined}
      className={
        inSidebar
          ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden'
          : 'absolute top-full mt-2 right-0 z-[60] w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden'
      }
    >
      {/* Header */}
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
            <button
              onClick={clearAll}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
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
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                !notification.read
                  ? 'bg-green-50/50 dark:bg-green-900/10'
                  : 'dark:bg-slate-800'
              }`}
            >
              <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold shrink-0 mt-0.5 flex items-center justify-center">
                {TYPE_ICONS[notification.type] ?? 'N'}
              </span>
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                    {notification.title}
                  </p>
                )}
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {timeAgo(notification.timestamp)}
                </p>
              </div>
              {!notification.read && (
                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel: portal when inSidebar so it escapes the sidebar stacking context;
          inline absolute when used in navbar/other contexts */}
      {open &&
        (inSidebar
          ? createPortal(panelContent, document.body)
          : panelContent)}
    </div>
  );
}
