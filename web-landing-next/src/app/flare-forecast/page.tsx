import type { Metadata } from 'next';
import { flareForecastContent } from '@/content/pages/flare-forecast';
import { LandingPage } from '@/components/LandingPage';

/**
 * Flare Forecast Landing Page
 *
 * Why this exists: Product-specific landing page for the "predict flares" angle.
 * All content comes from the config file - this file just wires it up.
 */

export const metadata: Metadata = {
  title: flareForecastContent.meta.title,
  description: flareForecastContent.meta.description,
};

export default function FlareForecastPage() {
  return <LandingPage content={flareForecastContent} />;
}
