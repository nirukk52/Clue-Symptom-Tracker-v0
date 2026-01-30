'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

import { CLUE_NAV_ITEMS, type ChatUser, type NavItem } from './types';

/**
 * ChatSidebar - Collapsible navigation sidebar for ClueChat
 *
 * Why this exists: Provides navigation to different sections matching
 * the aicofounder.com design. Shows on mobile as overlay, on desktop
 * it's always visible alongside the chat panel.
 */

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: ChatUser;
  activeNavId?: string;
  onNavClick?: (navItem: NavItem) => void;
}

export function ChatSidebar({
  isOpen,
  onClose,
  user,
  activeNavId,
  onNavClick,
}: ChatSidebarProps) {
  return (
    <>
      {/* Backdrop overlay - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/30 z-40 animate-[fadeIn_0.2s_ease] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel - fixed on mobile (slides in), static on desktop */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[76px] bg-bg-cream border-r border-primary/8 z-50 flex flex-col items-center py-4 gap-1 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto lg:translate-x-0`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* User avatar - rounded square like in the design */}
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3 overflow-hidden flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.initials}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-semibold tracking-wider">
              {user.initials}
            </span>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col items-center gap-0.5 w-full px-2">
          {CLUE_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 w-full border-none bg-transparent cursor-pointer rounded-xl transition-all ${
                activeNavId === item.id
                  ? 'bg-primary-light text-primary'
                  : 'text-text-muted hover:bg-primary/5 hover:text-primary'
              }`}
              onClick={() => onNavClick?.(item)}
            >
              <MaterialIcon name={item.icon} size="sm" />
              <span className="text-[10px] font-medium text-center leading-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
