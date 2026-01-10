/**
 * Summary Generation Agent - Browser Bundle
 *
 * Why this exists: Browser-compatible version of the summary generation agent
 * for use in static landing pages (web-landing/).
 *
 * Usage in campaign-modal.js:
 *   const context = await window.SummaryAgent.assembleContext(supabase, modalSessionId);
 *   const result = await window.SummaryAgent.generateSummary(context, OPENAI_API_KEY);
 */

(function (global) {
  'use strict';

  // =============================================================================
  // PROMPT TEMPLATE
  // =============================================================================

  const PROMPT_TEMPLATE = `You are a conversion copywriter for Chronic Life, a symptom tracking app for people with chronic conditions.

## Your Task

Generate a personalized conversion summary that makes the user feel understood and ready to sign up.

## User Context

### How They Found Us
- **Ad they clicked**: {{ad.headline}}
- **Ad description**: {{ad.description}}
- **Landing page title**: {{landingPage.heroTitle}}
- **Product focus**: {{landingPage.productOffering}}

### Their Story (Someone Like Them)
{{persona.story}}

### What They Told Us

**Q1: What brings you here?**
Answer: {{answers.q1.answerLabel}}

**Q2: What's been hardest?**
Answer: {{answers.q2.answerLabel}}

**Q3: {{answers.q3.questionText}}**
Answer: {{answers.q3.answerLabel}}

**Q4: {{answers.q4.questionText}}**
Answer: {{answers.q4.answerLabel}}

## Writing Guidelines

### The Title Should:
1. Directly address their Q2 pain point (what's been hardest)
2. Promise a specific outcome related to the product
3. Feel like you already understand their specific situation
4. NOT use generic chronic illness language

### The 3 Benefits Should:
1. **Benefit 1**: Address their Q3 answer (product-specific need)
2. **Benefit 2**: Echo the landing page's focus feature
3. **Benefit 3**: Provide social proof or reassurance based on persona story

### Tone:
- Warm but not cheesy
- Specific, not generic
- Confident without overpromising
- Like a knowledgeable friend, not a marketer

### DO NOT:
- Use persona names (Maya, Jordan, Marcus) - that's internal language
- Say "chronic illness" generically - be specific to their condition
- Use phrases like "we understand" or "you're not alone" - too cliché
- Overpromise ("cure", "fix", "solve")
- Use exclamation marks

## Output Format

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "title": "Your personalized headline here",
  "benefits": [
    "First benefit based on Q3",
    "Second benefit based on landing page feature",
    "Third benefit based on persona/reassurance"
  ],
  "ctaText": "Action-oriented CTA"
}`;

  // =============================================================================
  // CONTEXT ASSEMBLER
  // =============================================================================

  /**
   * Assembles complete user context for summary generation
   */
  async function assembleContext(supabase, modalSessionId) {
    // Fetch session and responses in parallel
    const [sessionData, responsesData] = await Promise.all([
      fetchSessionData(supabase, modalSessionId),
      fetchModalResponses(supabase, modalSessionId),
    ]);

    // Fetch related data based on session
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

  async function fetchSessionData(supabase, modalSessionId) {
    const { data: session, error } = await supabase
      .from('modal_sessions')
      .select(
        'session_id, product_offering, persona_shown, device_type, visit_id'
      )
      .eq('id', modalSessionId)
      .single();

    if (error || !session) {
      console.error('Error fetching modal session:', error);
      return {
        sessionId: modalSessionId,
        productOffering: 'flare-forecast',
        personaShown: 'maya',
        deviceType: 'desktop',
        utm: {
          source: null,
          medium: null,
          campaign: null,
          content: null,
          term: null,
        },
      };
    }

    let utm = {
      source: null,
      medium: null,
      campaign: null,
      content: null,
      term: null,
    };

    if (session.visit_id) {
      const { data: visit } = await supabase
        .from('landing_visits')
        .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term')
        .eq('id', session.visit_id)
        .single();

      if (visit) {
        utm = {
          source: visit.utm_source,
          medium: visit.utm_medium,
          campaign: visit.utm_campaign,
          content: visit.utm_content,
          term: visit.utm_term,
        };
      }
    }

    return {
      sessionId: session.session_id,
      productOffering: session.product_offering || 'flare-forecast',
      personaShown: session.persona_shown || 'maya',
      deviceType: session.device_type || 'desktop',
      utm,
    };
  }

  async function fetchModalResponses(supabase, modalSessionId) {
    const { data: responses, error } = await supabase
      .from('modal_responses')
      .select(
        'question_number, question_key, question_text, answer_value, answer_label'
      )
      .eq('modal_session_id', modalSessionId)
      .order('question_number', { ascending: true });

    if (error || !responses || responses.length === 0) {
      return createPlaceholderResponses();
    }

    const responseMap = {};
    for (const r of responses) {
      const qNum = r.question_number;
      if (qNum >= 1 && qNum <= 4) {
        responseMap[qNum] = {
          questionKey: r.question_key,
          questionText: r.question_text,
          answerValue: r.answer_value,
          answerLabel: r.answer_label || r.answer_value,
        };
      }
    }

    return {
      q1: responseMap[1] || createPlaceholderQuestion(1),
      q2: responseMap[2] || createPlaceholderQuestion(2),
      q3: responseMap[3] || createPlaceholderQuestion(3),
      q4: responseMap[4] || createPlaceholderQuestion(4),
    };
  }

  async function fetchAdContext(supabase, utmContent, productOffering) {
    const configKey =
      utmContent || productOffering.replace(/-/g, '_') + '_default';

    const { data: adConfig } = await supabase
      .from('campaign_config')
      .select('config_data')
      .eq('config_type', 'ad')
      .eq('config_key', configKey)
      .single();

    if (adConfig && adConfig.config_data) {
      const data = adConfig.config_data;
      return {
        headline: data.headline || '',
        description: data.description || '',
        cta: data.cta || '',
        adGroup: data.ad_group || productOffering,
      };
    }

    // Try default for product
    const { data: defaultAds } = await supabase
      .from('campaign_config')
      .select('config_data')
      .eq('config_type', 'ad')
      .eq('product_offering', productOffering);

    if (defaultAds && defaultAds.length > 0 && defaultAds[0].config_data) {
      const data = defaultAds[0].config_data;
      return {
        headline: data.headline || '',
        description: data.description || '',
        cta: data.cta || '',
        adGroup: data.ad_group || productOffering,
      };
    }

    return null;
  }

  async function fetchLandingContext(supabase, productOffering) {
    const { data: landingConfig } = await supabase
      .from('campaign_config')
      .select('config_data')
      .eq('config_type', 'landing')
      .eq('config_key', productOffering)
      .single();

    if (landingConfig && landingConfig.config_data) {
      const data = landingConfig.config_data;
      return {
        productOffering: productOffering,
        heroTitle: data.h1 || '',
        heroSubtitle: data.h2 || '',
        primaryCTA: data.cta || '',
        empathyCopy: data.empathy_copy || '',
        focusFeature: data.focus_feature || '',
      };
    }

    return {
      productOffering: productOffering,
      heroTitle: 'Predict your next flare.',
      heroSubtitle: 'See the storm coming.',
      primaryCTA: 'Start predicting',
      empathyCopy: 'A shift in your patterns suggests a rest day might help.',
      focusFeature: 'Lag Effect Detection',
    };
  }

  async function fetchPersonaContext(supabase, personaKey) {
    const { data: personaConfig } = await supabase
      .from('campaign_config')
      .select('config_data')
      .eq('config_type', 'persona')
      .eq('config_key', personaKey)
      .single();

    if (personaConfig && personaConfig.config_data) {
      const data = personaConfig.config_data;
      // IMPORTANT: Only return story and description, NOT name
      return {
        story: data.story || '',
        description: data.description || '',
      };
    }

    return {
      story:
        'Living with a chronic condition while trying to maintain work and relationships.',
      description:
        'Someone who understands the daily struggle of managing unpredictable symptoms.',
    };
  }

  function createPlaceholderResponses() {
    return {
      q1: createPlaceholderQuestion(1),
      q2: createPlaceholderQuestion(2),
      q3: createPlaceholderQuestion(3),
      q4: createPlaceholderQuestion(4),
    };
  }

  function createPlaceholderQuestion(num) {
    const placeholders = {
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
    return placeholders[num] || placeholders[1];
  }

  // =============================================================================
  // SUMMARY GENERATOR
  // =============================================================================

  /** Calls OpenAI API */
  async function callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a conversion copywriter. Return only valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) throw new Error('OpenAI API error: ' + response.status);
    return response.json();
  }

  /** Generates a personalized conversion summary using LLM */
  async function generateSummary(context, apiKey) {
    const startTime = Date.now();
    try {
      const prompt = buildPrompt(context);
      const data = await callOpenAI(prompt, apiKey);
      const content = data.choices[0]?.message?.content;
      if (!content) throw new Error('No content in OpenAI response');

      const parsed = JSON.parse(content);
      if (
        !parsed.title ||
        !Array.isArray(parsed.benefits) ||
        parsed.benefits.length < 3
      ) {
        throw new Error('Invalid response structure');
      }

      return {
        summary: {
          title: parsed.title,
          benefits: [
            parsed.benefits[0],
            parsed.benefits[1],
            parsed.benefits[2],
          ],
          ctaText: parsed.ctaText || 'Get started',
        },
        metadata: {
          modelUsed: 'gpt-4o-mini',
          promptTemplateId: 'conversion_summary_v1',
          tokensUsed: data.usage?.total_tokens || 0,
          latencyMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Summary generation failed, using fallback:', error);
      return generateFallbackSummary(context, Date.now() - startTime);
    }
  }

  function buildPrompt(context) {
    let prompt = PROMPT_TEMPLATE;

    // Ad context (may be null for direct visits)
    prompt = prompt.replace(
      '{{ad.headline}}',
      context.ad?.headline || 'Direct visit'
    );
    prompt = prompt.replace(
      '{{ad.description}}',
      context.ad?.description || 'No ad - came directly to site'
    );

    // Landing page context
    prompt = prompt.replace(
      '{{landingPage.heroTitle}}',
      context.landingPage.heroTitle
    );
    prompt = prompt.replace(
      '{{landingPage.productOffering}}',
      formatProductName(context.landingPage.productOffering)
    );

    // Persona context (story only, no name)
    prompt = prompt.replace('{{persona.story}}', context.persona.story);

    // Question answers
    prompt = prompt.replace(
      '{{answers.q1.answerLabel}}',
      context.answers.q1.answerLabel
    );
    prompt = prompt.replace(
      '{{answers.q2.answerLabel}}',
      context.answers.q2.answerLabel
    );
    prompt = prompt.replace(
      '{{answers.q3.questionText}}',
      context.answers.q3.questionText
    );
    prompt = prompt.replace(
      '{{answers.q3.answerLabel}}',
      context.answers.q3.answerLabel
    );
    prompt = prompt.replace(
      '{{answers.q4.questionText}}',
      context.answers.q4.questionText
    );
    prompt = prompt.replace(
      '{{answers.q4.answerLabel}}',
      context.answers.q4.answerLabel
    );

    return prompt;
  }

  function formatProductName(slug) {
    const names = {
      'flare-forecast': 'Flare Forecast (48-hour predictions)',
      'top-suspect': 'Top Suspect (trigger identification)',
      'crash-prevention': 'Crash Prevention (pacing alerts)',
      'spoon-saver': 'Spoon Saver (low-energy tracking)',
    };
    return names[slug] || slug;
  }

  function generateFallbackSummary(context, latencyMs) {
    const q1Label = context.answers.q1.answerLabel.toLowerCase();
    const product = context.landingPage.productOffering;

    const templates = {
      'flare-forecast': {
        title:
          "We'll learn your patterns and give you a heads up before " +
          q1Label +
          ' flares hit.',
        benefits: [
          '48-hour early warning based on your sleep, stress, and activity',
          'Gentle alerts that feel like a weather forecast',
          'Doctor-ready summaries showing your prediction accuracy',
        ],
        ctaText: 'Start predicting',
      },
      'top-suspect': {
        title:
          "We'll help you finally figure out what's triggering your " +
          q1Label +
          '.',
        benefits: [
          'Track sleep, food, stress, and cycle in one place',
          "Weekly 'Top Suspects' ranked by correlation",
          'Evidence you can actually show your doctor',
        ],
        ctaText: 'Find your triggers',
      },
      'crash-prevention': {
        title:
          "We'll help you pace yourself so " +
          q1Label +
          " doesn't steal tomorrow.",
        benefits: [
          'Daily Push/Rest indicator based on your patterns',
          "Gentle nudges when you're approaching your limit",
          'Break the boom-bust cycle with data-backed rest',
        ],
        ctaText: 'Start pacing',
      },
      'spoon-saver': {
        title:
          "We'll make tracking " +
          q1Label +
          " so simple it won't cost you a spoon.",
        benefits: [
          '20-second check-ins designed for your worst days',
          'Voice logging when typing feels like too much',
          'Automatic patterns — no spreadsheets required',
        ],
        ctaText: 'Start tracking',
      },
    };

    const template = templates[product] || templates['flare-forecast'];

    return {
      summary: template,
      metadata: {
        modelUsed: 'template_fallback',
        promptTemplateId: 'conversion_summary_fallback',
        tokensUsed: 0,
        latencyMs: latencyMs,
      },
    };
  }

  // =============================================================================
  // EXPORT
  // =============================================================================

  global.SummaryAgent = {
    assembleContext: assembleContext,
    generateSummary: generateSummary,
  };
})(typeof window !== 'undefined' ? window : this);
