'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { PersonaKey } from '@/types';

/**
 * HeroPersona - Persona video/image positioned inside hero card
 *
 * Why this exists: Displays persona media in the Visible-style layout where
 * the persona is at the bottom of the hero card, not bleeding off the edge.
 * Video playback is controlled by scroll position for an engaging effect.
 */

interface HeroPersonaProps {
  persona?: PersonaKey;
  className?: string;
}

interface PersonaMedia {
  src: string;
  alt: string;
  type: 'video' | 'image';
}

const personaMedia: Record<PersonaKey, PersonaMedia> = {
  maya: {
    src: '/personas/maya6.png',
    alt: 'Maya, living with chronic fatigue and fibromyalgia',
    type: 'image',
  },
  jordan: {
    src: '/personas/jordan.png',
    alt: 'Jordan, managing ME/CFS and brain fog',
    type: 'image',
  },
  marcus: {
    src: '/personas/marcus.png',
    alt: 'Marcus, living with long COVID and POTS',
    type: 'image',
  },
};

/**
 * useScrollVideo - Hook to control video playback based on scroll position
 *
 * Why this exists: Creates an engaging scroll-driven animation effect where
 * the video scrubs forward/backward as the user scrolls past the element.
 */
function useScrollVideo(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Wait for video metadata to load so we know the duration
    const handleLoadedMetadata = () => {
      const duration = video.duration;

      const handleScroll = () => {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how far through the viewport the element has scrolled
        // 0 = element just entered viewport from bottom
        // 1 = element just left viewport from top
        const scrollProgress = Math.min(
          Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
          1
        );

        // Map scroll progress to video time
        video.currentTime = scrollProgress * duration;
      };

      // Initial position
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    };

    if (video.readyState >= 1) {
      // Metadata already loaded
      const cleanup = handleLoadedMetadata();
      return cleanup;
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoRef]);

  return containerRef;
}

export function HeroPersona({
  persona = 'maya',
  className = '',
}: HeroPersonaProps) {
  const { src, alt, type } = personaMedia[persona];
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollContainerRef = useScrollVideo(videoRef);

  // Only use scroll container ref for videos
  const containerRef = type === 'video' ? scrollContainerRef : undefined;

  return (
    <div ref={containerRef} className={`hero-persona-container ${className}`}>
      {type === 'video' ? (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="hero-persona-image"
          aria-label={alt}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={400}
          height={500}
          className="hero-persona-image"
          priority
        />
      )}
    </div>
  );
}
