'use client';

import type { LandingPageContent, PersonaKey } from '@/types';
import { useTracking } from '@/hooks/useTracking';
import { useModal } from '@/hooks/useModal';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/hero/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Features } from '@/components/sections/Features';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { CampaignModal } from '@/components/modal/CampaignModal';

/**
 * LandingPage - Template component for all landing pages
 *
 * Why this exists: This is THE key component. It takes a content config
 * and renders a full landing page. Previously each HTML file was 1500+ lines.
 * Now a new page variant is just ~20 lines of content config.
 */

interface LandingPageProps {
  content: LandingPageContent;
  persona?: PersonaKey;
}

export function LandingPage({ content, persona = 'maya' }: LandingPageProps) {
  // Initialize tracking
  useTracking({
    pageId: content.pageId,
    pageTitle: content.meta.title,
  });

  // Modal state
  const {
    isOpen,
    step,
    questionNumber,
    responses,
    email,
    openModal,
    closeModal,
    setResponse,
    goToSuccess,
  } = useModal();

  return (
    <>
      {/* Navigation */}
      <Navbar onCtaClick={openModal} />

      {/* Hero Section */}
      <Hero
        content={content.hero}
        conditions={content.conditions}
        persona={persona}
        onCtaClick={openModal}
      />

      {/* How It Works */}
      <HowItWorks />

      {/* Features */}
      <Features features={content.features} />

      {/* Final CTA */}
      <FinalCTA onCtaClick={openModal} />

      {/* Footer */}
      <Footer />

      {/* Campaign Modal */}
      <CampaignModal
        product={content.product}
        isOpen={isOpen}
        step={step}
        questionNumber={questionNumber}
        responses={responses}
        email={email}
        onClose={closeModal}
        onSelectAnswer={setResponse}
        onGoToSuccess={goToSuccess}
      />
    </>
  );
}
