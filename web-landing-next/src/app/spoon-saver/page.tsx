import type { Metadata } from 'next';
import { spoonSaverContent } from '@/content/pages/spoon-saver';
import { LandingPage } from '@/components/LandingPage';

/**
 * Spoon Saver Landing Page
 *
 * Why this exists: Product-specific landing page for the "low energy tracking" angle.
 */

export const metadata: Metadata = {
  title: spoonSaverContent.meta.title,
  description: spoonSaverContent.meta.description,
};

export default function SpoonSaverPage() {
  return <LandingPage content={spoonSaverContent} />;
}
