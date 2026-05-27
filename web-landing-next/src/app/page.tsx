import type { Metadata } from 'next';

import { LandingPage } from '@/components/LandingPage';
import { spoonSaverContent } from '@/content/pages/spoon-saver';

/**
 * Home Landing Page
 * basically same as spoon-saver page
 * Why this exists: Main landing page for general chronic illness audience.
 */

export const metadata: Metadata = {
  title: spoonSaverContent.meta.title,
  description: spoonSaverContent.meta.description,
};

export default function SpoonSaverPage() {
  return <LandingPage content={spoonSaverContent} />;
}
