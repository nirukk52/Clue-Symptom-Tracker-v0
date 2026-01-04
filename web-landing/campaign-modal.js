/**
 * Campaign Modal Component v2
 *
 * Purpose: 4-question conversational flow with auto-advance on selection,
 * followed by AI-generated summary + email capture.
 *
 * Flow:
 * Q1: Entry point (universal) → auto-advance
 * Q2: Pain point (contextual based on Q1) → auto-advance
 * Q3: Product-specific question 1 → auto-advance
 * Q4: Product-specific question 2 → auto-advance
 * Screen 5: AI Summary + Email form
 *
 * Design: Minimal, formal, classy — matches email signup modal
 */

(function () {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const SUPABASE_URL = 'https://zvpudxinbcsrfyojrhhv.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cHVkeGluYmNzcmZ5b2pyaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTE3MjksImV4cCI6MjA4MjUyNzcyOX0.5vV65qusPzu7847VxbiodRU0DZG1AryUuoklX3qFAWk';

  const TOTAL_QUESTIONS = 4;
  const AUTO_ADVANCE_DELAY = 350; // ms

  // Product offerings
  const PRODUCT_OFFERINGS = {
    'flare-forecast': {
      name: 'Flare Forecast',
      icon: 'visibility',
      color: 'accent-purple',
    },
    'top-suspect': {
      name: 'Top Suspect',
      icon: 'search',
      color: 'accent-peach',
    },
    'crash-prevention': {
      name: 'Crash Prevention',
      icon: 'battery_horiz_075',
      color: 'accent-mint',
    },
    'spoon-saver': {
      name: 'Spoon Saver',
      icon: 'bolt',
      color: 'accent-blue',
    },
  };

  // ============================================
  // QUESTION DATA
  // ============================================

  // Q1: Universal entry point
  const Q1_OPTIONS = [
    { value: 'fatigue', label: "Fatigue that won't quit" },
    { value: 'flares', label: 'Unpredictable flares' },
    { value: 'migraines', label: 'Migraines that derail everything' },
    { value: 'ibs_gut', label: "IBS / Gut issues I can't figure out" },
    { value: 'multiple', label: 'Managing multiple conditions' },
    { value: 'other', label: 'Something else' },
  ];

  // Q2: Contextual pain points (based on Q1 selection)
  const Q2_OPTIONS = {
    fatigue: [
      {
        value: 'energy_envelope',
        label: 'I never know how much I can safely do',
      },
      {
        value: 'good_days_trap',
        label: 'Good days trick me into overdoing it',
      },
      { value: 'brain_fog', label: 'Brain fog makes everything harder' },
      {
        value: 'not_understood',
        label: "People don't understand why I can't just push through",
      },
      { value: 'delayed_payback', label: "I pay for today's effort tomorrow" },
    ],
    flares: [
      {
        value: 'cant_plan',
        label: "I can't plan anything because I never know",
      },
      { value: 'no_warning', label: 'They hit without warning' },
      {
        value: 'unknown_triggers',
        label: "I don't know what's triggering them",
      },
      { value: 'cancel_constantly', label: 'I cancel on people constantly' },
      {
        value: 'anxiety_waiting',
        label: 'I waste good days waiting for the other shoe to drop',
      },
    ],
    migraines: [
      {
        value: 'too_late_meds',
        label: "By the time I notice, it's too late for meds to help",
      },
      {
        value: 'unknown_triggers',
        label: "I can't figure out what triggers them",
      },
      { value: 'lost_days', label: 'I lose entire days when they hit' },
      {
        value: 'miss_warning',
        label: "I miss the warning signs until it's too late",
      },
      {
        value: 'no_patterns',
        label: "I've tried tracking but can't find patterns",
      },
    ],
    ibs_gut: [
      { value: 'unsafe_foods', label: "I can't tell which foods are safe" },
      {
        value: 'delayed_reactions',
        label: "Reactions are delayed so I can't connect them",
      },
      {
        value: 'inconsistent',
        label: 'Same food, different reactions — makes no sense',
      },
      {
        value: 'elimination_exhausting',
        label: 'Elimination diets are exhausting and inconclusive',
      },
      { value: 'eating_gamble', label: 'Eating out feels like a gamble' },
    ],
    multiple: [
      {
        value: 'symptom_overlap',
        label: "I can't tell which condition is causing what",
      },
      {
        value: 'competing_needs',
        label: 'What helps one thing makes another worse',
      },
      {
        value: 'tracking_burden',
        label: 'Tracking everything is a full-time job',
      },
      { value: 'medical_silos', label: "My doctors don't connect the dots" },
      { value: 'all_blurs', label: 'It all blurs together into one bad day' },
    ],
    other: [
      {
        value: 'still_figuring',
        label: "I'm still trying to figure out what's wrong",
      },
      { value: 'not_believed', label: "I don't feel believed by doctors" },
      {
        value: 'tracking_failed',
        label: "I've tried tracking before but it didn't help",
      },
      { value: 'life_disruption', label: "I can't live the life I used to" },
      { value: 'want_answers', label: 'I just want answers' },
    ],
  };

  // Q3 & Q4: Product-specific questions
  const PRODUCT_QUESTIONS = {
    'flare-forecast': {
      q3: {
        text: 'How much warning would make a difference?',
        options: [
          { value: 'hours', label: 'A few hours to adjust my day' },
          { value: 'day', label: 'A day to cancel or reschedule' },
          { value: 'days', label: '2-3 days to prepare properly' },
          { value: 'any', label: "Just knowing it's coming would help" },
        ],
      },
      q4: {
        text: 'What would you do with advance notice?',
        options: [
          { value: 'rest', label: 'Rest before it hits' },
          { value: 'reschedule', label: 'Reschedule commitments' },
          { value: 'prepare', label: 'Stock up on what I need' },
          { value: 'tell_others', label: 'Tell people around me' },
          { value: 'all', label: 'All of the above' },
        ],
      },
    },
    'top-suspect': {
      q3: {
        text: 'Which trigger are you most unsure about?',
        options: [
          { value: 'sleep', label: 'Sleep quality or timing' },
          { value: 'food', label: "Something I'm eating" },
          { value: 'stress', label: 'Stress levels' },
          { value: 'hormones', label: 'Hormonal cycle' },
          { value: 'environment', label: 'Weather or environment' },
          { value: 'unknown', label: "Not sure — that's the problem" },
        ],
      },
      q4: {
        text: 'What would "proof" look like to you?',
        options: [
          { value: 'correlations', label: 'Seeing correlations in my data' },
          { value: 'ranked_list', label: 'A ranked list of likely triggers' },
          { value: 'doctor_ready', label: 'Something I can show my doctor' },
          { value: 'confidence', label: 'Enough confidence to make changes' },
        ],
      },
    },
    'crash-prevention': {
      q3: {
        text: "What's your biggest pacing struggle?",
        options: [
          { value: 'push_too_hard', label: 'I push too hard on good days' },
          { value: 'cant_tell', label: "I can't tell when to stop" },
          { value: 'ignore_signs', label: 'I ignore the warning signs' },
          { value: 'guilt', label: 'I feel guilty resting' },
          { value: 'boom_bust', label: 'The boom-bust cycle never ends' },
        ],
      },
      q4: {
        text: 'What would "permission to rest" look like?',
        options: [
          { value: 'data_limit', label: "Data showing I'm at my limit" },
          { value: 'push_rest_signal', label: 'A clear push vs. rest signal' },
          { value: 'explain_others', label: 'Something to explain to others' },
          {
            value: 'confidence_rest',
            label: 'Confidence that resting is the right call',
          },
        ],
      },
    },
    'spoon-saver': {
      q3: {
        text: 'What kills tracking for you?',
        options: [
          { value: 'too_many_questions', label: 'Too many questions' },
          { value: 'typing', label: 'Having to type' },
          { value: 'remembering', label: 'Remembering to do it' },
          { value: 'not_worth_it', label: "Doesn't feel worth the effort" },
          { value: 'bad_days', label: 'Bad days make it impossible' },
        ],
      },
      q4: {
        text: 'On your worst days, what could you manage?',
        options: [
          { value: 'one_tap', label: 'One tap to say how I feel' },
          { value: 'voice', label: 'Voice note, no typing' },
          { value: 'yes_no', label: 'Just yes/no questions' },
          { value: 'nothing', label: "Nothing — that's the problem" },
        ],
      },
    },
  };

  // ============================================
  // STATE
  // ============================================
  let supabase = null;
  let currentProduct = null;
  let currentQuestion = 1;
  let responses = {};
  let modalSessionId = null;
  let visitId = null;
  let personaShown = null;
  let startTime = null;
  let questionStartTime = null;

  // ============================================
  // PERSONA HANDLING (Random A/B assignment)
  // ============================================
  function getPersona() {
    const params = new URLSearchParams(window.location.search);
    const urlPersona = params.get('persona');

    // Allow URL override for testing
    if (
      urlPersona &&
      ['maya', 'jordan', 'marcus'].includes(urlPersona.toLowerCase())
    ) {
      sessionStorage.setItem('assigned_persona', urlPersona.toLowerCase());
      sessionStorage.setItem('persona_source', 'url_param');
      return urlPersona.toLowerCase();
    }

    // Check if already assigned this session
    const stored = sessionStorage.getItem('assigned_persona');
    if (stored) {
      return stored;
    }

    // Random assignment (33% each)
    const personas = ['maya', 'jordan', 'marcus'];
    const assigned = personas[Math.floor(Math.random() * personas.length)];
    sessionStorage.setItem('assigned_persona', assigned);
    sessionStorage.setItem('persona_source', 'random');
    return assigned;
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // Detect product from URL
    const path = window.location.pathname
      .replace(/\//g, '')
      .replace('.html', '');
    currentProduct = PRODUCT_OFFERINGS[path] ? path : 'flare-forecast';

    // Get or assign persona for A/B testing
    personaShown = getPersona();

    createModalDOM();
    attachEventListeners();
    logVisit();
  }

  // ============================================
  // VISIT LOGGING
  // ============================================
  async function logVisit() {
    if (!supabase) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = sessionStorage.getItem('session_id') || generateId();
    sessionStorage.setItem('session_id', sessionId);

    try {
      const { data } = await supabase
        .from('landing_visits')
        .insert({
          session_id: sessionId,
          product_offering: currentProduct,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_content: params.get('utm_content'),
          utm_term: params.get('utm_term'),
          headline_variant: params.get('headline') || 'default',
          persona_shown: personaShown,
          persona_source: sessionStorage.getItem('persona_source') || 'random',
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          referrer: document.referrer || null,
        })
        .select()
        .single();

      if (data) visitId = data.id;
    } catch (err) {
      console.error('Error logging visit:', err);
    }
  }

  // ============================================
  // MODAL SESSION
  // ============================================
  async function startModalSession() {
    if (!supabase) return;

    startTime = Date.now();
    questionStartTime = Date.now();

    try {
      const { data } = await supabase
        .from('modal_sessions')
        .insert({
          visit_id: visitId,
          session_id: sessionStorage.getItem('session_id'),
          product_offering: currentProduct,
          persona_shown: personaShown,
          utm_content: new URLSearchParams(window.location.search).get(
            'utm_content'
          ),
          device_type: getDeviceType(),
          step_reached: 1,
          total_steps: TOTAL_QUESTIONS,
        })
        .select()
        .single();

      if (data) modalSessionId = data.id;
    } catch (err) {
      console.error('Error starting modal session:', err);
    }
  }

  async function updateModalSession(completed = false) {
    if (!supabase || !modalSessionId) return;

    try {
      const updateData = {
        step_reached: currentQuestion,
        updated_at: new Date().toISOString(),
      };

      if (completed) {
        updateData.completed = true;
        updateData.completed_at = new Date().toISOString();
        updateData.time_to_complete_ms = Date.now() - startTime;
      } else {
        updateData.abandoned_at_step = currentQuestion;
      }

      await supabase
        .from('modal_sessions')
        .update(updateData)
        .eq('id', modalSessionId);
    } catch (err) {
      console.error('Error updating modal session:', err);
    }
  }

  /**
   * Logs a modal response to Supabase for analytics
   * @param {Object} data - Response data object
   */
  async function logResponse(data) {
    if (!supabase || !modalSessionId) return;

    const timeToAnswer = Date.now() - questionStartTime;
    questionStartTime = Date.now();

    try {
      await supabase.from('modal_responses').insert({
        modal_session_id: modalSessionId,
        question_number: data.questionNumber,
        question_key: data.questionKey,
        question_text: data.questionText,
        step_number: data.questionNumber,
        answer_value: data.answerValue,
        answer_label: data.answerLabel,
        previous_answer_value: data.previousAnswer || null,
        product_offering: currentProduct,
        time_to_answer_ms: timeToAnswer,
      });
    } catch (err) {
      console.error('Error logging response:', err);
    }
  }

  // ============================================
  // MODAL DOM
  // ============================================
  // eslint-disable-next-line max-lines-per-function -- Contains HTML template
  function createModalDOM() {
    const existing = document.getElementById('campaignModal');
    if (existing) existing.remove();

    const productInfo =
      PRODUCT_OFFERINGS[currentProduct] || PRODUCT_OFFERINGS['flare-forecast'];

    const modalHTML = `
      <div class="cm-overlay" id="campaignModal" aria-hidden="true" role="dialog">
        <div class="cm-container">
          <div class="cm-content">
            <!-- Decorative blobs -->
            <div class="cm-blob-1"></div>
            <div class="cm-blob-2"></div>

            <!-- Close button -->
            <button class="cm-close" id="cmClose" aria-label="Close">
              <span class="material-symbols-outlined">close</span>
            </button>

            <!-- Progress dots -->
            <div class="cm-progress" id="cmProgress">
              <div class="cm-dot active" data-q="1"></div>
              <div class="cm-dot" data-q="2"></div>
              <div class="cm-dot" data-q="3"></div>
              <div class="cm-dot" data-q="4"></div>
            </div>

            <!-- Question screens (Q1-Q4) -->
            <div class="cm-screen active" id="cmQ1">
              <div class="cm-header">
                <div class="cm-icon bg-${productInfo.color}/20">
                  <span class="material-symbols-outlined text-primary">${productInfo.icon}</span>
                </div>
                <h3 class="cm-title">What brings you here today?</h3>
              </div>
              <div class="cm-options" id="cmQ1Options"></div>
            </div>

            <div class="cm-screen" id="cmQ2">
              <div class="cm-header">
                <h3 class="cm-title">What's been hardest about managing this?</h3>
              </div>
              <div class="cm-options" id="cmQ2Options"></div>
            </div>

            <div class="cm-screen" id="cmQ3">
              <div class="cm-header">
                <h3 class="cm-title" id="cmQ3Title"></h3>
              </div>
              <div class="cm-options" id="cmQ3Options"></div>
            </div>

            <div class="cm-screen" id="cmQ4">
              <div class="cm-header">
                <h3 class="cm-title" id="cmQ4Title"></h3>
              </div>
              <div class="cm-options" id="cmQ4Options"></div>
            </div>

            <!-- Summary + Email screen -->
            <div class="cm-screen" id="cmSummary">
              <div class="cm-summary-content" id="cmSummaryContent">
                <div class="cm-loading">
                  <span class="material-symbols-outlined cm-spin">progress_activity</span>
                </div>
              </div>
              <form id="cmEmailForm" class="cm-email-form hidden">
                <input
                  type="email"
                  id="cmEmailInput"
                  class="cm-input"
                  placeholder="your@email.com"
                  required
                  autocomplete="email"
                />
                <p id="cmEmailError" class="cm-error hidden">Please enter a valid email</p>
                <button type="submit" class="cm-submit" id="cmSubmitBtn">
                  Get early access
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
                <p class="cm-privacy">
                  <span class="material-symbols-outlined">lock</span>
                  No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </div>

            <!-- Success screen -->
            <div class="cm-screen" id="cmSuccess">
              <div class="cm-success-content">
                <div class="cm-success-icon">
                  <span class="material-symbols-outlined">check</span>
                </div>
                <h3 class="cm-title">You're on the list!</h3>
                <p class="cm-subtitle">We'll reach out when Chronic Life is ready for you.</p>
                <button class="cm-submit" id="cmDoneBtn">
                  Done
                  <span class="material-symbols-outlined">check</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addModalStyles();
  }

  // eslint-disable-next-line max-lines-per-function -- Contains CSS template
  function addModalStyles() {
    if (document.getElementById('cmStyles')) return;

    const styles = `
      <style id="cmStyles">
        /* Overlay */
        .cm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(32, 19, 46, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .cm-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Container */
        .cm-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.95);
          z-index: 1001;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cm-overlay.active .cm-container {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        /* Content */
        .cm-content {
          background: #FDFBF9;
          border-radius: 2rem;
          padding: 2.5rem;
          width: 90vw;
          max-width: 400px;
          box-shadow: 0 25px 60px -15px rgba(32, 20, 46, 0.25);
          border: 1px solid rgba(32, 19, 46, 0.05);
          position: relative;
          overflow: hidden;
        }

        /* Decorative blobs */
        .cm-blob-1, .cm-blob-2 {
          position: absolute;
          pointer-events: none;
          filter: blur(20px);
        }
        .cm-blob-1 {
          top: -2rem;
          right: -2rem;
          width: 6rem;
          height: 6rem;
          background: rgba(208, 189, 244, 0.4);
          border-radius: 2rem;
          transform: rotate(12deg);
        }
        .cm-blob-2 {
          bottom: -1.5rem;
          left: -1.5rem;
          width: 5rem;
          height: 5rem;
          background: rgba(184, 227, 214, 0.5);
          border-radius: 50%;
        }

        /* Close button */
        .cm-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: rgba(32, 19, 46, 0.05);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          color: #554b66;
        }
        .cm-close:hover {
          background: rgba(32, 19, 46, 0.1);
          transform: scale(1.05);
        }

        /* Progress dots */
        .cm-progress {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .cm-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgba(32, 19, 46, 0.15);
          transition: all 0.3s ease;
        }
        .cm-dot.active {
          background: #20132E;
          width: 1.5rem;
          border-radius: 0.25rem;
        }
        .cm-dot.completed {
          background: #B8E3D6;
        }

        /* Screens */
        .cm-screen {
          display: none;
          animation: cmFadeIn 0.3s ease;
        }
        .cm-screen.active {
          display: block;
        }
        @keyframes cmFadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Header */
        .cm-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .cm-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .cm-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.375rem;
          font-weight: 600;
          color: #20132E;
          line-height: 1.3;
          margin: 0;
        }
        .cm-subtitle {
          color: #554b66;
          font-size: 0.9375rem;
          margin-top: 0.5rem;
        }

        /* Options */
        .cm-options {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .cm-option {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          border: 2px solid rgba(32, 19, 46, 0.08);
          background: white;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #554b66;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .cm-option:hover {
          border-color: #D0BDF4;
          background: rgba(208, 189, 244, 0.08);
        }
        .cm-option.selected {
          border-color: #20132E;
          background: rgba(208, 189, 244, 0.15);
          color: #20132E;
        }

        /* Email form */
        .cm-email-form {
          margin-top: 1.5rem;
        }
        .cm-email-form.hidden {
          display: none;
        }
        .cm-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 9999px;
          border: 2px solid rgba(32, 19, 46, 0.1);
          font-size: 1rem;
          font-family: 'DM Sans', system-ui, sans-serif;
          background: white;
          color: #20132E;
          outline: none;
          margin-bottom: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }
        .cm-input:focus {
          border-color: #D0BDF4;
          box-shadow: 0 0 0 4px rgba(208, 189, 244, 0.2);
        }
        .cm-input::placeholder {
          color: #554b66;
          opacity: 0.6;
        }
        .cm-input.error {
          border-color: #E8974F;
        }
        .cm-error {
          color: #E8974F;
          font-size: 0.875rem;
          margin: -0.5rem 0 1rem;
          text-align: center;
        }
        .cm-error.hidden {
          display: none;
        }

        /* Submit button */
        .cm-submit {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 9999px;
          background: #20132E;
          color: white;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'DM Sans', system-ui, sans-serif;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .cm-submit:hover {
          background: rgba(32, 19, 46, 0.9);
          box-shadow: 0 8px 24px -4px rgba(32, 20, 46, 0.3);
        }
        .cm-submit:active {
          transform: scale(0.98);
        }
        .cm-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Privacy text */
        .cm-privacy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: rgba(85, 75, 102, 0.7);
          margin-top: 1rem;
        }
        .cm-privacy .material-symbols-outlined {
          font-size: 0.875rem;
        }

        /* Summary content */
        .cm-summary-content {
          min-height: 120px;
        }
        .cm-loading {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
        }
        .cm-spin {
          font-size: 2rem;
          color: #D0BDF4;
          animation: cmSpin 1s linear infinite;
        }
        @keyframes cmSpin {
          to { transform: rotate(360deg); }
        }
        .cm-summary-text {
          animation: cmFadeIn 0.4s ease;
        }
        .cm-summary-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #20132E;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .cm-summary-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .cm-summary-features li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.9375rem;
          color: #554b66;
        }
        .cm-summary-features li .material-symbols-outlined {
          color: #B8E3D6;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        /* Success */
        .cm-success-content {
          text-align: center;
        }
        .cm-success-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #B8E3D6 0%, #A4C8D8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          animation: cmScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cm-success-icon .material-symbols-outlined {
          font-size: 2rem;
          color: white;
        }
        @keyframes cmScaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        /* Color utilities */
        .bg-accent-purple\\/20 { background: rgba(208, 189, 244, 0.2); }
        .bg-accent-peach\\/20 { background: rgba(232, 151, 79, 0.2); }
        .bg-accent-mint\\/20 { background: rgba(184, 227, 214, 0.2); }
        .bg-accent-blue\\/20 { background: rgba(164, 200, 216, 0.2); }
        .text-primary { color: #20132E; }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // ============================================
  // QUESTION RENDERING
  // ============================================
  function renderQ1() {
    const container = document.getElementById('cmQ1Options');
    container.innerHTML = Q1_OPTIONS.map(
      (opt) => `
        <button type="button" class="cm-option" data-value="${opt.value}" data-label="${opt.label}">
          ${opt.label}
        </button>
      `
    ).join('');

    container.querySelectorAll('.cm-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQ1Selection(btn));
    });
  }

  function handleQ1Selection(btn) {
    const value = btn.dataset.value;
    const label = btn.dataset.label;

    // Visual feedback
    btn
      .closest('.cm-options')
      .querySelectorAll('.cm-option')
      .forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Store response
    responses.q1 = { value, label };

    // Log to DB
    logResponse({
      questionNumber: 1,
      questionKey: 'q1_entry',
      questionText: 'What brings you here today?',
      answerValue: value,
      answerLabel: label,
    });

    // Auto-advance after delay
    setTimeout(() => goToQuestion(2), AUTO_ADVANCE_DELAY);
  }

  function renderQ2() {
    const q1Value = responses.q1?.value || 'other';
    const options = Q2_OPTIONS[q1Value] || Q2_OPTIONS.other;
    const container = document.getElementById('cmQ2Options');

    container.innerHTML = options
      .map(
        (opt) => `
        <button type="button" class="cm-option" data-value="${opt.value}" data-label="${opt.label}">
          ${opt.label}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('.cm-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQ2Selection(btn));
    });
  }

  function handleQ2Selection(btn) {
    const value = btn.dataset.value;
    const label = btn.dataset.label;

    btn
      .closest('.cm-options')
      .querySelectorAll('.cm-option')
      .forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');

    responses.q2 = { value, label };

    logResponse({
      questionNumber: 2,
      questionKey: 'q2_pain_point',
      questionText: "What's been hardest about managing this?",
      answerValue: value,
      answerLabel: label,
      previousAnswer: responses.q1?.value,
    });

    setTimeout(() => goToQuestion(3), AUTO_ADVANCE_DELAY);
  }

  function renderQ3() {
    const productQs =
      PRODUCT_QUESTIONS[currentProduct] || PRODUCT_QUESTIONS['flare-forecast'];
    const q3 = productQs.q3;

    document.getElementById('cmQ3Title').textContent = q3.text;

    const container = document.getElementById('cmQ3Options');
    container.innerHTML = q3.options
      .map(
        (opt) => `
        <button type="button" class="cm-option" data-value="${opt.value}" data-label="${opt.label}">
          ${opt.label}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('.cm-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQ3Selection(btn, q3.text));
    });
  }

  function handleQ3Selection(btn, questionText) {
    const value = btn.dataset.value;
    const label = btn.dataset.label;

    btn
      .closest('.cm-options')
      .querySelectorAll('.cm-option')
      .forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');

    responses.q3 = { value, label };

    logResponse({
      questionNumber: 3,
      questionKey: 'q3_product_specific',
      questionText: questionText,
      answerValue: value,
      answerLabel: label,
      previousAnswer: responses.q1?.value,
    });

    setTimeout(() => goToQuestion(4), AUTO_ADVANCE_DELAY);
  }

  function renderQ4() {
    const productQs =
      PRODUCT_QUESTIONS[currentProduct] || PRODUCT_QUESTIONS['flare-forecast'];
    const q4 = productQs.q4;

    document.getElementById('cmQ4Title').textContent = q4.text;

    const container = document.getElementById('cmQ4Options');
    container.innerHTML = q4.options
      .map(
        (opt) => `
        <button type="button" class="cm-option" data-value="${opt.value}" data-label="${opt.label}">
          ${opt.label}
        </button>
      `
      )
      .join('');

    container.querySelectorAll('.cm-option').forEach((btn) => {
      btn.addEventListener('click', () => handleQ4Selection(btn, q4.text));
    });
  }

  function handleQ4Selection(btn, questionText) {
    const value = btn.dataset.value;
    const label = btn.dataset.label;

    btn
      .closest('.cm-options')
      .querySelectorAll('.cm-option')
      .forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');

    responses.q4 = { value, label };

    logResponse({
      questionNumber: 4,
      questionKey: 'q4_product_specific',
      questionText: questionText,
      answerValue: value,
      answerLabel: label,
      previousAnswer: responses.q1?.value,
    });

    setTimeout(() => goToSummary(), AUTO_ADVANCE_DELAY);
  }

  // ============================================
  // NAVIGATION
  // ============================================
  function goToQuestion(num) {
    currentQuestion = num;

    // Update progress dots
    document.querySelectorAll('.cm-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i + 1 < num) dot.classList.add('completed');
      if (i + 1 === num) dot.classList.add('active');
    });

    // Hide all screens, show target
    document
      .querySelectorAll('.cm-screen')
      .forEach((s) => s.classList.remove('active'));

    if (num === 2) {
      renderQ2();
      document.getElementById('cmQ2').classList.add('active');
    } else if (num === 3) {
      renderQ3();
      document.getElementById('cmQ3').classList.add('active');
    } else if (num === 4) {
      renderQ4();
      document.getElementById('cmQ4').classList.add('active');
    }

    updateModalSession();
  }

  function goToSummary() {
    // Mark all progress dots completed
    document.querySelectorAll('.cm-dot').forEach((dot) => {
      dot.classList.remove('active');
      dot.classList.add('completed');
    });

    // Hide progress, show summary
    document.getElementById('cmProgress').style.opacity = '0';
    document
      .querySelectorAll('.cm-screen')
      .forEach((s) => s.classList.remove('active'));
    document.getElementById('cmSummary').classList.add('active');

    generateSummary();
  }

  function goToSuccess() {
    document
      .querySelectorAll('.cm-screen')
      .forEach((s) => s.classList.remove('active'));
    document.getElementById('cmSuccess').classList.add('active');
    updateModalSession(true);
  }

  // ============================================
  // AI SUMMARY
  // ============================================
  async function generateSummary() {
    const summaryContainer = document.getElementById('cmSummaryContent');
    const emailForm = document.getElementById('cmEmailForm');

    const summary = buildSummary();

    // Log AI generation
    await logAIGeneration(summary);

    // Render summary
    summaryContainer.innerHTML = `
      <div class="cm-summary-text">
        <p class="cm-summary-headline">${summary.headline}</p>
        <ul class="cm-summary-features">
          ${summary.features
            .map(
              (f) => `
            <li>
              <span class="material-symbols-outlined">check_circle</span>
              ${f}
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    // Show email form
    emailForm.classList.remove('hidden');
  }

  function buildSummary() {
    const q1Label = responses.q1?.label || 'your condition';

    // Product-specific templates that incorporate Q1
    const templates = {
      'flare-forecast': {
        headline: `We'll learn your patterns and give you a heads up before ${q1Label.toLowerCase()} flares hit.`,
        features: [
          '48-hour early warning based on your sleep, stress, and activity',
          'Gentle alerts that feel like a weather forecast',
          'Doctor-ready summaries showing your prediction accuracy',
        ],
      },
      'top-suspect': {
        headline: `We'll help you finally figure out what's triggering your ${q1Label.toLowerCase()}.`,
        features: [
          'Track sleep, food, stress, and cycle in one place',
          'Weekly "Top Suspects" ranked by correlation',
          'Evidence you can actually show your doctor',
        ],
      },
      'crash-prevention': {
        headline: `We'll help you pace yourself so ${q1Label.toLowerCase()} doesn't steal tomorrow.`,
        features: [
          'Daily Push/Rest indicator based on your patterns',
          "Gentle nudges when you're approaching your limit",
          'Break the boom-bust cycle with data-backed rest',
        ],
      },
      'spoon-saver': {
        headline: `We'll make tracking ${q1Label.toLowerCase()} so simple it won't cost you a spoon.`,
        features: [
          '20-second check-ins designed for your worst days',
          'Voice logging when typing feels like too much',
          'Automatic patterns — no spreadsheets required',
        ],
      },
    };

    return templates[currentProduct] || templates['flare-forecast'];
  }

  async function logAIGeneration(summary) {
    if (!supabase || !modalSessionId) return;

    try {
      await supabase.from('ai_generations').insert({
        modal_session_id: modalSessionId,
        session_id: sessionStorage.getItem('session_id'),
        context_json: {
          product: currentProduct,
          responses: responses,
          utm: Object.fromEntries(new URLSearchParams(window.location.search)),
        },
        generated_headline: summary.headline,
        generated_features: summary.features,
        generated_cta: 'Get early access',
        model_used: 'template_v2',
        prompt_template_id: 'conversational_flow_v2',
        was_shown: true,
      });
    } catch (err) {
      console.error('Error logging AI generation:', err);
    }
  }

  // ============================================
  // EMAIL SUBMISSION
  // ============================================
  // eslint-disable-next-line max-lines-per-function -- Complex form handling
  async function handleEmailSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('cmEmailInput');
    const emailError = document.getElementById('cmEmailError');
    const submitBtn = document.getElementById('cmSubmitBtn');
    const email = emailInput.value.trim();

    // Validate
    if (!isValidEmail(email)) {
      emailInput.classList.add('error');
      emailError.classList.remove('hidden');
      return;
    }

    // Submit
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="material-symbols-outlined cm-spin">progress_activity</span> Submitting...';

    try {
      const utm = new URLSearchParams(window.location.search);
      const { error } = await supabase.from('beta_signups').insert({
        email: email,
        utm_source: utm.get('utm_source'),
        utm_medium: utm.get('utm_medium'),
        utm_campaign: utm.get('utm_campaign'),
        utm_content: utm.get('utm_content'),
        utm_term: utm.get('utm_term'),
        landing_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });

      if (error && error.message.includes('duplicate')) {
        emailError.textContent = 'This email is already on the waitlist!';
        emailError.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          'Get early access <span class="material-symbols-outlined">arrow_forward</span>';
        return;
      }

      // Update AI generation as converted
      if (modalSessionId) {
        await supabase
          .from('ai_generations')
          .update({ converted: true })
          .eq('modal_session_id', modalSessionId);
      }

      // Track event
      if (window.ChronicLifeTracking) {
        window.ChronicLifeTracking.trackEvent(
          'signup_complete',
          'campaign_modal_v2',
          email
        );
      }

      goToSuccess();
    } catch (err) {
      console.error('Signup error:', err);
      emailError.textContent = 'Something went wrong. Please try again.';
      emailError.classList.remove('hidden');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML =
      'Get early access <span class="material-symbols-outlined">arrow_forward</span>';
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function attachEventListeners() {
    // Modal triggers
    document.querySelectorAll('[data-modal-trigger]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (window.ChronicLifeTracking) {
          const ctaId = btn.dataset.ctaId || btn.id || 'unknown_cta';
          const ctaText =
            btn.dataset.ctaText || btn.textContent?.trim().substring(0, 50);
          window.ChronicLifeTracking.trackEvent('cta_click', ctaId, ctaText);
        }

        await openModal();
      });
    });

    // Close button
    document.getElementById('cmClose')?.addEventListener('click', closeModal);

    // Overlay click
    document.getElementById('campaignModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'campaignModal') closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Email form
    document
      .getElementById('cmEmailForm')
      ?.addEventListener('submit', handleEmailSubmit);

    // Done button
    document.getElementById('cmDoneBtn')?.addEventListener('click', closeModal);

    // Email input reset
    document.getElementById('cmEmailInput')?.addEventListener('input', () => {
      document.getElementById('cmEmailInput').classList.remove('error');
      document.getElementById('cmEmailError').classList.add('hidden');
    });
  }

  // ============================================
  // MODAL OPEN/CLOSE
  // ============================================
  async function openModal() {
    const modal = document.getElementById('campaignModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset state
    currentQuestion = 1;
    responses = {};

    // Reset UI
    document.getElementById('cmProgress').style.opacity = '1';
    document.querySelectorAll('.cm-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i === 0) dot.classList.add('active');
    });
    document
      .querySelectorAll('.cm-screen')
      .forEach((s) => s.classList.remove('active'));
    document.getElementById('cmQ1').classList.add('active');

    // Reset email form
    document.getElementById('cmEmailForm').classList.add('hidden');
    document.getElementById('cmEmailInput').value = '';
    document.getElementById('cmEmailInput').classList.remove('error');
    document.getElementById('cmEmailError').classList.add('hidden');

    // Start session
    await startModalSession();

    // Render Q1
    renderQ1();
  }

  function closeModal() {
    const modal = document.getElementById('campaignModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Log abandonment if not completed
    if (currentQuestion <= TOTAL_QUESTIONS) {
      updateModalSession(false);
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua))
      return 'mobile';
    return 'desktop';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ============================================
  // INITIALIZE
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.CampaignModal = {
    open: openModal,
    close: closeModal,
    getResponses: () => responses,
  };
})();
