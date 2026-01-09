'use client';

import { Button } from '@/components/ui/Button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * SuccessStep - Confirmation after email signup
 *
 * Why this exists: Shows success message and next steps after signup.
 */

interface SuccessStepProps {
  email: string;
  onClose: () => void;
}

export function SuccessStep({ email, onClose }: SuccessStepProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="bg-accent-mint/20 mx-auto flex size-20 items-center justify-center rounded-full">
        <MaterialIcon
          name="check_circle"
          size="xl"
          className="text-accent-mint"
        />
      </div>

      {/* Message */}
      <div>
        <h2 className="font-display text-primary mb-2 text-2xl font-semibold">
          You&apos;re on the list!
        </h2>
        <p className="text-text-muted">
          We&apos;ll email{' '}
          <span className="text-primary font-medium">{email}</span> when early
          access opens.
        </p>
      </div>

      {/* What's next */}
      <div className="bg-primary/5 rounded-2xl p-4 text-left">
        <h3 className="text-primary mb-2 flex items-center gap-2 font-semibold">
          <MaterialIcon name="schedule" size="sm" />
          What happens next?
        </h3>
        <ul className="text-text-muted space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            You&apos;ll get first access before public launch
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            We&apos;ll ask for feedback to shape features
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-purple">•</span>
            Early supporters get lifetime perks
          </li>
        </ul>
      </div>

      {/* Close button */}
      <Button variant="secondary" onClick={onClose} className="w-full">
        Got it
      </Button>
    </div>
  );
}
