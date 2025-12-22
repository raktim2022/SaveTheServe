'use client';

import { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder,
  required = false, 
  disabled = false,
  rows = 4,
  cols,
  maxLength,
  className = "",
  error,
  helpText,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 border border-gray-200 rounded-xl 
          focus:ring-2 focus:ring-green-500 focus:border-transparent 
          transition-all duration-200 bg-white/50 resize-vertical
          disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
          ${error ? 'border-red-300 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {value?.length || 0}/{maxLength}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;