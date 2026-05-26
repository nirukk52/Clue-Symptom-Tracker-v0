import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Privacy Page
 *
 * Why this exists: Footer links in landing.html pointed to /privacy but the
 * route did not exist, returning 404. The Chronic Life Web App review on
 * 2026-05-26 flagged this as a production risk because the app collects
 * health-adjacent data (symptoms, medication notes, mood). This route
 * provides a plain-language privacy summary plus a gentle disclaimer that
 * the product is not a substitute for clinical care.
 */
export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'How Chronic Life handles your symptom, mood, and medication notes. Plain-language summary plus a note on data scope.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = '2026-05-26';

export default function PrivacyPage() {
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
            Privacy
          </h1>
          <p className="text-text-muted">Last updated {LAST_UPDATED}</p>
        </header>

        <section className="mb-8 rounded-2xl border border-accent-peach/30 bg-accent-peach/10 p-5">
          <h2 className="font-semibold text-primary mb-2">A note before you read</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Chronic Life is a tracking and pattern-recognition tool. It is not a
            medical device and does not provide medical advice, diagnosis, or
            treatment. Please talk with a qualified clinician about decisions
            that affect your health.
          </p>
        </section>

        <article className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            What we collect
          </h2>
          <p className="text-text-muted leading-relaxed">
            When you use Chronic Life, you may share information about how you
            feel: symptom check-ins, mood ratings, medications you have taken,
            sleep and energy notes, free-form chat messages with the Clue
            assistant, and the conditions you choose to track. We also receive
            standard account information if you sign in (such as your email
            address) and basic technical signals (such as the type of device
            you are using).
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            How we use it
          </h2>
          <p className="text-text-muted leading-relaxed">
            Your entries are used to power the features you can see: showing
            your history, generating insights about possible patterns,
            assembling doctor-ready summaries, and helping the Clue assistant
            ask better next questions over time. We also use aggregate,
            de-identified usage signals to understand which parts of the app
            help people and which ones do not.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Where it lives
          </h2>
          <p className="text-text-muted leading-relaxed">
            Account data and your tracked entries are stored in our database
            with row-level security so other users cannot read them. AI
            features may send the minimum amount of text needed to compute a
            reply to language-model providers we work with. We do not sell
            your personal data and we do not use your symptom entries to train
            third-party advertising models.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Your choices
          </h2>
          <ul className="text-text-muted leading-relaxed list-disc pl-5 space-y-2">
            <li>You can stop tracking at any time.</li>
            <li>You can request a copy of the entries on your account.</li>
            <li>You can request deletion of your account and the data on it.</li>
          </ul>
          <p className="text-text-muted leading-relaxed mt-4">
            To make a request, email{' '}
            <a
              href="mailto:hello@chroniclife.app"
              className="text-primary underline hover:no-underline"
            >
              hello@chroniclife.app
            </a>
            .
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Children
          </h2>
          <p className="text-text-muted leading-relaxed">
            Chronic Life is intended for adults. We do not knowingly collect
            data from children under 13. If you believe a child has provided
            information to us, please contact us so we can remove it.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Changes
          </h2>
          <p className="text-text-muted leading-relaxed">
            We may update this page as the product evolves. When we make
            material changes we will update the date at the top and, where
            appropriate, let you know inside the app.
          </p>

          <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-3">
            Contact
          </h2>
          <p className="text-text-muted leading-relaxed">
            Questions or concerns? Reach us at{' '}
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
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
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
