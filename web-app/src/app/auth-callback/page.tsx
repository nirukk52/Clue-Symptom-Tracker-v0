'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

/**
 * Auth Callback Page
 *
 * Why this exists: Handles OAuth redirects from Google sign-in.
 * Extracts session, stores signup data, and redirects back to landing page
 * with show_chat=true to continue the modal flow.
 */

type AuthState = 'loading' | 'success' | 'error';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  async function handleAuthCallback() {
    try {
      // Get session from URL hash (Supabase puts tokens in hash)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        setErrorMessage(error.message);
        setState('error');
        return;
      }

      if (!session) {
        // Try to exchange code for session (PKCE flow)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (setError) {
            console.error('Set session error:', setError);
            setErrorMessage(setError.message);
            setState('error');
            return;
          }
        } else {
          setErrorMessage('No authentication data received.');
          setState('error');
          return;
        }
      }

      // Get user info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('Could not retrieve user information.');
        setState('error');
        return;
      }

      // Get UTM params from sessionStorage (stored before OAuth redirect)
      const utmSource = sessionStorage.getItem('utm_source') || null;
      const _utmMedium = sessionStorage.getItem('utm_medium') || null;
      const utmCampaign = sessionStorage.getItem('utm_campaign') || null;
      const utmContent = sessionStorage.getItem('utm_content') || null;
      const productOffering =
        sessionStorage.getItem('product_offering') || null;
      const sessionId = sessionStorage.getItem('session_id') || null;

      // Get modal_session_id for tracing full journey
      const modalSessionId = sessionStorage.getItem('modal_session_id');

      // Record signup in beta_signups for marketing attribution
      await supabase.from('beta_signups').insert({
        email: user.email,
        utm_source: utmSource,
        utm_medium: 'oauth',
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        landing_url: document.referrer || window.location.origin,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });

      // Track the conversion event
      await supabase.from('marketing_events').insert({
        event_type: 'auth_signup_google',
        utm_source: utmSource,
        utm_medium: 'oauth',
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        element_id: 'google_oauth_callback',
        element_text: user.email,
        page_url: window.location.href,
        referrer: document.referrer || null,
        session_id: sessionId,
      });

      // Update modal_session and AI generation as converted if modal_session_id exists
      if (modalSessionId) {
        // CRITICAL: Mark modal_session as completed
        // Why this exists: This was missing, causing modal_sessions.completed to always be false
        // even when users successfully signed up via Google OAuth.
        await supabase
          .from('modal_sessions')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', modalSessionId);

        // Also mark AI generation as converted (existing behavior)
        await supabase
          .from('ai_generations')
          .update({ converted: true })
          .eq('modal_session_id', modalSessionId);

        // Clean up after use
        sessionStorage.removeItem('modal_session_id');
      }

      // Clean up product_offering after use
      if (productOffering) {
        sessionStorage.removeItem('product_offering');
      }

      // Check if we should redirect to chat
      const pendingChatRedirect = sessionStorage.getItem(
        'pending_chat_redirect'
      );
      const returnUrl = sessionStorage.getItem('pending_chat_return_url');

      if (pendingChatRedirect === 'true' && returnUrl) {
        // Store user email for chat
        sessionStorage.setItem('oauth_user_email', user.email || '');
        // Redirect back to landing page with show_chat flag
        router.push(`${returnUrl}?show_chat=true`);
        return;
      }

      setState('success');
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('An unexpected error occurred.');
      setState('error');
    }
  }

  return (
    <div className="bg-bg-cream flex min-h-screen items-center justify-center p-4">
      {/* Loading State */}
      {state === 'loading' && (
        <div className="text-center">
          <div className="bg-accent-purple/20 mx-auto mb-6 flex size-16 items-center justify-center rounded-full">
            <MaterialIcon
              name="progress_activity"
              size="lg"
              className="text-primary animate-spin"
            />
          </div>
          <h1 className="font-display text-primary mb-2 text-2xl font-semibold">
            Signing you in...
          </h1>
          <p className="text-text-muted">
            Just a moment while we set things up
          </p>
        </div>
      )}

      {/* Success State */}
      {state === 'success' && (
        <div className="text-center">
          <div className="from-accent-mint to-accent-purple/50 animate-scaleIn mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br">
            <MaterialIcon name="check" size="xl" className="text-white" />
          </div>
          <h1 className="font-display text-primary mb-2 text-2xl font-semibold">
            You&apos;re all set!
          </h1>
          <p className="text-text-muted mb-6">
            Your account has been created successfully.
          </p>
          <p className="text-text-muted mb-8 text-sm">
            We&apos;ll reach out when Chronic Life is ready for you.
          </p>
          <a
            href="/"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-colors"
          >
            Back to home
            <MaterialIcon name="arrow_forward" size="sm" />
          </a>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100">
            <MaterialIcon name="error" size="lg" className="text-red-600" />
          </div>
          <h1 className="font-display text-primary mb-2 text-2xl font-semibold">
            Something went wrong
          </h1>
          <p className="text-text-muted mb-6">
            {errorMessage || "We couldn't complete the sign in."}
          </p>
          <a
            href="/"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-colors"
          >
            Try again
            <MaterialIcon name="refresh" size="sm" />
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
