import Link from 'next/link';

/**
 * Footer - Cream-themed footer matching landing page design
 *
 * Why this exists: Consistent footer across all landing pages
 * with brand logo, navigation links, and copyright.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-cream border-primary/5 border-t px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary flex size-8 items-center justify-center rounded-xl">
              <span className="font-display text-sm font-bold text-white">
                C
              </span>
            </div>
            <span className="font-display text-primary font-semibold">
              Chronic Life
            </span>
          </div>

          {/* Links */}
          <div className="text-text-muted flex gap-8 text-sm font-medium">
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:hello@chroniclife.app"
              className="hover:text-primary transition-colors"
            >
              Support
            </a>
          </div>

          {/* Copyright */}
          <p className="text-text-muted text-sm">
            © {currentYear} Chronic Life. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
