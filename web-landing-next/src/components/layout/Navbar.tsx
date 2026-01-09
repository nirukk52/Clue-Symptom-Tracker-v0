'use client';

import Link from 'next/link';
import { useNavScroll } from '@/hooks/useNavScroll';
import { Button } from '@/components/ui/Button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

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
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 border-b ${
        isScrolled ? 'nav-solid' : 'nav-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="nav-logo-icon w-8 h-8 rounded-full flex items-center justify-center">
            <MaterialIcon name="monitoring" size="sm" className="text-white" />
          </div>
          <span className="nav-logo-text font-display font-semibold text-lg">
            Chronic Life
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#how-it-works" className="nav-link text-sm font-medium hover:opacity-80 transition-opacity">
            How it works
          </Link>
          <Link href="#features" className="nav-link text-sm font-medium hover:opacity-80 transition-opacity">
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
