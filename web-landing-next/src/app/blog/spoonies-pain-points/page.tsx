import type { Metadata } from 'next';

import { BlogNav } from '@/components/blog/BlogNav';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { SpooniesBlogContent } from '@/components/blog/SpooniesBlogContent';
import { Footer } from '@/components/layout/Footer';

/**
 * Spoonies Pain Points Blog Post
 *
 * Why this exists: Deep-dive research article on what chronic illness
 * patients experience with symptom tracking apps - their challenges,
 * pain points, and wishlist for a better solution.
 */

export const metadata: Metadata = {
  title: 'Experiences of Spoonies with Symptom Tracking Apps',
  description:
    'A comprehensive research-backed look at the challenges chronic illness patients face with symptom tracking, and what they want in a better solution.',
  openGraph: {
    title: 'Experiences of Spoonies with Symptom Tracking Apps',
    description:
      'A comprehensive research-backed look at the challenges chronic illness patients face with symptom tracking.',
    type: 'article',
    publishedTime: '2026-01-01',
    authors: ['Chronic Life Research'],
    tags: [
      'Spoonie Community',
      'User Research',
      'Symptom Tracking',
      'Chronic Illness',
    ],
  },
};

export default function SpooniesPainPointsPage() {
  return (
    <div className="bg-bg-cream min-h-screen">
      <ReadingProgress />
      <BlogNav />
      <SpooniesBlogContent />
      <Footer />
    </div>
  );
}
