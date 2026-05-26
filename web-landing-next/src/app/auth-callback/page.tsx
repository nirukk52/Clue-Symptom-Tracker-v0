'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { supabase } from '@/lib/supabase';

/**
 * Auth Callback Page
 *
 * Why this exists: Handles OAuth redirects from Google sign-in.
 * Extracts session and redirects back to the chat page.
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage('Could not retrieve user information.');
        setState('error');
        return;
      }

      // Check if we should redirect to chat
      const pendingChatRedirect = sessionStorage.getItem('pending_chat_redirect');
      const returnUrl = sessionStorage.getItem('pending_chat_return_url');

      if (pendingChatRedirect === 'true' && returnUrl) {
        sessionStorage.setItem('oauth_user_email', user.email || '');
        sessionStorage.removeItem('pending_chat_redirect');
        sessionStorage.removeItem('pending_chat_return_url');
        router.push(returnUrl);
        return;
      }

      // Default: redirect to chat
      setState('success');
      setTimeout(() => router.push('/chat'), 1500);
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('An unexpected error occurred.');
      setState('error');
    }
  }

  return (
    <div className="bg-bg-cream flex min-h-screen items-center justify-center p-4">
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

      {state === 'success' && (
        <div className="text-center">
          <div className="from-accent-mint to-accent-purple/50 animate-scaleIn mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br">
            <MaterialIcon name="check" size="xl" className="text-white" />
          </div>
          <h1 className="font-display text-primary mb-2 text-2xl font-semibold">
            You&apos;re all set!
          </h1>
          <p className="text-text-muted mb-6">
            Redirecting to Clue...
          </p>
        </div>
      )}

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
            href="/chat"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-colors"
          >
            Try again
            <MaterialIcon name="refresh" size="sm" />
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
