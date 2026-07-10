'use client';

import { useState, useRef, useEffect } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function ThemeSwitcher({ className = '' }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Find active option
  const activeOption = OPTIONS.find(opt => opt.value === theme) || OPTIONS[2];
  const ActiveIcon = activeOption.icon;

  return (
    <div ref={switcherRef} className={clsx('relative inline-block', className)}>
      {/* Trigger Button: Shows current theme icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95',
          isOpen && 'ring-2 ring-emerald-500 border-transparent'
        )}
        aria-label="Toggle theme selection"
        aria-expanded={isOpen}
      >
        <ActiveIcon className="h-5 w-5" />
      </button>

      {/* Theme Choices Popover: Opens upwards */}
      {isOpen && (
        <div 
          className="absolute bottom-full right-0 mb-3 w-44 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl dark:shadow-slate-950/50 flex flex-col gap-1 z-50"
          style={{
            animation: 'themeSwitcherPopup 0.18s cubic-bezier(0.16,1,0.3,1) both'
          }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select Theme
          </div>
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-left',
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                )}
                aria-pressed={active}
              >
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}