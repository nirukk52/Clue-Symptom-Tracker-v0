'use client';

import { SpoonBurgerIcon } from '@/components/ui/SpoonBurgerIcon';

/**
 * ChatHeader - Mobile chat chrome with menu control
 *
 * Why this exists: Opens the sidebar via SpoonBurgerIcon on small screens
 * without duplicating sidebar branding in the top bar. Hidden on large
 * breakpoints where the sidebar is always visible.
 */

interface ChatHeaderProps {
  onMenuClick: () => void;
  onNewConversation?: () => void;
  showCanvasPattern?: boolean;
}

export function ChatHeader({ onMenuClick, showCanvasPattern = false }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 overflow-hidden bg-bg-cream lg:hidden">
      {showCanvasPattern && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(32, 19, 46, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}
      <div className="relative flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          className="w-10 h-10 shrink-0 flex items-center justify-center border-none bg-primary/10 text-primary cursor-pointer rounded-lg hover:bg-primary/15 focus:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-cream transition-colors"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <SpoonBurgerIcon size={24} />
        </button>
      </div>
    </header>
  );
}
