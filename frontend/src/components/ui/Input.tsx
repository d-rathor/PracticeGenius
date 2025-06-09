import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, ...props }, ref) => {
    const id = props.id || props.name || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-red-500 focus-visible:ring-red-500': error,
                'border-gray-300': !error,
              },
              className
            )}
            ref={ref}
            id={id}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
