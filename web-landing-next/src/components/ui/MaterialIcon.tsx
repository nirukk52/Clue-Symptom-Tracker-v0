/**
 * MaterialIcon - Wrapper for Google Material Symbols
 *
 * Why this exists: Consistent icon styling across the app with
 * type-safe icon names and size variants. Uses variable font settings
 * for sharper rendering at small sizes.
 */

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'text-sm',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

/**
 * Font variation settings for sharper icons at each size
 * wght: weight (300-400 for crisp lines)
 * GRAD: grade (positive for emphasis/sharpness)
 * opsz: optical size (match display size for clarity)
 */
const fontSettings: Record<string, string> = {
  xs: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  sm: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  md: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  lg: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 40",
  xl: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
};

export function MaterialIcon({
  name,
  className = '',
  size = 'md',
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeClasses[size]} ${className}`}
      style={{ fontVariationSettings: fontSettings[size] }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
