'use client';

import Image from 'next/image';

import type { PersonaKey } from '@/types';

/**
 * HeroPersona - Persona image positioned inside hero card
 *
 * Why this exists: Displays persona images in the Visible-style layout where
 * the persona is at the bottom of the hero card, not bleeding off the edge.
 */

interface HeroPersonaProps {
  persona?: PersonaKey;
  className?: string;
}

const personaImages: Record<PersonaKey, { src: string; alt: string }> = {
  maya: {
    src: '/personas/maya6.png',
    alt: 'Maya, living with chronic fatigue and fibromyalgia',
  },
  jordan: {
    src: '/personas/jordan.png',
    alt: 'Jordan, managing ME/CFS and brain fog',
  },
  marcus: {
    src: '/personas/marcus.png',
    alt: 'Marcus, living with long COVID and POTS',
  },
};

export function HeroPersona({
  persona = 'maya',
  className = '',
}: HeroPersonaProps) {
  const { src, alt } = personaImages[persona];

  return (
    <div className={`hero-persona-container ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={400}
        height={500}
        className="hero-persona-image"
        priority
      />
    </div>
  );
}
