/**
 * SpoonBurgerIcon - A hamburger menu icon made of three spoons
 *
 * Why this exists: A playful nod to "spoon theory" - the chronic illness
 * metaphor for managing limited energy. Three horizontal spoons
 * arranged like a hamburger menu create our unique brand identity.
 */

interface SpoonBurgerIconProps {
  className?: string;
  size?: number;
}

export function SpoonBurgerIcon({
  className = '',
  size = 24,
}: SpoonBurgerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Three minimal spoons - handle left, bowl right */}

      {/* Top spoon */}
      <rect x="3" y="5" width="12" height="1.2" rx="0.6" fill="currentColor" />
      <ellipse cx="18" cy="5.6" rx="3" ry="1.8" fill="currentColor" />

      {/* Middle spoon */}
      <rect
        x="3"
        y="11.5"
        width="12"
        height="1.2"
        rx="0.6"
        fill="currentColor"
      />
      <ellipse cx="18" cy="12.1" rx="3" ry="1.8" fill="currentColor" />

      {/* Bottom spoon */}
      <rect x="3" y="18" width="12" height="1.2" rx="0.6" fill="currentColor" />
      <ellipse cx="18" cy="18.6" rx="3" ry="1.8" fill="currentColor" />
    </svg>
  );
}
