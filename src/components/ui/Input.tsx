import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
