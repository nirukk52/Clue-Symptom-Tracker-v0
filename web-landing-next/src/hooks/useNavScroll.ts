'use client';

import { useEffect, useState } from 'react';

/**
 * useNavScroll - Detects scroll position to toggle navbar style
 *
 * Why this exists: Navbar transitions from transparent (on hero) to solid
 * (after scrolling past hero). Previously inline JS in each HTML file.
 */

interface UseNavScrollOptions {
  /** Scroll threshold in pixels (default: window height) */
  threshold?: number;
}

export function useNavScroll({ threshold }: UseNavScrollOptions = {}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Use provided threshold or default to 80% of viewport height
      const scrollThreshold = threshold ?? window.innerHeight * 0.8;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    // Check initial position
    handleScroll();

    // Add scroll listener with passive option for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isScrolled };
}
