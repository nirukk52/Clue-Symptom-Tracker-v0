'use client';

import { useCallback, useEffect, useState } from 'react';

import { generateWatchListPreview } from '@/backend/agents/onboarding';
import type { WatchListPreviewData } from '@/backend/agents/onboarding/types';
import { WatchListPreview } from '@/backend/components';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { markAIGenerationConverted } from '@/lib/summary';
import { supabase } from '@/lib/supabase';
import { getStoredUTM, trackRedditEvent } from '@/lib/tracking';
import type { ModalResponsesStructured, ProductKey } from '@/types';

/**
 * SummaryStep - AI-generated WatchListPreview + auth options
 *
 * Why this exists: Shows a hyper-personalized conversion preview based on
 * user's Q1-Q4 answers using the Onboarding Agent. The WatchListPreview
 * shows what predictions COULD look like, with a first-person CTA.
 * This is THE conversion moment - must feel like the app already understands them.
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
  const [watchListData, setWatchListData] =
    useState<WatchListPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Generate WatchListPreview on mount via Onboarding Agent
  useEffect(() => {
    async function loadWatchListPreview() {
      if (!modalSessionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await generateWatchListPreview(modalSessionId);
        setWatchListData(data);
      } catch (err) {
        console.error('Error generating watch list preview:', err);
        // Use fallback data
        setWatchListData({
          headline: `We'll help you predict and manage ${responses.q1.answerLabel.toLowerCase()}.`,
          watchItems: [
            'Symptom pattern detection',
            'Early warning signals',
            'Doctor-ready summaries',
          ],
          graphs: {
            flareRisk: {
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
            symptomPatterns: {
              condition: responses.q1.answerValue,
              patternType: 'energy',
              values: [5, 4, 3, 4, 5, 6, 5],
              insight: 'Your patterns will appear here',
            },
            medicationTiming: {
              items: [],
            },
          },
          cta: {
            text: 'Save my progress',
            action: 'google_signin',
          },
          statusText: 'First insight in ~3 days',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadWatchListPreview();
  }, [modalSessionId, responses.q1.answerLabel, responses.q1.answerValue]);

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

  // Handle email/password signup
  const handleEmailSubmit = useCallback(
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

  // If WatchListPreview is loaded, render it with CTA triggering Google sign-in
  // Otherwise, show loading state
  if (isLoading || !watchListData) {
    return (
      <div className="space-y-6">
        <WatchListPreview
          data={watchListData as WatchListPreviewData}
          onCTAClick={handleGoogleSignIn}
          isLoading={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* WatchListPreview - Main conversion UI */}
      <WatchListPreview
        data={watchListData}
        onCTAClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
      />

      {/* Error display */}
      {error && (
        <p className="text-accent-peach flex items-center justify-center gap-1 text-center text-sm">
          <MaterialIcon name="error" size="sm" />
          {error}
        </p>
      )}

      {/* Alternative: Email/Password signup (collapsible) */}
      <details className="group">
        <summary className="text-text-muted hover:text-primary flex cursor-pointer items-center justify-center gap-2 text-sm">
          <span>Or sign up with email</span>
          <MaterialIcon
            name="expand_more"
            size="sm"
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="modal-input"
            disabled={isSubmitting || isGoogleLoading}
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="modal-input"
            disabled={isSubmitting || isGoogleLoading}
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <MaterialIcon
                  name="progress_activity"
                  size="sm"
                  className="animate-spin"
                />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <MaterialIcon name="arrow_forward" size="sm" />
              </>
            )}
          </button>
        </form>
      </details>
    </div>
  );
}
