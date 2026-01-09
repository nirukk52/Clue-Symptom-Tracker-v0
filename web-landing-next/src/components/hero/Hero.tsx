'use client';

import type { HeroContent, PersonaKey } from '@/types';
import { ConditionPills } from './ConditionPills';
import { HeroPersona } from './HeroPersona';
import { Button } from '@/components/ui/Button';

/**
 * Hero - Visible-style hero with centered content and persona at bottom
 *
 * Why this exists: Matches the Visible app layout where:
 * - Mobile: Rounded card with cream wrapper
 * - Content is centered with headline, subheadline, CTA, then pills
 * - Persona image sits at the bottom of the card
 * - Desktop: Full-bleed with side-by-side layout
 */

interface HeroProps {
  content: HeroContent;
  conditions: string[];
  persona?: PersonaKey;
  onCtaClick: () => void;
  variant?: 'default' | 'alt1' | 'alt2' | 'altFocus';
}

export function Hero({
  content,
  conditions,
  persona = 'maya',
  onCtaClick,
  variant = 'default',
}: HeroProps) {
  // Select headline based on variant
  const headline = variant === 'default'
    ? content.headlines.default
    : variant === 'alt1'
    ? content.headlines.alt1 || content.headlines.default
    : variant === 'alt2'
    ? content.headlines.alt2 || content.headlines.default
    : content.headlines.altFocus || content.headlines.default;

  const ctaText = variant === 'altFocus' && content.altCtaText
    ? content.altCtaText
    : content.ctaText;

  const ctaId = variant === 'altFocus' && content.altCtaId
    ? content.altCtaId
    : content.ctaId;

  return (
    <section className="hero-wrapper">
      <div className="hero-visible">
        {/* Hero content - centered on mobile, left-aligned on desktop */}
        <div className="hero-content">
          {/* Main headline */}
          <h1 className="hero-headline">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="hero-subheadline">
            {content.subheadline}
          </p>

          {/* Condition pills */}
          <ConditionPills
            conditions={conditions}
            className="hero-pills"
          />

          {/* CTA Button */}
          <Button
            variant="hero"
            onClick={onCtaClick}
            data-modal-trigger
            data-cta-id={ctaId}
            data-cta-text={ctaText}
            icon="arrow_forward"
          >
            {ctaText}
          </Button>
        </div>

        {/* Persona image - centered at bottom on mobile, right side on desktop */}
        <HeroPersona persona={persona} />
      </div>
    </section>
  );
}
