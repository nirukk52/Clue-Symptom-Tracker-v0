'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Citation - Interactive citation with hover tooltip
 *
 * Why this exists: Makes academic-style citations interactive
 * and accessible without disrupting reading flow.
 */

interface CitationProps {
  number: string | number;
  url: string;
  text?: string;
}

export function Citation({ number, url, text }: CitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (showTooltip && tooltipRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Adjust position if tooltip goes off screen
      if (buttonRect.left + tooltipRect.width > window.innerWidth - 20) {
        tooltipRef.current.style.left = 'auto';
        tooltipRef.current.style.right = '0';
      }
    }
  }, [showTooltip]);

  return (
    <span className="relative inline">
      <a
        ref={buttonRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{number}]
      </a>
      {showTooltip && text && (
        <span
          ref={tooltipRef}
          className="bg-primary absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg p-3 text-xs leading-relaxed text-white shadow-lg"
        >
          {text}
          <span className="bg-primary absolute -bottom-1.5 left-4 size-3 rotate-45" />
        </span>
      )}
    </span>
  );
}
