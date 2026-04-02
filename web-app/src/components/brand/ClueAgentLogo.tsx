/**
 * ClueAgentLogo / ClueAgentMark
 *
 * Why this exists: Gives the Clue AI agent a consistent visual identity (favicon,
 * sidebar, and chat chrome) aligned with Chronic Life brand tokens without relying
 * on generic icons or placeholder art.
 */

type MarkProps = {
  /** Pixel width and height; maps to the 48×48 viewBox. */
  size?: number;
  className?: string;
  /** Accessible name when the mark is meaningful (e.g. sidebar branding). */
  'aria-label'?: string;
  /** Set false when wrapped inside another labeled control. */
  decorative?: boolean;
};

/**
 * Square app mark: deep-purple tile, mint trajectory curve, peach “insight” dot.
 * Why: Reads at small sizes and echoes “spot the pattern before the flare.”
 */
export function ClueAgentMark({
  size = 40,
  className,
  'aria-label': ariaLabel = 'Clue',
  decorative = false,
}: MarkProps) {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': ariaLabel };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...a11y}
    >
      <rect width="48" height="48" rx="14" fill="#20132e" />
      {/* Uplifting ribbon: sweeps up with energy toward the insight dot */}
      <path
        d="M12 38 C14 34, 14 28, 18 22 Q22 16, 30 14 Q34 13, 36 16 L34 19 Q32 17, 28 18 Q22 20, 18 26 C15 31, 15 35, 14 39 Z"
        fill="#b8e3d6"
      />
      {/* Peach insight dot — the bright moment of clarity */}
      <circle cx="36" cy="15" r="4.5" fill="#e8974f" />
    </svg>
  );
}

type LogoProps = {
  /** Size of the square mark in pixels. */
  markSize?: number;
  className?: string;
};

/**
 * Horizontal lockup: mark + “Clue” word set in the app display face.
 * Why: Used in mobile chat chrome where a wordmark improves scanability.
 */
export function ClueAgentLogo({ markSize = 28, className }: LogoProps) {
  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <ClueAgentMark size={markSize} decorative />
      <span className="font-display text-[1.125rem] font-semibold text-primary leading-none tracking-tight">
        Clue
      </span>
    </div>
  );
}
