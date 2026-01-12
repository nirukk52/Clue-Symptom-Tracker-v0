'use server';

/**
 * Onboarding Agent Server Actions
 *
 * Why this exists: Entry point for the onboarding agent. Provides two main interfaces:
 * 1. generateWatchListPreview - Called by web-landing-next modal (pre-conversion)
 * 2. getConversionContext - Called by Clue Agent (post-conversion)
 */

import { supabase } from '@/lib/supabase';

import { assembleContext } from './context/assembler';
import { determinePromiseCategory, generateCopy } from './generators/copy';
import {
  getWatchListTemplate,
  mergeWithGeneratedCopy,
} from './templates/watch-list';
import type {
  ConversionContextResponse,
  StoredConversionContext,
  WatchListPreviewData,
} from './types';

// =============================================================================
// INTERFACE 1: Pre-Conversion (web-landing-next → Agent)
// Question: "Why should this user sign up?"
// =============================================================================

/**
 * Generates personalized WatchListPreview data for modal
 * Called when user reaches the conversion step in the onboarding modal
 */
export async function generateWatchListPreview(
  modalSessionId: string
): Promise<WatchListPreviewData> {
  // 1. Assemble all user context
  const context = await assembleContext(supabase, modalSessionId);

  // 2. Generate personalized copy (Gemini)
  const copyResult = await generateCopy(context);

  // 3. Get template with fake graph data
  const template = getWatchListTemplate(
    context.answers.q1.answerValue,
    context.answers.q2.answerLabel,
    context.landingPage.productOffering
  );

  // 4. Merge AI copy with template
  const previewData = mergeWithGeneratedCopy(
    template,
    copyResult.copy.headline,
    copyResult.copy.watchItems,
    copyResult.copy.ctaText
  );

  // 5. Log generation for analytics
  await logAIGeneration(modalSessionId, context, copyResult);

  return previewData;
}

/**
 * Stores conversion context after user signs up
 * Called after successful Google sign-in or email signup
 */
export async function storeConversionContext(
  modalSessionId: string,
  userId: string,
  conversionMethod: 'google_signin' | 'email_create'
): Promise<void> {
  // Fetch the AI generation record
  const { data: generation } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('modal_session_id', modalSessionId)
    .single();

  if (!generation) {
    console.error('No AI generation found for session:', modalSessionId);
    return;
  }

  // Fetch the full context
  const context = await assembleContext(supabase, modalSessionId);
  const promiseCategory = determinePromiseCategory(context);

  // Store conversion context
  const conversionData: Partial<StoredConversionContext> = {
    modalSessionId,
    utmSource: context.utm.source,
    utmCampaign: context.utm.campaign,
    utmContent: context.utm.content,
    adHeadline: context.ad?.headline || null,
    landingPage: context.landingPage.productOffering,
    conditionPrimary: context.answers.q1.answerValue,
    conditionLabel: context.answers.q1.answerLabel,
    painPoint: context.answers.q2.answerValue,
    painPointLabel: context.answers.q2.answerLabel,
    productNeed: context.answers.q3?.answerLabel || null,
    desiredOutcome: context.answers.q4?.answerLabel || null,
    generatedHeadline: generation.generated_headline as string,
    generatedWatchItems: generation.generated_watch_items as string[],
    generatedCta: generation.generated_cta as string,
    promiseCategory,
    conversionMethod,
  };

  await supabase.from('user_conversion_context').insert({
    user_id: userId,
    modal_session_id: conversionData.modalSessionId,
    utm_source: conversionData.utmSource,
    utm_campaign: conversionData.utmCampaign,
    utm_content: conversionData.utmContent,
    ad_headline: conversionData.adHeadline,
    landing_page: conversionData.landingPage,
    condition_primary: conversionData.conditionPrimary,
    condition_label: conversionData.conditionLabel,
    pain_point: conversionData.painPoint,
    pain_point_label: conversionData.painPointLabel,
    product_need: conversionData.productNeed,
    desired_outcome: conversionData.desiredOutcome,
    generated_headline: conversionData.generatedHeadline,
    generated_watch_items: conversionData.generatedWatchItems,
    generated_cta: conversionData.generatedCta,
    promise_category: conversionData.promiseCategory,
    conversion_method: conversionData.conversionMethod,
  });

  // Mark AI generation as converted
  await supabase
    .from('ai_generations')
    .update({
      was_converted: true,
      conversion_method: conversionMethod,
      converted_at: new Date().toISOString(),
    })
    .eq('modal_session_id', modalSessionId);
}

// =============================================================================
// INTERFACE 2: Post-Conversion (Clue Agent → Onboarding Agent)
// Question: "Why did this user sign up?"
// =============================================================================

/**
 * Gets conversion context for a user
 * Called by Clue Agent when user opens mobile app after sign-up
 */
export async function getConversionContext(
  userId: string
): Promise<ConversionContextResponse | null> {
  const { data, error } = await supabase
    .from('user_conversion_context')
    .select('*')
    .eq('user_id', userId)
    .order('converted_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('No conversion context found for user:', userId);
    return null;
  }

  // Generate suggested first message
  const suggestedFirstMessage = generateFirstMessage(
    data.condition_label as string,
    data.pain_point_label as string,
    (data.generated_watch_items as string[])?.[0] || 'symptom patterns'
  );

  return {
    source: {
      adHeadline: data.ad_headline as string | null,
      landingPage: data.landing_page as string,
      utmCampaign: data.utm_campaign as string | null,
    },
    condition: {
      primary: data.condition_label as string,
      painPoint: data.pain_point_label as string,
    },
    desiredOutcome: (data.desired_outcome as string) || '',
    promiseMade: {
      headline: data.generated_headline as string,
      watchItems: data.generated_watch_items as string[],
      ctaClicked: data.generated_cta as string,
    },
    promiseCategory:
      data.promise_category as ConversionContextResponse['promiseCategory'],
    suggestedFirstMessage,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Logs AI generation to database for analytics
 */
async function logAIGeneration(
  modalSessionId: string,
  context: Awaited<ReturnType<typeof assembleContext>>,
  copyResult: Awaited<ReturnType<typeof generateCopy>>
): Promise<void> {
  try {
    await supabase.from('ai_generations').insert({
      modal_session_id: modalSessionId,
      session_id: context.sessionId,
      generated_headline: copyResult.copy.headline,
      generated_watch_items: copyResult.copy.watchItems,
      generated_cta: copyResult.copy.ctaText,
      model_used: copyResult.metadata.modelUsed,
      prompt_template_id: copyResult.metadata.promptTemplateId,
      tokens_used: copyResult.metadata.tokensUsed,
      latency_ms: copyResult.metadata.latencyMs,
      component_type: 'watch_list_preview',
      was_converted: false,
    });
  } catch (error) {
    console.error('Failed to log AI generation:', error);
  }
}

/**
 * Generates a personalized first message for Clue Agent
 */
function generateFirstMessage(
  condition: string,
  painPoint: string,
  firstWatchItem: string
): string {
  return (
    `Welcome! You signed up because "${painPoint}". ` +
    `Let's set up ${firstWatchItem} for your ${condition.toLowerCase()} right now.`
  );
}
