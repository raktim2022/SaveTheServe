import clsx from 'clsx';

/**
 * Badge component
 */
export default function Badge({ children, variant = 'default', size = 'md', className }) {
  const variants = {
    default: 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Status badge component
 */
export function StatusBadge({ status }) {
  const statusConfig = {
    available: { variant: 'success', label: 'Available' },
    reserved: { variant: 'warning', label: 'Reserved' },
    completed: { variant: 'info', label: 'Completed' },
    expired: { variant: 'danger', label: 'Expired' },
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

