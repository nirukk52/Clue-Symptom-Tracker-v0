'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * EmailStep - Email capture after questions
 *
 * Why this exists: Collects email for beta signup with validation
 * and submits to Supabase.
 */

interface EmailStepProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export function EmailStep({ onSubmit, isLoading = false }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    await onSubmit(email);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-accent-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MaterialIcon name="mail" size="lg" className="text-accent-purple" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">
          You&apos;re in the right place
        </h2>
        <p className="text-text-muted">
          Get early access when we launch — before it&apos;s public.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`modal-input ${error ? 'error' : ''}`}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <p className="text-accent-peach text-sm mt-2 flex items-center gap-1">
              <MaterialIcon name="error" size="sm" />
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Get early access
              <MaterialIcon name="arrow_forward" size="sm" />
            </>
          )}
        </Button>
      </form>

      {/* Privacy note */}
      <p className="text-center text-xs text-text-muted">
        No spam. Unsubscribe anytime. We respect your energy.
      </p>
    </div>
  );
}
