'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  disabled = false,
  className = "",
  placeholder = "Select an option",
  error,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl 
            focus:ring-2 focus:ring-green-500 focus:border-transparent 
            transition-all duration-200 bg-white/50 
            appearance-none cursor-pointer
            disabled:bg-gray-50 dark:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {typeof option.label === 'string' ? option.label : option.value}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;