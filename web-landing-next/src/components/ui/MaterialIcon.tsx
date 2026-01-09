/**
 * MaterialIcon - Wrapper for Google Material Symbols
 *
 * Why this exists: Consistent icon styling across the app with
 * type-safe icon names and size variants.
 */

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export function MaterialIcon({ name, className = '', size = 'md' }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
