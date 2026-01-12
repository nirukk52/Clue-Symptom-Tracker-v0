'use client';

import Link from 'next/link';

import { SpoonBurgerIcon } from '@/components/ui/SpoonBurgerIcon';

/**
 * BlogNav - Navigation for blog pages
 *
 * Why this exists: Blog pages need a solid-background navigation
 * that contrasts with the cream background, unlike the landing page
 * which has transparent nav over the hero.
 */

export function BlogNav() {
  return (
    <nav className="border-primary/5 fixed inset-x-0 top-0 z-50 border-b bg-white/95 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between md:pt-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SpoonBurgerIcon size={28} className="text-primary" />
          <span className="font-display text-primary text-lg font-semibold">
            Chronic Life
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className="text-primary text-sm font-medium transition-opacity hover:opacity-70"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all"
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </nav>
  );
}
