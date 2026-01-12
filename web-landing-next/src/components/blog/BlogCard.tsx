import Link from 'next/link';

/**
 * BlogCard - Card component for blog post previews
 *
 * Why this exists: Consistent display of blog posts in listings
 * with hover effects and metadata display.
 */

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  featured?: boolean;
  tags?: string[];
  variant?: 'default' | 'featured';
}

export function BlogCard({
  slug,
  title,
  description,
  category,
  readTime,
  date,
  tags = [],
  variant = 'default',
}: BlogCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/blog/${slug}`} className="group block">
        <article className="border-primary/5 hover:shadow-hover overflow-hidden rounded-3xl border bg-white transition-all duration-300 hover:-translate-y-1">
          {/* Gradient Header */}
          <div className="from-accent-purple/30 via-accent-blue/20 to-accent-mint/30 relative h-48 overflow-hidden bg-gradient-to-br md:h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-2 px-8">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary rounded-full bg-white/80 px-3 py-1 text-xs font-medium backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Decorative elements */}
            <div className="bg-accent-purple/20 absolute -bottom-20 -left-20 size-40 rounded-full blur-3xl" />
            <div className="bg-accent-blue/30 absolute -right-10 -top-10 size-32 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="bg-accent-purple/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                {category}
              </span>
              <span className="text-text-muted text-sm">{readTime}</span>
              <span className="text-text-muted text-sm">•</span>
              <span className="text-text-muted text-sm">{date}</span>
            </div>
            <h3 className="font-display text-primary group-hover:text-accent-purple text-2xl font-semibold transition-colors md:text-3xl">
              {title}
            </h3>
            <p className="text-text-muted mt-3 md:text-lg">{description}</p>
            <div className="text-primary mt-6 flex items-center gap-2 text-sm font-semibold">
              Read article
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="border-primary/5 hover:shadow-hover h-full overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1">
        <div className="mb-3 flex items-center gap-3">
          <span className="bg-accent-purple/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
            {category}
          </span>
          <span className="text-text-muted text-sm">{readTime}</span>
        </div>
        <h3 className="font-display text-primary group-hover:text-accent-purple text-xl font-semibold transition-colors">
          {title}
        </h3>
        <p className="text-text-muted mt-2 line-clamp-3">{description}</p>
        <div className="text-primary mt-4 flex items-center gap-2 text-sm font-semibold">
          Read more
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </article>
    </Link>
  );
}
