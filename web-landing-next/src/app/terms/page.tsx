import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Terms Page
 *
 * Why this exists: Footer links pointed to /terms but the route did not
 * exist (404). The Chronic Life Web App review on 2026-05-26 flagged this
 * as a production risk for a health-adjacent product. This route states
 * the basic terms of using Chronic Life and re-emphasizes that the product
 * is not a substitute for medical care.
 */
export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The terms for using Chronic Life. Plain-language summary plus the not-medical-advice note.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '2026-05-26';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-cream text-text-main">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-text-muted hover:text-primary transition-colors">
            &larr; Back to Chronic Life
          </Link>
        </nav>

        <header className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary mb-3">
            Terms
          </h1>
          <p className="text-text-muted">Last updated {LAST_UPDATED}</p>
        </header>

        <section className="mb-8 rounded-2xl border border-accent-peach/30 bg-accent-peach/10 p-5">
          <h2 className="font-semibold text-primary mb-2">Not medical advice</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Chronic Life is a tracking and pattern-recognition tool. It is not
            a medical device and the information it shows you is not a
            substitute for professional medical advice, diagnosis, or
            treatment. Please consult a qualified clinician for decisions
            about your health, especially in an emergency. If you are
            experiencing a medical emergency, call your local emergency
            number.
          </p>
        </section>

        <article className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Using Chronic Life
          </h2>
          <p className="text-text-muted leading-relaxed">
            You may use Chronic Life to log your own symptoms, moods,
            medications, and notes, and to receive feedback or summaries
            based on the data you choose to enter. Please use the app for
            yourself or for someone in your care, and only with their
            knowledge.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Your account
          </h2>
          <p className="text-text-muted leading-relaxed">
            If you sign in, you are responsible for keeping your account
            secure. Please do not share your account with people you do not
            trust with your health information. You can request account
            deletion at any time by emailing{' '}
            <a
              href="mailto:hello@chroniclife.app"
              className="text-primary underline hover:no-underline"
            >
              hello@chroniclife.app
            </a>
            .
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            What we promise
          </h2>
          <p className="text-text-muted leading-relaxed">
            We work hard to keep the service useful and your data safe, but
            Chronic Life is provided on an &ldquo;as is&rdquo; basis. We do
            not promise that the service will be uninterrupted, error-free,
            or that any pattern surfaced by the app is clinically accurate
            for your situation. Insights are generated with AI and should
            always be reviewed by you and, where relevant, by your
            clinician.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            What we ask of you
          </h2>
          <ul className="text-text-muted leading-relaxed list-disc pl-5 space-y-2">
            <li>Do not use Chronic Life to log entries about someone else without their permission.</li>
            <li>Do not try to break, scrape, or overload the service.</li>
            <li>Do not rely on the app alone for urgent health decisions.</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Changes
          </h2>
          <p className="text-text-muted leading-relaxed">
            We may update these terms as the product evolves. We will update
            the date at the top of this page when we do, and we will notify
            you inside the app for material changes.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Contact
          </h2>
          <p className="text-text-muted leading-relaxed">
            Questions about these terms? Email us at{' '}
            <a
              href="mailto:hello@chroniclife.app"
              className="text-primary underline hover:no-underline"
            >
              hello@chroniclife.app
            </a>
            .
          </p>
        </article>

        <footer className="mt-16 pt-8 border-t border-primary/10 text-sm text-text-muted">
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/chat" className="hover:text-primary transition-colors">
              Open Chronic Life
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
