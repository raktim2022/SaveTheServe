import clsx from 'clsx';

/**
 * Button component
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className,
  ...props
}) {
  const baseStyles = [
    'relative inline-flex items-center justify-center font-semibold rounded-xl',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
    'active:scale-[0.97]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none tracking-wide',
  ].join(' ');

  const variants = {
    primary: [
      'bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950/20',
      'hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-950/30',
      'focus-visible:ring-emerald-500',
    ].join(' '),
    secondary: [
      'bg-slate-800 text-white shadow-sm shadow-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:text-white dark:shadow-slate-950/10',
      'hover:bg-slate-900 hover:shadow-md dark:hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800',
      'focus-visible:ring-slate-600',
    ].join(' '),
    danger: [
      'bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-red-950/20',
      'hover:bg-red-700 hover:shadow-md hover:shadow-red-200 dark:hover:shadow-red-950/30',
      'focus-visible:ring-red-500',
    ].join(' '),
    success: [
      'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-950/20',
      'hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-950/30',
      'focus-visible:ring-emerald-500',
    ].join(' '),
    outline: [
      'border border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      'hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 hover:border-slate-400 hover:shadow dark:hover:bg-slate-800 dark:hover:border-slate-600',
      'focus-visible:ring-slate-400',
    ].join(' '),
    ghost: [
      'bg-transparent text-slate-600 dark:text-slate-300',
      'hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 hover:text-slate-900 dark:text-white dark:hover:bg-slate-800 dark:hover:text-white',
      'focus-visible:ring-slate-400',
    ].join(' '),
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin shrink-0 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

