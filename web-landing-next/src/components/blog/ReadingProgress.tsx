'use client';

import { useEffect, useState } from 'react';

/**
 * ReadingProgress - Progress bar showing how far user has read
 *
 * Why this exists: Provides visual feedback for long articles,
 * helping readers know their progress through the content.
 */

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-primary/5 fixed left-0 top-0 z-[100] h-1 w-full">
      <div
        className="from-accent-purple via-accent-blue to-accent-mint h-full bg-gradient-to-r transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
