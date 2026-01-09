import type { Metadata } from 'next';
import { homeContent } from '@/content/pages/home';
import { LandingPage } from '@/components/LandingPage';

/**
 * Home Landing Page
 *
 * Why this exists: Main landing page for general chronic illness audience.
 */

export const metadata: Metadata = {
  title: homeContent.meta.title,
  description: homeContent.meta.description,
};

export default function HomePage() {
  return <LandingPage content={homeContent} />;
}
