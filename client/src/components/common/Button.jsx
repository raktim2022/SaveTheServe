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
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-[0.97]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none tracking-wide',
  ].join(' ');

  const variants = {
    primary: [
      'bg-green-600 text-white shadow-sm shadow-green-200',
      'hover:bg-green-700 hover:shadow-md hover:shadow-green-200',
      'focus-visible:ring-green-500',
    ].join(' '),
    secondary: [
      'bg-gray-800 text-white shadow-sm shadow-gray-200',
      'hover:bg-gray-900 hover:shadow-md',
      'focus-visible:ring-gray-600',
    ].join(' '),
    danger: [
      'bg-red-600 text-white shadow-sm shadow-red-200',
      'hover:bg-red-700 hover:shadow-md hover:shadow-red-200',
      'focus-visible:ring-red-500',
    ].join(' '),
    success: [
      'bg-emerald-500 text-white shadow-sm shadow-emerald-200',
      'hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-200',
      'focus-visible:ring-emerald-500',
    ].join(' '),
    outline: [
      'border border-gray-300 bg-white text-gray-700 shadow-sm',
      'hover:bg-gray-50 hover:border-gray-400 hover:shadow',
      'focus-visible:ring-gray-400',
    ].join(' '),
    ghost: [
      'bg-transparent text-gray-600',
      'hover:bg-gray-100 hover:text-gray-900',
      'focus-visible:ring-gray-400',
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

