import React, { forwardRef, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, hint, autoResize = false, id, onChange, ...props }, ref) => {
    const textareaId = id || React.useId();
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const handleRef = (node: HTMLTextAreaElement) => {
      internalRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
      if (onChange) {
        onChange(e);
      }
    };

    useEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [props.value, autoResize]);

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={handleRef}
            id={textareaId}
            onChange={handleInput}
            className={`
              block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 
              transition-shadow duration-150 sm:text-sm resize-y
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 pr-10' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
              }
              ${autoResize ? 'overflow-hidden resize-none' : ''}
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute top-2 right-0 flex items-center pr-3">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-red-600" id={`${textareaId}-error`}>
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-gray-500" id={`${textareaId}-hint`}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
