import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3',
        'text-gray-900 placeholder:text-gray-400',
        'transition-all duration-200',
        'focus:border-voyage-500 focus:ring-2 focus:ring-voyage-500/20 focus:outline-none',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
