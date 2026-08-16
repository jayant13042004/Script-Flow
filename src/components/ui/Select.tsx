import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, hint, options, id, ...props }, ref) => {
    const selectId = id || React.useId();
    
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              block w-full appearance-none rounded-lg border bg-white pl-3 pr-10 py-2 text-gray-900 
              focus:outline-none focus:ring-2 focus:ring-offset-1 
              transition-shadow duration-150 sm:text-sm
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
              }
              ${className}
            `}
            {...props}
          >
            {props.children || (options && options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-red-600" id={`${selectId}-error`}>
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-gray-500" id={`${selectId}-hint`}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
