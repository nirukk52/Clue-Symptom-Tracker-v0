'use client';

import { useCallback, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import {
  captureUTMParams,
  getSessionId,
  getStoredUTM,
  pushToDataLayer,
} from '@/lib/tracking';

/**
 * useTracking - Hook for page view and event tracking
 *
 * Why this exists: Encapsulates all tracking logic (Supabase + GTM) that was
 * duplicated in every HTML file. Now a single hook for all pages.
 */

interface UseTrackingOptions {
  pageId: string;
  pageTitle: string;
}

export function useTracking({ pageId, pageTitle }: UseTrackingOptions) {
  const hasTrackedPageView = useRef(false);

  // Track page view on mount (only once)
  useEffect(() => {
    if (hasTrackedPageView.current) return;
    hasTrackedPageView.current = true;

    // Capture UTM params from URL
    captureUTMParams();

    // Track page view
    trackEvent('page_view', pageId, pageTitle);
  }, [pageId, pageTitle]);

  /**
   * Tracks an event to both Supabase and GTM
   */
  const trackEvent = useCallback(
    async (eventType: string, elementId: string, elementText?: string) => {
      const utm = getStoredUTM();
      const sessionId = getSessionId();

      // Push to GTM dataLayer
      pushToDataLayer(eventType, {
        element_id: elementId,
        element_text: elementText,
      });

      // Insert to Supabase
      try {
        await supabase.from('marketing_events').insert({
          event_type: eventType,
          session_id: sessionId,
          element_id: elementId,
          element_text: elementText,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
        });
      } catch (error) {
        console.error('Tracking error:', error);
      }
    },
    []
  );

  /**
   * Tracks CTA click with standard attributes
   */
  const trackCTAClick = useCallback(
    (ctaId: string, ctaText: string) => {
      trackEvent('cta_click', ctaId, ctaText);
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackCTAClick,
    getStoredUTM,
    getSessionId,
  };
}
