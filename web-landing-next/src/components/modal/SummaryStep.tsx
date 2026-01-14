'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectTestimonialIdForUser,
  testimonialIdToSelectedQuote,
} from '@/backend/agents/onboarding/generators/quote-selector';
import type { ValuePropScreenData } from '@/backend/agents/onboarding/types';
import { ValuePropScreen } from '@/components/widgets/ValuePropScreen';
import {
  getMicrocopy,
  getOnboardingCatalog,
  getScreen4Headline,
  getScreen4PreviewBadge,
  getScreen4WatchItems,
} from '@/lib/onboarding/content';
import { selectScreen4WidgetFromQ2 } from '@/lib/onboarding/screen4-selectors';
import { markAIGenerationConverted } from '@/lib/summary';
import { supabase } from '@/lib/supabase';
import { getStoredUTM, trackRedditEvent } from '@/lib/tracking';
import type { ModalResponsesStructured, ProductKey } from '@/types';

/**
 * SummaryStep - AI-driven ValuePropScreen + auth options
 *
 * Why this exists: This is onboarding Screen 4 (conversion moment). It must
 * render instantly after Q3 (no loading gate). In Phase 1 we use deterministic
 * defaults (no LLM) and only select a testimonial + widget based on Q1/Q2.
 *
 * This is THE conversion moment - includes:
 * 1. Victory celebration (you completed onboarding!)
 * 2. Baseline captured (your Day 1 data)
 * 3. Promise card (what we'll do for you)
 * 4. Domain-specific preview (tailored to their condition)
 */

interface SummaryStepProps {
  product: ProductKey;
  responses: ModalResponsesStructured;
  modalSessionId: string | null;
  onGoogleSuccess: (email: string) => void;
  onEmailSuccess: (email: string) => void;
}

export function SummaryStep({
  product,
  responses,
  modalSessionId,
  onGoogleSuccess: _onGoogleSuccess,
  onEmailSuccess,
}: SummaryStepProps) {
  const [email, _setEmail] = useState('');
  const [password, _setPassword] = useState('');
  const [_isSubmitting, setIsSubmitting] = useState(false);
  const [_error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const screen4Selection = useMemo(() => {
    const q1Domain = responses.q1.answerValue;
    const q2Value = responses.q2.answerValue;
    const { widgetId, q4Value } = selectScreen4WidgetFromQ2(q2Value);
    const testimonialId = selectTestimonialIdForUser(q1Domain, q2Value, true);

    return {
      widgetId,
      q4Value,
      testimonialId,
      ctaKey: 'google_signin' as const,
    };
  }, [responses.q1.answerValue, responses.q2.answerValue]);

  /**
   * Deterministic Screen 4 data (Phase 1)
   *
   * Why this exists: Removes LLM latency from the critical post-Q3 transition.
   * We still produce a complete `ValuePropScreenData` shape so the UI stays stable.
   */
  const valuePropData: ValuePropScreenData = useMemo(() => {
    const q1Domain = responses.q1.answerValue;
    const q2Value = responses.q2.answerValue;

    const { widgetId, q4Value, testimonialId } = screen4Selection;
    const socialProofQuote = testimonialIdToSelectedQuote(testimonialId);

    const catalog = getOnboardingCatalog();
    const headline = getScreen4Headline(responses.q1.answerLabel);
    const watchItems = getScreen4WatchItems(q2Value);

    return {
      // Keep layoutId aligned with domain for later widget registry routing
      layoutId: q1Domain as unknown as ValuePropScreenData['layoutId'],
      socialProofQuote,
      victory: {
        stepsCompleted: 3,
        totalSteps: 3,
        baselineData: {
          label: getMicrocopy(catalog.screen4.baseline_label_id),
          value: responses.q3.answerLabel,
          condition: responses.q1.answerLabel,
          widgetType: widgetId,
        },
        promise: {
          headline,
          q4Value,
          watchItems,
        },
        victoryMessage: getMicrocopy(catalog.screen4.victory_message_id),
      },
      preview: {
        headline,
        watchItems,
        // Static preview until Phase 2 widget registry renders per-widget visuals
        graphData: {
          days: [
            { date: 'Mon', risk: 'low', value: 20 },
            { date: 'Tue', risk: 'low', value: 25 },
            { date: 'Wed', risk: 'elevated', value: 55 },
            { date: 'Thu', risk: 'low', value: 30 },
            { date: 'Fri', risk: 'low', value: 20 },
            { date: 'Sat', risk: 'low', value: 15 },
            { date: 'Sun', risk: 'low', value: 20 },
          ],
        },
        badge: getScreen4PreviewBadge(q1Domain),
      },
      cta: {
        text: getMicrocopy('cta.save_my_progress.v1'),
        action: 'google_signin',
      },
      statusText: getMicrocopy(catalog.screen4.status_text_id),
    };
  }, [responses, screen4Selection]);

  /**
   * Log Screen 4 impression (even without conversion)
   *
   * Why this exists: You want to know, for every user who reached Screen 4,
   * which testimonial/widget/CTA we showed them.
   */
  useEffect(() => {
    if (!modalSessionId) return;

    // Fire-and-forget (do not block UI)
    void supabase.from('onboarding_screen4_impressions').upsert(
      {
        modal_session_id: modalSessionId,
        product_offering: product,
        q1_value: responses.q1.answerValue,
        q2_value: responses.q2.answerValue,
        widget_id: screen4Selection.widgetId,
        testimonial_id: screen4Selection.testimonialId,
        cta_key: screen4Selection.ctaKey,
        render_version: 'v1',
      },
      { onConflict: 'modal_session_id,render_version' }
    );
  }, [
    modalSessionId,
    product,
    responses.q1.answerValue,
    responses.q2.answerValue,
    screen4Selection.ctaKey,
    screen4Selection.testimonialId,
    screen4Selection.widgetId,
  ]);

  // Handle Google Sign In (triggered by WatchListPreview CTA)
  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    setError('');

    // Track Reddit SignUp immediately (before async)
    trackRedditEvent('SignUp');

    try {
      // Store data for OAuth callback
      if (modalSessionId) {
        sessionStorage.setItem('modal_session_id', modalSessionId);
      }

      // Store UTM and responses for callback
      const utm = getStoredUTM();
      Object.entries(utm).forEach(([key, value]) => {
        if (value) sessionStorage.setItem(key, value);
      });
      sessionStorage.setItem('product_offering', product);
      sessionStorage.setItem(
        'pending_chat_responses',
        JSON.stringify(responses)
      );
      sessionStorage.setItem('pending_chat_redirect', 'true');
      sessionStorage.setItem(
        'pending_chat_return_url',
        window.location.origin + window.location.pathname
      );

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });

      if (oauthError) {
        console.error('Google auth error:', oauthError);
        setError('Google sign in failed. Please try again.');
        setIsGoogleLoading(false);
      }
      // If successful, user will be redirected to Google
      // storeConversionContext will be called in auth-callback after we have userId
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Something went wrong. Please try again.');
      setIsGoogleLoading(false);
    }
  }, [modalSessionId, product, responses]);

  // Handle email/password signup (kept for future use)
  const _handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate password
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsSubmitting(true);

      try {
        // Sign up with Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              signup_source: 'campaign_modal',
              product_offering: product,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Try signing in.');
          } else {
            setError(
              signUpError.message || 'Something went wrong. Please try again.'
            );
          }
          setIsSubmitting(false);
          return;
        }

        // Track Reddit SignUp
        trackRedditEvent('SignUp');

        // Insert into beta_signups for marketing attribution
        const utm = getStoredUTM();
        await supabase.from('beta_signups').insert({
          email,
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          landing_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });

        // Mark AI generation as converted
        if (modalSessionId) {
          await markAIGenerationConverted(modalSessionId, 'email_create');
        }

        onEmailSuccess(email);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, product, modalSessionId, onEmailSuccess]
  );

  // Full-bleed ValuePropScreen - no wrapper spacing
  return (
    <ValuePropScreen
      data={valuePropData}
      onCTAClick={handleGoogleSignIn}
      isLoading={isGoogleLoading}
    />
  );
}
