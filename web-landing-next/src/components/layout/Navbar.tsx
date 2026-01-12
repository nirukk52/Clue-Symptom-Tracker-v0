'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { SpoonBurgerIcon } from '@/components/ui/SpoonBurgerIcon';
import { useNavScroll } from '@/hooks/useNavScroll';

/**
 * Navbar - Fixed navigation with transparent/solid states
 *
 * Why this exists: Navbar style changes based on scroll position.
 * Transparent when over hero, solid white after scrolling.
 * Previously ~100 lines duplicated in each HTML file.
 */

interface NavbarProps {
  onCtaClick?: () => void;
}

export function Navbar({ onCtaClick }: NavbarProps) {
  const { isScrolled } = useNavScroll();

  return (
    <nav
      id="mainNav"
      className={`fixed inset-x-0 top-0 z-50 border-b px-4 py-3 md:px-6 ${
        isScrolled ? 'nav-solid' : 'nav-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between md:pt-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SpoonBurgerIcon size={28} className="nav-logo-icon" />
          <span className="nav-logo-text font-display text-lg font-semibold">
            Chronic Life
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#how-it-works"
            className="nav-link text-sm font-medium transition-opacity hover:opacity-80"
          >
            How it works
          </Link>
          <Link
            href="#features"
            className="nav-link text-sm font-medium transition-opacity hover:opacity-80"
          >
            Features
          </Link>
        </div>

        {/* CTA Button */}
        <Button
          variant={isScrolled ? 'nav-solid' : 'nav'}
          onClick={onCtaClick}
          data-modal-trigger
          data-cta-id="nav_cta"
          data-cta-text="Get early access"
        >
          Get early access
        </Button>
      </div>
    </nav>
  );
}
