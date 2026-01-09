'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Button } from '@/components/ui/Button';

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
      <div className="w-20 h-20 bg-accent-mint/20 rounded-full flex items-center justify-center mx-auto">
        <MaterialIcon name="check_circle" size="xl" className="text-accent-mint" />
      </div>

      {/* Message */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">
          You&apos;re on the list!
        </h2>
        <p className="text-text-muted">
          We&apos;ll email <span className="font-medium text-primary">{email}</span> when
          early access opens.
        </p>
      </div>

      {/* What's next */}
      <div className="bg-primary/5 rounded-2xl p-4 text-left">
        <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
          <MaterialIcon name="schedule" size="sm" />
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-text-muted">
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
