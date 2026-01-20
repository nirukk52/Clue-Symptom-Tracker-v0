'use client';

import { Hero } from '@/components/hero/Hero';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CampaignModal } from '@/components/modal/CampaignModal';
import { ClueIntroduction } from '@/components/sections/ClueIntroduction';
import { DoctorPack } from '@/components/sections/DoctorPack';
import { EnergyPacing } from '@/components/sections/EnergyPacing';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { FlareMode } from '@/components/sections/FlareMode';
import { Insights } from '@/components/sections/Insights';
import { MultipleConditions } from '@/components/sections/MultipleConditions';
import { NoGuilt } from '@/components/sections/NoGuilt';
import { PatternDetection } from '@/components/sections/PatternDetection';
import { PredictiveInsights } from '@/components/sections/PredictiveInsights';
import { QuickEntry } from '@/components/sections/QuickEntry';
import { Testimonials } from '@/components/sections/Testimonials';
import { useLandingVisit } from '@/hooks/useLandingVisit';
import { useModal } from '@/hooks/useModal';
import { useTracking } from '@/hooks/useTracking';
import type { LandingPageContent, PersonaKey } from '@/types';

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

export function LandingPage({
  content,
  persona: propPersona,
}: LandingPageProps) {
  // Initialize page view tracking (marketing_events table)
  useTracking({
    pageId: content.pageId,
    pageTitle: content.meta.title,
  });

  // Initialize landing visit tracking (landing_visits table)
  const { persona: assignedPersona, trackCtaClick } = useLandingVisit({
    product: content.product,
  });

  // Use prop persona if provided, otherwise use assigned persona
  const persona = propPersona || assignedPersona;

  // Modal state with tracking
  const {
    isOpen,
    step,
    questionNumber,
    responses,
    structuredResponses,
    email,
    modalSessionId,
    openModal: baseOpenModal,
    closeModal,
    setResponse,
    goToChat,
  } = useModal({ product: content.product });

  // Wrap openModal to track CTA clicks
  const openModal = (ctaId?: string) => {
    if (ctaId) {
      trackCtaClick(ctaId);
    }
    baseOpenModal();
  };

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


      {/* Clue Introduction - Chat agent showcase (spoon-saver only) */}
      {content.product === 'spoon-saver' && (
        <ClueIntroduction onCtaClick={openModal} />
      )}
      
      {/* Quick Entry - Energy-conscious design showcase */}
      <QuickEntry onCtaClick={openModal} />

      {/* No Guilt Zone - Emotional safety (spoon-saver only) */}
      {content.product === 'spoon-saver' && content.noGuilt && (
        <NoGuilt content={content.noGuilt} onCtaClick={openModal} />
      )}

      {/* Flare Mode - One-tap logging for bad days */}
      <FlareMode onCtaClick={openModal} />

      {/* === OTHER PRODUCT SPECIFIC SECTIONS === */}
      {/* Predictive Insights - Lag effect detection (flare-forecast specific) */}
      {content.product === 'flare-forecast' && (
        <PredictiveInsights onCtaClick={openModal} />
      )}

      {/* Pattern Detection - Trigger correlation (top-suspect specific) */}
      {content.product === 'top-suspect' && (
        <PatternDetection onCtaClick={openModal} />
      )}

      {/* Energy Pacing - Push/rest daily guidance (crash-prevention specific) */}
      {content.product === 'crash-prevention' && (
        <EnergyPacing onCtaClick={openModal} />
      )}

      {/* === SHARED SECTIONS === */}
      {/* Insights - Evidence-backed patterns */}
      <Insights onCtaClick={openModal} />

      {/* Doctor Pack - Export summaries for appointments */}
      <DoctorPack onCtaClick={openModal} />

      {/* Testimonials - Real voices from Spoonie community (after doctor section) */}
      {content.product === 'spoon-saver' && content.testimonials && (
        <Testimonials
          testimonials={content.testimonials}
          onCtaClick={openModal}
        />
      )}

      {/* Multiple Conditions - Managing comorbidities */}
      <MultipleConditions onCtaClick={openModal} />

      {/* Final CTA - Save your spoons */}
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
        structuredResponses={structuredResponses}
        email={email}
        modalSessionId={modalSessionId}
        onClose={closeModal}
        onSelectAnswer={setResponse}
        onGoToChat={goToChat}
      />
    </>
  );
}
