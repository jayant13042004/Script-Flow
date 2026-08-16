import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 
              transition-shadow duration-150 sm:text-sm
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 pr-10' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
              }
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-gray-500" id={`${inputId}-hint`}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
