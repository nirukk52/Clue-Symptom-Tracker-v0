'use client';

import type { ModalResponsesStructured, ProductKey } from '@/types';

import { SummaryStep } from './SummaryStep';

/**
 * OnboardingStep4 - Conversion screen (post-Q3)
 *
 * Why this exists: Makes naming explicit (onboarding steps 1–4) while keeping
 * backward-compatible implementation inside `SummaryStep` for now. This is the
 * single screen users see after Q3.
 */

interface OnboardingStep4Props {
  product: ProductKey;
  responses: ModalResponsesStructured;
  modalSessionId: string | null;
  onGoogleSuccess: (email: string) => void;
  onEmailSuccess: (email: string) => void;
}

export function OnboardingStep4(props: OnboardingStep4Props) {
  return <SummaryStep {...props} />;
}

export default OnboardingStep4;
