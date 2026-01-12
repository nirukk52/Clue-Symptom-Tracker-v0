'use client';

import { useEffect, useState } from 'react';

/**
 * TableOfContents - Sticky navigation for long-form blog posts
 *
 * Why this exists: Helps readers navigate long research articles
 * and keeps track of their reading progress.
 */

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden xl:block">
      <div className="sticky top-28 w-64">
        <h4 className="text-text-muted mb-4 text-xs font-semibold uppercase tracking-wider">
          On this page
        </h4>
        <ul className="border-primary/10 space-y-2 border-l">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`block w-full py-1 pl-4 text-left text-sm transition-all ${
                  item.level === 3 ? 'pl-8 text-xs' : ''
                } ${
                  activeId === item.id
                    ? 'border-accent-purple text-primary -ml-px border-l-2 font-medium'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
