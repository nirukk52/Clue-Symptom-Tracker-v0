'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * ChatHeader - Minimal header with hamburger menu
 *
 * Why this exists: Provides a clean, minimal header that matches the
 * aicofounder design. Hamburger menu visible on mobile only (sidebar
 * is always visible on desktop).
 */

interface ChatHeaderProps {
  onMenuClick: () => void;
}

export function ChatHeader({ onMenuClick }: ChatHeaderProps) {
  return (
    <header className="flex items-center px-4 py-3 sticky top-0 z-10 bg-bg-cream lg:hidden">
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center border-none bg-primary/10 text-primary cursor-pointer rounded-lg hover:bg-primary/15 focus:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-cream transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <MaterialIcon name="menu" size="md" />
      </button>
    </header>
  );
}
