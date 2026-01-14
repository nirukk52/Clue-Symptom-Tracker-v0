'use client';

import { useRef, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Testimonial } from '@/types';

/**
 * Testimonials Section - Hero-style carousel with gradient cards
 *
 * Why this exists: Social proof using verbatim quotes from r/ChronicIllness,
 * r/BearableApp, r/POTS. Now redesigned as a carousel with hero-inspired
 * gradient cards and persona silhouettes for visual impact.
 */

interface TestimonialsProps {
  testimonials: Testimonial[];
  onCtaClick: (ctaId?: string) => void;
}

/**
 * Persona silhouettes for testimonial cards
 * Rotates through different silhouette styles
 */
const personaSilhouettes = [
  '/personas/maya4.png',
  '/personas/jordan.png',
  '/personas/marcus.png',
];

/**
 * Color sequence for cards - repeats every 4 cards
 * Based on the good color schemes from the first 4 cards
 */
const colorSequence = [
  'from-rose-400/20 to-transparent', // Card 1, 5, 9
  'from-blue-400/20 to-transparent', // Card 2, 6, 10
  'from-teal-400/20 to-transparent', // Card 3, 7, 11
  'from-purple-400/20 to-transparent', // Card 4, 8
];

export function Testimonials({ testimonials, onCtaClick }: TestimonialsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Show all testimonials - carousel handles pagination
  const displayTestimonials = testimonials;

  // Mouse/touch drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section
      id="testimonials"
      className="bg-bg-cream relative overflow-hidden px-0 py-16 md:py-24"
    >
      {/* Section Header */}
      <div className="mx-auto mb-10 max-w-6xl px-4 text-center md:px-6">
        <div className="bg-accent-purple/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
          <MaterialIcon name="groups" size="sm" />
          From the Spoonie Community
        </div>
        <h2 className="font-display text-primary mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl">
          Real voices. Real struggles.
        </h2>
        <p className="text-text-muted mx-auto max-w-2xl text-lg">
          We listened to thousands of chronic illness patients to build
          something that finally understands.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scrollable Carousel */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:gap-6 md:px-[10%]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {displayTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              personaImage={
                personaSilhouettes[index % personaSilhouettes.length]
              }
              index={index}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <button
          onClick={() => onCtaClick('testimonials_cta')}
          className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
        >
          Learn more
          <MaterialIcon name="arrow_forward" size="sm" />
        </button>
      </div>
    </section>
  );
}

/**
 * Individual testimonial card with hero-style gradient
 * Original design restored - consistent styling across all card types
 */
interface TestimonialCardProps {
  testimonial: Testimonial;
  personaImage: string;
  index: number;
}

function TestimonialCard({
  testimonial,
  personaImage,
  index,
}: TestimonialCardProps) {
  // Cycle through 4-color sequence for consistency
  const accentGradient = colorSequence[index % 4];
  const isClueInsight = testimonial.isClueInsight;

  return (
    <div className="testimonial-card relative flex min-h-[400px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] md:min-h-[450px] md:w-[380px]">
      {/* Hero-style gradient background */}
      <div className="bg-hero-bg absolute inset-0" />

      {/* Radial gradient overlay - evening sky to sunset night */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            circle at 50% 95%,
            #6d8ba0 0%,
            rgba(140, 130, 150, 0.85) 50%,
            rgba(160, 120, 140, 0.8) 55%,
            rgba(140, 90, 120, 0.85) 60%,
            rgba(90, 60, 100, 0.9) 68%,
            rgba(50, 35, 70, 0.95) 85%,
            rgba(32, 19, 46, 0.98) 100%
          )`,
        }}
      />

      {/* Pain point accent gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${accentGradient}`} />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-6 md:p-8">
        {/* Source badge - original style */}
        <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
          <MaterialIcon
            name={isClueInsight ? 'auto_awesome' : 'forum'}
            size="sm"
            className="text-white/70"
          />
          {testimonial.source}
        </div>

        {/* Quote */}
        <blockquote className="mb-auto flex-1">
          <p
            className={`font-display text-xl font-medium leading-relaxed text-white md:text-2xl ${isClueInsight ? 'italic' : ''}`}
          >
            {isClueInsight ? (
              testimonial.quote
            ) : (
              <>&ldquo;{testimonial.quote}&rdquo;</>
            )}
          </p>
        </blockquote>

        {/* Condition tag - original style */}
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
          <span className="bg-accent-mint size-1.5 rounded-full" />
          {testimonial.condition || 'Chronic Illness'}
        </div>
      </div>

      {/* Persona silhouette at bottom */}
      <div className="relative z-10 flex h-[120px] items-end justify-center overflow-hidden md:h-[140px]">
        <div
          className="h-full w-auto opacity-40"
          style={{
            backgroundImage: `url(${personaImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat',
            width: '150px',
            filter: 'brightness(0.8) contrast(0.9)',
          }}
        />
      </div>
    </div>
  );
}
