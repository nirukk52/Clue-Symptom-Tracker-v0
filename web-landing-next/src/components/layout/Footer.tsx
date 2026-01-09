import Link from 'next/link';

/**
 * Footer - Simple footer with links and copyright
 *
 * Why this exists: Consistent footer across all landing pages.
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl font-semibold mb-2">
              Chronic Life
            </h3>
            <p className="text-white/70 text-sm">
              Predict your next flare before it hits.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
              Terms
            </Link>
            <a
              href="mailto:hello@chroniclife.app"
              className="text-white/70 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
          © {currentYear} Chronic Life. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
