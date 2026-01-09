import type { Metadata } from 'next';
import { crashPreventionContent } from '@/content/pages/crash-prevention';
import { LandingPage } from '@/components/LandingPage';

/**
 * Crash Prevention Landing Page
 *
 * Why this exists: Product-specific landing page for the "pacing/energy" angle.
 */

export const metadata: Metadata = {
  title: crashPreventionContent.meta.title,
  description: crashPreventionContent.meta.description,
};

export default function CrashPreventionPage() {
  return <LandingPage content={crashPreventionContent} />;
}
