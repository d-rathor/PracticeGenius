import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-orange-100 text-orange-800',
        secondary: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        outline: 'text-orange-500 border border-orange-500 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
