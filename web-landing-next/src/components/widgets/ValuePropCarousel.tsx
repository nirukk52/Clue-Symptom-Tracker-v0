'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ValuePropCarousel - Swipeable carousel for Screen 4 value props
 *
 * Why this exists: Screen 4 needs to show 3 value props (baseline, promise, preview)
 * within a fixed-height modal without scrolling. A carousel lets users swipe
 * through each card while keeping quote at top and CTA at bottom fixed.
 *
 * Features:
 * - Touch/swipe support for mobile
 * - Keyboard navigation (left/right arrows)
 * - Minimalist dot indicators
 * - Auto-advance optional
 */

interface ValuePropCarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoAdvanceMs?: number; // Optional: auto-advance interval in ms
}

export function ValuePropCarousel({
  children,
  className = '',
  autoAdvanceMs,
}: ValuePropCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideCount = children.length;

  // Minimum swipe distance to trigger slide change (px)
  const minSwipeDistance = 50;

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, slideCount - 1)));
    },
    [slideCount]
  );

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-advance logic
  useEffect(() => {
    if (!autoAdvanceMs) return;
    const interval = setInterval(goNext, autoAdvanceMs);
    return () => clearInterval(interval);
  }, [autoAdvanceMs, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < slideCount - 1) {
      goNext();
    } else if (isRightSwipe && currentIndex > 0) {
      goPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse drag handlers (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStart === null) return;
    e.preventDefault();
    setDragOffset(e.clientX - touchStart);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (touchStart !== null && Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0 && currentIndex < slideCount - 1) {
        goNext();
      } else if (dragOffset > 0 && currentIndex > 0) {
        goPrev();
      }
    }

    setDragOffset(0);
    setTouchStart(null);
  };

  // Calculate transform including drag offset
  const getTransform = () => {
    const baseOffset = currentIndex * -100;
    const dragPercent = containerRef.current
      ? (dragOffset / containerRef.current.offsetWidth) * 100
      : 0;
    return `translateX(calc(${baseOffset}% + ${dragPercent}%))`;
  };

  return (
    <div className={`vp-carousel ${className}`}>
      {/* Carousel track */}
      <div
        ref={containerRef}
        className="vp-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className={`vp-carousel-track ${isDragging ? 'dragging' : ''}`}
          style={{ transform: getTransform() }}
        >
          {children.map((child, index) => (
            <div key={index} className="vp-carousel-slide">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Minimalist dot indicators */}
      <div className="vp-carousel-dots">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            className={`vp-carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            type="button"
          />
        ))}
      </div>

      <style jsx>{`
        .vp-carousel {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          gap: 0.75rem;
        }

        .vp-carousel-container {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          cursor: grab;
          touch-action: pan-y pinch-zoom;
        }

        .vp-carousel-container:active {
          cursor: grabbing;
        }

        .vp-carousel-track {
          display: flex;
          height: 100%;
          transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .vp-carousel-track.dragging {
          transition: none;
        }

        .vp-carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 0 0.25rem;
          box-sizing: border-box;
        }

        /* Minimalist dot indicators */
        .vp-carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.25rem 0;
        }

        .vp-carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.3);
          padding: 0;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .vp-carousel-dot:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .vp-carousel-dot.active {
          width: 18px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}

export default ValuePropCarousel;
