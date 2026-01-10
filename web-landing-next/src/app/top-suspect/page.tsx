import type { Metadata } from 'next';

import { LandingPage } from '@/components/LandingPage';
import { topSuspectContent } from '@/content/pages/top-suspect';

/**
 * Top Suspect Landing Page
 *
 * Why this exists: Product-specific landing page for the "find triggers" angle.
 */

export const metadata: Metadata = {
  title: topSuspectContent.meta.title,
  description: topSuspectContent.meta.description,
};

export default function TopSuspectPage() {
  return <LandingPage content={topSuspectContent} />;
}
