import type { Metadata } from 'next';

import { BlogCard } from '@/components/blog/BlogCard';
import { BlogNav } from '@/components/blog/BlogNav';
import { Footer } from '@/components/layout/Footer';

/**
 * Blog Index Page
 *
 * Why this exists: Central hub for all Chronic Life blog content.
 * Showcases research, insights, and resources for the chronic illness community.
 */

export const metadata: Metadata = {
  title: 'Blog - Insights for Chronic Illness Management',
  description:
    'Research, insights, and resources for people managing chronic conditions. Learn from the experiences of the spoonie community.',
};

const blogPosts = [
  {
    slug: 'spoonies-pain-points',
    title: 'Experiences of Spoonies with Symptom Tracking Apps',
    description:
      'A deep dive into the challenges, pain points, and wishlist of chronic illness patients when it comes to symptom tracking. Based on firsthand accounts from Reddit, forums, and patient communities.',
    category: 'Research',
    readTime: '25 min read',
    date: 'January 2026',
    featured: true,
    tags: [
      'Spoonie Community',
      'User Research',
      'Pain Points',
      'Product Design',
    ],
  },
];

export default function BlogPage() {
  return (
    <div className="bg-bg-cream min-h-screen">
      <BlogNav />

      {/* Hero Section */}
      <section className="px-4 pb-16 pt-32 md:px-6 md:pb-20 md:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <span className="bg-accent-purple/20 text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium">
            Research & Insights
          </span>
          <h1 className="font-display text-primary text-4xl font-semibold md:text-5xl lg:text-6xl">
            Understanding <br className="hidden md:block" />
            <span className="from-accent-purple to-accent-blue bg-gradient-to-r bg-clip-text text-transparent">
              Chronic Life
            </span>
          </h1>
          <p className="text-text-muted mt-6 text-lg md:text-xl">
            Insights from the community, research-backed approaches, and
            resources to help you manage chronic conditions better.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-4 pb-16 md:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-primary mb-8 text-2xl font-semibold">
            Featured Article
          </h2>
          {blogPosts
            .filter((post) => post.featured)
            .map((post) => (
              <BlogCard key={post.slug} {...post} variant="featured" />
            ))}
        </div>
      </section>

      {/* All Posts */}
      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-primary mb-8 text-2xl font-semibold">
            All Articles
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
