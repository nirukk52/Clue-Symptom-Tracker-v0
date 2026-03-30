'use client';

import { useCallback, useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import {
  captureUTMParams,
  getDeviceType,
  getHeadlineVariant,
  getPersona,
  getSessionId,
  getStoredUTM,
  getVisitId,
  setVisitId,
} from '@/lib/tracking';
import type { PersonaKey, ProductKey } from '@/types';

/**
 * useLandingVisit - Logs page visits and engagement to landing_visits table
 *
 * Why this exists: Tracks initial page visits with full attribution data
 * including UTM params, persona A/B test assignment, and device info.
 * Also tracks engagement metrics: CTA clicks, time on page, scroll depth.
 */

interface UseLandingVisitOptions {
  product: ProductKey;
}

interface VisitData {
  visitId: string | null;
  persona: PersonaKey;
  personaSource: 'url_param' | 'stored' | 'default';
  trackCtaClick: (ctaElementId: string) => Promise<void>;
}

export function useLandingVisit({
  product,
}: UseLandingVisitOptions): VisitData {
  const hasLoggedVisit = useRef(false);
  const pageLoadTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const visitDataRef = useRef<VisitData>({
    visitId: null,
    persona: 'maya',
    personaSource: 'default',
    trackCtaClick: async () => {},
  });

  /**
   * Updates landing_visits with CTA click data
   */
  const trackCtaClick = useCallback(async (ctaElementId: string) => {
    const visitId = getVisitId();
    if (!visitId) {
      console.warn('No visit ID found for CTA tracking');
      return;
    }

    try {
      await supabase
        .from('landing_visits')
        .update({
          cta_clicked: true,
          cta_clicked_at: new Date().toISOString(),
          cta_element_id: ctaElementId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', visitId);
    } catch (err) {
      console.error('Error tracking CTA click:', err);
    }
  }, []);

  // Assign trackCtaClick to ref so it's available immediately
  visitDataRef.current.trackCtaClick = trackCtaClick;

  useEffect(() => {
    if (hasLoggedVisit.current) return;
    hasLoggedVisit.current = true;

    async function logVisit() {
      // Capture UTM params first
      captureUTMParams();

      const utm = getStoredUTM();
      const sessionId = getSessionId();
      const { persona, source: personaSource } = getPersona();
      const deviceType = getDeviceType();
      const headlineVariant = getHeadlineVariant();

      // Update ref with persona data
      visitDataRef.current.persona = persona;
      visitDataRef.current.personaSource = personaSource;

      try {
        const { data, error } = await supabase
          .from('landing_visits')
          .insert({
            session_id: sessionId,
            product_offering: product,
            utm_source: utm.utm_source || null,
            utm_medium: utm.utm_medium || null,
            utm_campaign: utm.utm_campaign || null,
            utm_content: utm.utm_content || null,
            utm_term: utm.utm_term || null,
            headline_variant: headlineVariant,
            persona_shown: persona,
            persona_source: personaSource,
            user_agent:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device_type: deviceType,
            referrer:
              typeof document !== 'undefined'
                ? document.referrer || null
                : null,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error logging visit:', error);
          return;
        }

        if (data?.id) {
          setVisitId(data.id);
          visitDataRef.current.visitId = data.id;
        }
      } catch (err) {
        console.error('Error logging visit:', err);
      }
    }

    logVisit();
  }, [product]);

  /**
   * Track scroll depth using scroll event
   */
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent =
        docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Update engagement metrics before page unload
   */
  useEffect(() => {
    async function updateEngagementMetrics() {
      const visitId = getVisitId();
      if (!visitId) return;

      const timeOnPage = Date.now() - pageLoadTime.current;

      try {
        await supabase
          .from('landing_visits')
          .update({
            time_on_page_ms: timeOnPage,
            scroll_depth_pct: maxScrollDepth.current,
            updated_at: new Date().toISOString(),
          })
          .eq('id', visitId);
      } catch (err) {
        console.error('Error updating engagement metrics:', err);
      }
    }

    // Use visibilitychange for more reliable tracking (beforeunload is unreliable on mobile)
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        updateEngagementMetrics();
      }
    }

    // Also try beforeunload as backup for desktop
    function handleBeforeUnload() {
      // Note: sendBeacon would be more reliable but requires a custom endpoint
      // For now, we rely on visibilitychange which fires before beforeunload
      // and the async update as a fallback (may not complete)
      updateEngagementMetrics();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return visitDataRef.current;
}
