'use client';

import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import {
  captureUTMParams,
  getDeviceType,
  getHeadlineVariant,
  getPersona,
  getSessionId,
  getStoredUTM,
  setVisitId,
} from '@/lib/tracking';
import type { PersonaKey, ProductKey } from '@/types';

/**
 * useLandingVisit - Logs page visits to landing_visits table
 *
 * Why this exists: Tracks initial page visits with full attribution data
 * including UTM params, persona A/B test assignment, and device info.
 * Previously done in campaign-modal.js logVisit() function.
 */

interface UseLandingVisitOptions {
  product: ProductKey;
}

interface VisitData {
  visitId: string | null;
  persona: PersonaKey;
  personaSource: 'url_param' | 'stored' | 'default';
}

export function useLandingVisit({
  product,
}: UseLandingVisitOptions): VisitData {
  const hasLoggedVisit = useRef(false);
  const visitDataRef = useRef<VisitData>({
    visitId: null,
    persona: 'maya',
    personaSource: 'default',
  });

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

  return visitDataRef.current;
}
