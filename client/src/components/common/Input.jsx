import clsx from 'clsx';

/**
 * Input component
 */
export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helpText,
  disabled = false,
  required = false,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:bg-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-slate-100 dark:bg-slate-800 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700',
          inputClassName
        )}
        {...props}
      />
      {helpText && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/**
 * Textarea component
 */
export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className,
  textareaClassName,
  ...props
}) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:bg-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-slate-100 dark:bg-slate-800 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700',
          textareaClassName
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/**
 * Select component
 */
export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className,
  selectClassName,
  ...props
}) {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:bg-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-slate-100 dark:bg-slate-800 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-slate-300 dark:border-slate-700',
          selectClassName
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

