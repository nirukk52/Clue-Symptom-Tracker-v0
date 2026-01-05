/**
 * Context Assembler
 *
 * Why this exists: Fetches ALL available user context from Supabase
 * to provide the LLM with maximum information for personalization.
 *
 * Data sources:
 * - landing_visits: UTM params, persona shown, device type
 * - modal_sessions: Session metadata
 * - modal_responses: Q1-Q4 answers
 * - campaign_config: Ad copy, landing copy, persona stories
 */

import type {
  AdContext,
  LandingPageContext,
  ModalResponses,
  PersonaContext,
  QuestionAnswer,
  UserConversionContext,
  UTMContext,
} from './types';

// Supabase client type (passed in from caller)

type SupabaseClient = any;

/**
 * Assembles complete user context for summary generation
 *
 * @param supabase - Supabase client instance
 * @param modalSessionId - The modal session ID to fetch context for
 * @returns Complete user journey context
 */
export async function assembleContext(
  supabase: SupabaseClient,
  modalSessionId: string
): Promise<UserConversionContext> {
  // Fetch all data in parallel for speed
  const [sessionData, responsesData] = await Promise.all([
    fetchSessionData(supabase, modalSessionId),
    fetchModalResponses(supabase, modalSessionId),
  ]);

  // Now fetch related data based on session
  const [adContext, landingContext, personaContext] = await Promise.all([
    fetchAdContext(
      supabase,
      sessionData.utm.content,
      sessionData.productOffering
    ),
    fetchLandingContext(supabase, sessionData.productOffering),
    fetchPersonaContext(supabase, sessionData.personaShown),
  ]);

  return {
    sessionId: sessionData.sessionId,
    modalSessionId: modalSessionId,
    utm: sessionData.utm,
    ad: adContext,
    landingPage: landingContext,
    persona: personaContext,
    answers: responsesData,
    deviceType: sessionData.deviceType,
  };
}

/** Default session data when fetch fails */
function getDefaultSessionData(modalSessionId: string) {
  return {
    sessionId: modalSessionId,
    productOffering: 'flare-forecast',
    personaShown: 'maya',
    deviceType: 'desktop' as const,
    utm: {
      source: null,
      medium: null,
      campaign: null,
      content: null,
      term: null,
    },
  };
}

/** Fetches UTM data from landing visit */
async function fetchUTMFromVisit(
  supabase: SupabaseClient,
  visitId: string
): Promise<UTMContext> {
  const { data: visit } = await supabase
    .from('landing_visits')
    .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term')
    .eq('id', visitId)
    .single();

  if (!visit) {
    return {
      source: null,
      medium: null,
      campaign: null,
      content: null,
      term: null,
    };
  }

  return {
    source: visit.utm_source as string | null,
    medium: visit.utm_medium as string | null,
    campaign: visit.utm_campaign as string | null,
    content: visit.utm_content as string | null,
    term: visit.utm_term as string | null,
  };
}

/** Fetches modal session and related landing visit data */
async function fetchSessionData(
  supabase: SupabaseClient,
  modalSessionId: string
) {
  const { data: session, error } = await supabase
    .from('modal_sessions')
    .select(
      'session_id, product_offering, persona_shown, device_type, visit_id'
    )
    .eq('id', modalSessionId)
    .single();

  if (error || !session) {
    console.error('Error fetching modal session:', error);
    return getDefaultSessionData(modalSessionId);
  }

  const utm = session.visit_id
    ? await fetchUTMFromVisit(supabase, session.visit_id as string)
    : { source: null, medium: null, campaign: null, content: null, term: null };

  return {
    sessionId: session.session_id as string,
    productOffering: (session.product_offering as string) || 'flare-forecast',
    personaShown: (session.persona_shown as string) || 'maya',
    deviceType:
      (session.device_type as 'mobile' | 'tablet' | 'desktop') || 'desktop',
    utm,
  };
}

/**
 * Fetches all Q1-Q4 modal responses
 */
async function fetchModalResponses(
  supabase: SupabaseClient,
  modalSessionId: string
): Promise<ModalResponses> {
  const { data: responses, error } = await supabase
    .from('modal_responses')
    .select(
      'question_number, question_key, question_text, answer_value, answer_label'
    )
    .eq('modal_session_id', modalSessionId)
    .order('question_number', { ascending: true });

  if (error || !responses || responses.length === 0) {
    console.error('Error fetching modal responses:', error);
    // Return placeholder responses
    return createPlaceholderResponses();
  }

  // Map responses to Q1-Q4
  const responseMap: Record<number, QuestionAnswer> = {};
  for (const r of responses) {
    const qNum = r.question_number as number;
    if (qNum >= 1 && qNum <= 4) {
      responseMap[qNum] = {
        questionKey: r.question_key as string,
        questionText: r.question_text as string,
        answerValue: r.answer_value as string,
        answerLabel: (r.answer_label as string) || (r.answer_value as string),
      };
    }
  }

  return {
    q1: responseMap[1] ?? createPlaceholderQuestion(1),
    q2: responseMap[2] ?? createPlaceholderQuestion(2),
    q3: responseMap[3] ?? createPlaceholderQuestion(3),
    q4: responseMap[4] ?? createPlaceholderQuestion(4),
  };
}

/**
 * Fetches ad copy from campaign_config based on utm_content
 */
async function fetchAdContext(
  supabase: SupabaseClient,
  utmContent: string | null,
  productOffering: string
): Promise<AdContext | null> {
  // If no utm_content, try to get default ad for product
  const configKey =
    utmContent || `${productOffering.replace('-', '_')}_default`;

  const { data: adConfig } = await supabase
    .from('campaign_config')
    .select('config_data')
    .eq('config_type', 'ad')
    .eq('config_key', configKey)
    .single();

  if (!adConfig || !adConfig.config_data) {
    // Try default for product
    const { data: defaultAd } = await supabase
      .from('campaign_config')
      .select('config_data')
      .eq('config_type', 'ad')
      .eq('product_offering', productOffering)
      .order('config_key', { ascending: true });

    if (defaultAd && defaultAd.length > 0 && defaultAd[0].config_data) {
      const data = defaultAd[0].config_data as Record<string, unknown>;
      return {
        headline: (data.headline as string) || '',
        description: (data.description as string) || '',
        cta: (data.cta as string) || '',
        adGroup: (data.ad_group as string) || productOffering,
      };
    }
    return null;
  }

  const data = adConfig.config_data as Record<string, unknown>;
  return {
    headline: (data.headline as string) || '',
    description: (data.description as string) || '',
    cta: (data.cta as string) || '',
    adGroup: (data.ad_group as string) || productOffering,
  };
}

/**
 * Fetches landing page copy from campaign_config
 */
async function fetchLandingContext(
  supabase: SupabaseClient,
  productOffering: string
): Promise<LandingPageContext> {
  const { data: landingConfig } = await supabase
    .from('campaign_config')
    .select('config_data')
    .eq('config_type', 'landing')
    .eq('config_key', productOffering)
    .single();

  if (!landingConfig || !landingConfig.config_data) {
    // Return default flare-forecast landing
    return {
      productOffering: productOffering,
      heroTitle: 'Predict your next flare.',
      heroSubtitle:
        'See the storm coming. Get a 48-hour forecast based on your patterns.',
      primaryCTA: 'Start predicting',
      empathyCopy: 'A shift in your patterns suggests a rest day might help.',
      focusFeature: 'Lag Effect Detection (24-48h warning)',
    };
  }

  const data = landingConfig.config_data as Record<string, unknown>;
  return {
    productOffering: productOffering,
    heroTitle: (data.h1 as string) || '',
    heroSubtitle: (data.h2 as string) || '',
    primaryCTA: (data.cta as string) || '',
    empathyCopy: (data.empathy_copy as string) || '',
    focusFeature: (data.focus_feature as string) || '',
  };
}

/**
 * Fetches persona story from campaign_config
 * IMPORTANT: We only return story/description, NOT name or demographics
 */
async function fetchPersonaContext(
  supabase: SupabaseClient,
  personaKey: string
): Promise<PersonaContext> {
  const { data: personaConfig } = await supabase
    .from('campaign_config')
    .select('config_data')
    .eq('config_type', 'persona')
    .eq('config_key', personaKey)
    .single();

  if (!personaConfig || !personaConfig.config_data) {
    // Return default story
    return {
      story:
        'Living with a chronic condition while trying to maintain work and relationships.',
      description:
        'Someone who understands the daily struggle of managing unpredictable symptoms.',
    };
  }

  const data = personaConfig.config_data as Record<string, unknown>;
  return {
    // Deliberately exclude: name, age, demographic
    story: (data.story as string) || '',
    description: (data.description as string) || '',
  };
}

/**
 * Creates placeholder responses when data is unavailable
 */
function createPlaceholderResponses(): ModalResponses {
  return {
    q1: createPlaceholderQuestion(1),
    q2: createPlaceholderQuestion(2),
    q3: createPlaceholderQuestion(3),
    q4: createPlaceholderQuestion(4),
  };
}

function createPlaceholderQuestion(num: number): QuestionAnswer {
  const placeholders: Record<number, QuestionAnswer> = {
    1: {
      questionKey: 'q1_entry',
      questionText: 'What brings you here today?',
      answerValue: 'flares',
      answerLabel: 'Unpredictable flares',
    },
    2: {
      questionKey: 'q2_pain_point',
      questionText: "What's been hardest about managing this?",
      answerValue: 'no_warning',
      answerLabel: 'They hit without warning',
    },
    3: {
      questionKey: 'q3_product_specific',
      questionText: 'How much warning would make a difference?',
      answerValue: 'day',
      answerLabel: 'A day to cancel or reschedule',
    },
    4: {
      questionKey: 'q4_product_specific',
      questionText: 'What would you do with advance notice?',
      answerValue: 'all',
      answerLabel: 'All of the above',
    },
  };
  return placeholders[num] ?? placeholders[1]!;
}

export default assembleContext;
