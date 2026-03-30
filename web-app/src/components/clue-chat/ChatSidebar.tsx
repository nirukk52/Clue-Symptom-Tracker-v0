'use client';

import { useCallback, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

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
  /** Whether the user is logged in (has authenticated session) */
  isLoggedIn?: boolean;
}

export function ChatSidebar({
  isOpen,
  onClose,
  user,
  activeNavId,
  onNavClick,
  isLoggedIn = false,
}: ChatSidebarProps) {
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  /**
   * Handle Google Sign In - triggers OAuth flow
   * Why: Allows users to sign in directly from the sidebar
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoginLoading(true);

    try {
      // Store return URL for redirect back after auth
      sessionStorage.setItem('pending_chat_redirect', 'true');
      sessionStorage.setItem(
        'pending_chat_return_url',
        window.location.pathname
      );

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });

      if (oauthError) {
        console.error('Google auth error:', oauthError);
        setIsLoginLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (err) {
      console.error('Google auth error:', err);
      setIsLoginLoading(false);
    }
  }, []);

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
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3 overflow-hidden shrink-0">
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
        <nav className="flex flex-col items-center w-full px-2">
          {CLUE_NAV_ITEMS.map((item, index) => (
            <div key={item.id} className="w-full">
              <button
                type="button"
                className={`relative flex flex-col items-center justify-center gap-1 py-3 px-1 w-full border-none bg-transparent cursor-pointer rounded-lg transition-all ${
                  activeNavId === item.id
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-text-muted hover:bg-primary/5 hover:text-primary'
                }`}
                onClick={() => onNavClick?.(item)}
                aria-current={activeNavId === item.id ? 'page' : undefined}
              >
                {/* Active indicator bar */}
                {activeNavId === item.id && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />
                )}
                <MaterialIcon name={item.icon} size="sm" />
                <span className="text-[9px] font-medium text-center leading-tight whitespace-pre-line">
                  {item.label}
                </span>
              </button>
              {/* Subtle divider between items */}
              {index < CLUE_NAV_ITEMS.length - 1 && (
                <div className="mx-auto w-10 h-px bg-primary/8 my-0.5" />
              )}
            </div>
          ))}
        </nav>

        {/* Spacer to push login button/avatar to bottom */}
        <div className="flex-1" />

        {/* Login button when logged out, user avatar when logged in */}
        {isLoggedIn ? (
          <div
            className="w-10 h-10 rounded-full bg-primary/10 border-2 border-solid border-primary/30 flex items-center justify-center overflow-hidden relative"
            title={user.email ?? 'Logged in'}
            aria-label="Your profile"
          >
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full object-cover absolute inset-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="text-primary text-xs font-semibold">
              {user.initials}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoginLoading}
            className="w-10 h-10 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sign in with Google"
            aria-label="Sign in with Google"
          >
            {isLoginLoading ? (
              <MaterialIcon
                name="progress_activity"
                size="sm"
                className="text-primary animate-spin"
              />
            ) : (
              <MaterialIcon
                name="person"
                size="sm"
                className="text-primary/60"
              />
            )}
          </button>
        )}
      </aside>
    </>
  );
}
