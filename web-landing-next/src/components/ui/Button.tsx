'use client';

import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { MaterialIcon } from './MaterialIcon';

/**
 * Button - Unified button component with all landing page variants
 *
 * Why this exists: Consolidates hero-cta, nav-cta, and other button styles
 * that were previously duplicated across HTML files.
 */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'hero' | 'nav' | 'nav-solid' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const variantClasses = {
  hero: 'hero-cta',
  nav: 'nav-cta px-4 py-2 rounded-full font-semibold text-sm transition-colors',
  'nav-solid':
    'bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors',
  primary:
    'bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-soft',
  secondary:
    'bg-white text-primary px-6 py-3 rounded-full font-semibold border-2 border-primary/10 hover:border-primary/20 transition-colors',
  ghost:
    'text-primary px-4 py-2 rounded-full font-medium hover:bg-primary/5 transition-colors',
};

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <MaterialIcon name={icon} size="sm" />
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <MaterialIcon name={icon} size="sm" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Link-styled button for anchor behavior
interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'hero' | 'nav' | 'nav-solid' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  children,
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`inline-flex cursor-pointer items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <MaterialIcon name={icon} size="sm" />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <MaterialIcon name={icon} size="sm" />
      )}
    </a>
  );
}
