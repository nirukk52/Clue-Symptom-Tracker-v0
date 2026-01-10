'use client';

import { useCallback, useEffect, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  generateSummary,
  logAIGeneration,
  markAIGenerationConverted,
} from '@/lib/summary';
import { supabase } from '@/lib/supabase';
import { getSessionId, getStoredUTM, trackRedditEvent } from '@/lib/tracking';
import type {
  ModalResponsesStructured,
  ProductKey,
  SummaryGenerationResult,
} from '@/types';

/**
 * SummaryStep - AI-generated personalized summary + auth options
 *
 * Why this exists: Shows a hyper-personalized conversion summary based on
 * user's Q1-Q4 answers, followed by Google OAuth + email/password signup.
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
  const [summaryResult, setSummaryResult] =
    useState<SummaryGenerationResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Generate summary on mount
  useEffect(() => {
    async function loadSummary() {
      setIsLoadingSummary(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
        const result = await generateSummary(
          { productOffering: product, answers: responses },
          apiKey
        );
        setSummaryResult(result);

        // Log to Supabase
        const sessionId = getSessionId();
        await logAIGeneration(modalSessionId, sessionId, result, {
          productOffering: product,
          answers: responses,
        });
      } catch (err) {
        console.error('Error generating summary:', err);
        // Use fallback
        setSummaryResult({
          summary: {
            title: `We'll learn your patterns and help you manage ${responses.q1.answerLabel.toLowerCase()}.`,
            benefits: [
              'Personalized insights based on your patterns',
              'Early warnings before things get worse',
              'Doctor-ready summaries you can share',
            ],
            ctaText: 'Get started',
          },
          metadata: {
            modelUsed: 'fallback',
            promptTemplateId: 'error_fallback',
            tokensUsed: 0,
            latencyMs: 0,
          },
        });
      } finally {
        setIsLoadingSummary(false);
      }
    }

    loadSummary();
  }, [product, responses, modalSessionId]);

  // Handle Google Sign In
  const handleGoogleSignIn = useCallback(async () => {
    setIsGoogleLoading(true);
    setError('');

    // Track Reddit SignUp immediately (before async)
    trackRedditEvent('SignUp');

    try {
      // Store data for OAuth callback
      if (modalSessionId) {
        await markAIGenerationConverted(modalSessionId, 'google_signin');
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

  return (
    <div className="space-y-6">
      {/* Summary Content */}
      <div className="min-h-[120px]">
        {isLoadingSummary ? (
          <div className="flex justify-center py-8">
            <MaterialIcon
              name="progress_activity"
              size="lg"
              className="text-accent-purple animate-spin"
            />
          </div>
        ) : summaryResult ? (
          <div className="animate-fadeIn">
            <h3 className="font-display text-primary mb-4 text-xl font-semibold leading-snug">
              {summaryResult.summary.title}
            </h3>
            <ul className="space-y-3">
              {summaryResult.summary.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="text-text-muted flex items-start gap-2 text-sm"
                >
                  <MaterialIcon
                    name="check_circle"
                    size="sm"
                    className="text-accent-mint mt-0.5 shrink-0"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Auth Options */}
      <div className="space-y-4">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
          className="border-primary/10 text-primary hover:border-accent-purple hover:bg-accent-purple/5 flex w-full items-center justify-center gap-3 rounded-full border-2 bg-white px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <MaterialIcon
              name="progress_activity"
              size="sm"
              className="animate-spin"
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                fill="#EA4335"
              />
            </svg>
          )}
          {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 h-px flex-1" />
          <span className="text-text-muted text-xs font-medium">or</span>
          <div className="bg-primary/10 h-px flex-1" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
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

          {error && (
            <p className="text-accent-peach flex items-center justify-center gap-1 text-center text-sm">
              <MaterialIcon name="error" size="sm" />
              {error}
            </p>
          )}

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

        {/* Privacy note */}
        <p className="text-text-muted/70 flex items-center justify-center gap-1 text-xs">
          <MaterialIcon name="lock" size="xs" />
          Your data stays private. We never share it.
        </p>
      </div>
    </div>
  );
}
