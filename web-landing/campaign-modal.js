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
  // PERSONA HANDLING
  // ============================================
  // Available personas for future A/B testing:
  //   - 'maya'   (default) - 38yo South Asian woman, fibro + long COVID
  //   - 'jordan' - 28yo non-binary, younger demographic
  //   - 'marcus' - 40yo Black man, quiet confidence
  // To enable random 33% rotation, uncomment the random assignment block below.
  // ============================================
  function getPersona() {
    const params = new URLSearchParams(window.location.search);
    const urlPersona = params.get('persona');

    // Allow URL override for testing (e.g., ?persona=jordan)
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

    // Default to Maya for now
    // To enable random 33% A/B testing, replace the block below with:
    // const personas = ['maya', 'jordan', 'marcus'];
    // const assigned = personas[Math.floor(Math.random() * personas.length)];
    const assigned = 'maya';
    sessionStorage.setItem('assigned_persona', assigned);
    sessionStorage.setItem('persona_source', 'default');
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

    // Check if returning from OAuth and should show chat
    checkOAuthReturn();
  }

  /**
   * Checks if user is returning from OAuth and should go directly to chat
   */
  async function checkOAuthReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const showChat = urlParams.get('show_chat');

    if (showChat === 'true') {
      // Get user email from OAuth
      const oauthEmail = sessionStorage.getItem('oauth_user_email');

      // First, try to restore responses from sessionStorage (current session)
      const storedResponses = sessionStorage.getItem('pending_chat_responses');
      if (storedResponses) {
        try {
          const parsed = JSON.parse(storedResponses);
          Object.assign(responses, parsed);
        } catch (err) {
          console.error('Error parsing stored responses:', err);
        }
      }

      // If no session responses but we have email, try loading from Supabase (returning user)
      if (!storedResponses && oauthEmail) {
        await loadUserContext(oauthEmail);
      }

      // Clean up sessionStorage
      sessionStorage.removeItem('pending_chat_redirect');
      sessionStorage.removeItem('pending_chat_return_url');
      sessionStorage.removeItem('pending_chat_responses');
      sessionStorage.removeItem('oauth_user_email');

      // Clean up URL (remove show_chat param)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      // Open modal directly to chat
      openModal();

      // Small delay to ensure modal is rendered, then go to chat
      setTimeout(() => {
        goToChat(oauthEmail);
      }, 100);
    }
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

            <!-- Summary + Auth screen -->
            <div class="cm-screen" id="cmSummary">
              <div class="cm-summary-content" id="cmSummaryContent">
                <div class="cm-loading">
                  <span class="material-symbols-outlined cm-spin">progress_activity</span>
                </div>
              </div>

              <!-- Auth Options Container -->
              <div id="cmAuthOptions" class="cm-auth-options hidden">
                <!-- Google Sign In -->
                <button type="button" class="cm-google-btn" id="cmGoogleBtn">
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <!-- Divider -->
                <div class="cm-divider">
                  <span>or</span>
                </div>

                <!-- Email/Password Form -->
                <form id="cmAuthForm" class="cm-auth-form">
                  <input
                    type="email"
                    id="cmEmailInput"
                    class="cm-input"
                    placeholder="your@email.com"
                    required
                    autocomplete="email"
                  />
                  <input
                    type="password"
                    id="cmPasswordInput"
                    class="cm-input"
                    placeholder="Create a password"
                    required
                    autocomplete="new-password"
                    minlength="6"
                  />
                  <p id="cmAuthError" class="cm-error hidden">Please check your email and password</p>
                  <button type="submit" class="cm-submit" id="cmSubmitBtn">
                    Create account
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </form>

                <p class="cm-privacy">
                  <span class="material-symbols-outlined">lock</span>
                  Your data stays private. We never share it.
                </p>
              </div>
            </div>

            <!-- Chat screen (replaces success) -->
            <div class="cm-screen" id="cmChat">
              <div class="cm-chat-container">
                <!-- Chat messages area -->
                <div class="cm-chat-messages" id="cmChatMessages">
                  <!-- Messages will be inserted here -->
                </div>

                <!-- Quick reply chips -->
                <div class="cm-chat-chips" id="cmChatChips">
                  <!-- Dynamic chips based on Q1 answer -->
                </div>

                <!-- Chat input -->
                <div class="cm-chat-input-wrapper">
                  <input
                    type="text"
                    id="cmChatInput"
                    class="cm-chat-input"
                    placeholder="Or type your own..."
                    autocomplete="off"
                  />
                  <button type="button" id="cmChatSend" class="cm-chat-send">
                    <span class="material-symbols-outlined">send</span>
                  </button>
                </div>

                <!-- Done button (shown after a few exchanges) -->
                <button class="cm-chat-done hidden" id="cmChatDone">
                  Got it, thanks!
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

        /* Auth Options */
        .cm-auth-options {
          margin-top: 1.5rem;
        }
        .cm-auth-options.hidden {
          display: none;
        }

        /* Google Button */
        .cm-google-btn {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 9999px;
          border: 2px solid rgba(32, 19, 46, 0.1);
          background: white;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #20132E;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }
        .cm-google-btn:hover {
          border-color: #D0BDF4;
          background: rgba(208, 189, 244, 0.08);
          box-shadow: 0 4px 12px -2px rgba(32, 20, 46, 0.1);
        }
        .cm-google-btn:active {
          transform: scale(0.98);
        }
        .cm-google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Divider */
        .cm-divider {
          display: flex;
          align-items: center;
          margin: 1.25rem 0;
        }
        .cm-divider::before,
        .cm-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(32, 19, 46, 0.1);
        }
        .cm-divider span {
          padding: 0 1rem;
          font-size: 0.8125rem;
          color: rgba(85, 75, 102, 0.6);
          font-weight: 500;
        }

        /* Auth Form */
        .cm-auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .cm-auth-form .cm-input {
          margin-bottom: 0;
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

        /* Chat Screen */
        .cm-chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 320px;
          max-height: 60vh;
        }

        .cm-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Chat bubbles */
        .cm-chat-bubble {
          max-width: 85%;
          padding: 1rem 1.25rem;
          border-radius: 1.5rem;
          font-size: 0.9375rem;
          line-height: 1.5;
          animation: cmBubbleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cm-chat-bubble.assistant {
          align-self: flex-start;
          background: white;
          color: #20132E;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom-left-radius: 0.375rem;
          box-shadow: 0 2px 8px -2px rgba(32, 20, 69, 0.08);
        }

        .cm-chat-bubble.user {
          align-self: flex-end;
          background: #20132E;
          color: white;
          border-bottom-right-radius: 0.375rem;
        }

        .cm-chat-bubble.typing {
          display: flex;
          gap: 0.25rem;
          padding: 1rem 1.5rem;
        }

        .cm-typing-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: #A4C8D8;
          animation: cmTypingPulse 1.4s infinite ease-in-out;
        }

        .cm-typing-dot:nth-child(1) { animation-delay: 0s; }
        .cm-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .cm-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes cmTypingPulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.4; }
          30% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes cmBubbleIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Quick reply chips */
        .cm-chat-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          justify-content: center;
        }

        .cm-chat-chip {
          padding: 0.625rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(32, 19, 46, 0.15);
          background: white;
          color: #20132E;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .cm-chat-chip:hover {
          border-color: #D0BDF4;
          background: rgba(208, 189, 244, 0.1);
          transform: translateY(-1px);
        }

        .cm-chat-chip:active {
          transform: scale(0.97);
        }

        .cm-chat-chip.selected {
          background: #E0D4FC;
          border-color: #20132E;
        }

        /* Chat input */
        .cm-chat-input-wrapper {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .cm-chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(32, 19, 46, 0.15);
          background: white;
          font-size: 0.9375rem;
          color: #20132E;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cm-chat-input:focus {
          border-color: #D0BDF4;
          box-shadow: 0 0 0 3px rgba(208, 189, 244, 0.2);
        }

        .cm-chat-input::placeholder {
          color: #999;
        }

        .cm-chat-send {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          background: #20132E;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .cm-chat-send:hover {
          background: #352648;
          transform: scale(1.05);
        }

        .cm-chat-send:active {
          transform: scale(0.95);
        }

        .cm-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cm-chat-send .material-symbols-outlined {
          font-size: 1.25rem;
        }

        /* Done button */
        .cm-chat-done {
          width: 100%;
          margin-top: 1rem;
          padding: 0.875rem 1.5rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #B8E3D6 0%, #A4C8D8 100%);
          border: none;
          color: #20132E;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .cm-chat-done:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px -2px rgba(32, 20, 46, 0.15);
        }

        .cm-chat-done.hidden {
          display: none;
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

    // Show auth options IMMEDIATELY (no delay)
    const authOptions = document.getElementById('cmAuthOptions');
    authOptions.classList.remove('hidden');

    // Generate summary in background (doesn't block auth)
    generateSummary();
  }

  // ============================================
  // CHAT SCREEN (Post-Signup)
  // ============================================

  // Chat state
  let chatConversationId = null;
  let chatMessages = [];
  let chatUserEmail = null;
  let chatMessageCount = 0;

  // Dynamic chips based on Q1 answer
  const CHAT_CHIPS_BY_Q1 = {
    fatigue: ['Low energy', 'Brain fog', 'Just tired'],
    flares: ['Starting to flare', 'Feeling okay', 'Not sure'],
    migraines: ['Head hurts', 'Aura symptoms', 'Feeling fine'],
    ibs_gut: ['Stomach issues', 'Bloated', 'Doing okay'],
    multiple: ['Rough day', 'Managing', 'Better today'],
    other: ['Not great', 'Okay', 'Pretty good'],
  };

  /**
   * Transitions to the chat screen after successful signup
   */
  async function goToChat(email = null) {
    chatUserEmail = email;
    chatMessages = [];
    chatMessageCount = 0;

    // Show chat screen
    document
      .querySelectorAll('.cm-screen')
      .forEach((s) => s.classList.remove('active'));
    document.getElementById('cmChat').classList.add('active');

    // Create conversation in Supabase
    await createChatConversation();

    // Store user context for future sessions
    await storeUserContext();

    // Attach input listeners
    attachChatListeners();

    // Show typing indicator while generating LLM greeting
    showTypingIndicator();

    // Generate LLM-powered greeting with dynamic chips
    const { greeting, chips } = await generateLLMGreeting();

    // Hide typing indicator
    hideTypingIndicator();

    // Setup chips from LLM response
    setupDynamicChips(chips);

    // Show the greeting
    await addAssistantMessage(greeting);

    // Mark modal session as completed
    updateModalSession(true);
  }

  /**
   * Creates a new chat conversation in Supabase
   */
  async function createChatConversation() {
    if (!supabase) return;

    try {
      const utm = new URLSearchParams(window.location.search);
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          modal_session_id: modalSessionId,
          user_email: chatUserEmail,
          utm_source: utm.get('utm_source'),
          utm_medium: utm.get('utm_medium'),
          utm_campaign: utm.get('utm_campaign'),
          utm_content: utm.get('utm_content'),
          product_offering: currentProduct,
        })
        .select()
        .single();

      if (!error && data) {
        chatConversationId = data.id;
      }
    } catch (err) {
      console.error('Error creating chat conversation:', err);
    }
  }

  /**
   * Stores user context in Supabase for cross-session persistence
   * Allows personalized experience when user returns
   */
  async function storeUserContext() {
    if (!supabase || !chatUserEmail) return;

    try {
      const context = buildChatContext();

      await supabase.from('user_contexts').upsert(
        {
          email: chatUserEmail,
          q1_condition: context.conditionValue,
          q1_label: context.condition,
          q2_painpoint: context.painPointValue,
          q2_label: context.painPoint,
          q3_warning: context.warningPreferenceValue,
          q3_label: context.warningPreference,
          q4_action: context.actionPlanValue,
          q4_label: context.actionPlan,
          product_offering: context.product,
          last_conversation_id: chatConversationId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
    } catch (err) {
      console.error('Error storing user context:', err);
    }
  }

  /**
   * Loads user context from Supabase for returning users
   * Call this when user is identified (e.g., after OAuth)
   */
  async function loadUserContext(email) {
    if (!supabase || !email) return null;

    try {
      const { data, error } = await supabase
        .from('user_contexts')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) return null;

      // Restore responses from stored context
      if (data.q1_condition) {
        responses.q1 = { value: data.q1_condition, label: data.q1_label };
      }
      if (data.q2_painpoint) {
        responses.q2 = { value: data.q2_painpoint, label: data.q2_label };
      }
      if (data.q3_warning) {
        responses.q3 = { value: data.q3_warning, label: data.q3_label };
      }
      if (data.q4_action) {
        responses.q4 = { value: data.q4_action, label: data.q4_label };
      }
      if (data.product_offering) {
        currentProduct = data.product_offering;
      }

      return data;
    } catch (err) {
      console.error('Error loading user context:', err);
      return null;
    }
  }

  /**
   * Generates an LLM-powered personalized greeting with dynamic chips
   * Uses full Q1-Q4 context for better personalization
   */
  async function generateLLMGreeting() {
    const context = buildChatContext();

    // Fallback if no API key
    if (!OPENAI_API_KEY) {
      return getFallbackGreeting(context);
    }

    try {
      const systemPrompt = `You are a warm, empathetic health companion for Chronic Life, a symptom prediction app.

USER CONTEXT (from their signup):
- Main health concern: ${context.condition}
- Biggest challenge: ${context.painPoint}
- How much warning they need: ${context.warningPreference || 'not specified'}
- What they'd do with advance notice: ${context.actionPlan || 'not specified'}
- Product they're interested in: ${context.product}

YOUR TASK:
Generate a personalized welcome message and 3 quick-reply chips.

REQUIREMENTS:
1. Greeting should be 1-2 sentences MAX
2. Acknowledge their specific situation naturally (don't list everything)
3. Ask about how they're feeling RIGHT NOW
4. Be warm and human, not clinical or robotic
5. Chips should be contextual to their condition (e.g., for fatigue: energy-related options)

RESPOND IN THIS EXACT JSON FORMAT (no markdown, just JSON):
{"greeting": "Your personalized message here", "chips": ["Option 1", "Option 2", "Option 3"]}`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.8,
            max_tokens: 200,
          }),
        }
      );

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          greeting: parsed.greeting || getFallbackGreeting(context).greeting,
          chips: parsed.chips || getFallbackGreeting(context).chips,
        };
      } catch (parseErr) {
        console.error('Failed to parse LLM response:', parseErr);
        return getFallbackGreeting(context);
      }
    } catch (err) {
      console.error('LLM greeting generation failed:', err);
      return getFallbackGreeting(context);
    }
  }

  /**
   * Fallback greeting when LLM is unavailable
   */
  function getFallbackGreeting(context) {
    const q1Label = context.condition || 'your symptoms';
    const q2Label = context.painPoint || '';

    let greeting;
    if (q2Label) {
      greeting = `Great to have you here. Managing ${q1Label.toLowerCase()} is tough, especially when ${q2Label.toLowerCase()}. How are you feeling right now?`;
    } else {
      greeting = `Welcome! Since you mentioned dealing with ${q1Label.toLowerCase()}, let's get your first data point. What's your biggest symptom right now?`;
    }

    // Use static chips as fallback
    const q1Value = responses.q1?.value || 'other';
    const chips = CHAT_CHIPS_BY_Q1[q1Value] || CHAT_CHIPS_BY_Q1.other;

    return { greeting, chips };
  }

  /**
   * Sets up dynamic chips from LLM response
   */
  function setupDynamicChips(chips) {
    const container = document.getElementById('cmChatChips');

    // Ensure we have valid chips array
    const validChips =
      Array.isArray(chips) && chips.length > 0
        ? chips
        : CHAT_CHIPS_BY_Q1[responses.q1?.value] || CHAT_CHIPS_BY_Q1.other;

    container.innerHTML = validChips
      .map(
        (chip) =>
          `<button type="button" class="cm-chat-chip" data-chip="${chip}">${chip}</button>`
      )
      .join('');

    // Attach click handlers
    container.querySelectorAll('.cm-chat-chip').forEach((btn) => {
      btn.addEventListener('click', () => handleChipClick(btn.dataset.chip));
    });
  }

  /**
   * Legacy: Sets up the quick reply chips based on Q1 answer (fallback)
   * Kept for backwards compatibility but replaced by setupDynamicChips
   */
  function _setupChatChips() {
    const q1Value = responses.q1?.value || 'other';
    const chips = CHAT_CHIPS_BY_Q1[q1Value] || CHAT_CHIPS_BY_Q1.other;
    setupDynamicChips(chips);
  }

  /**
   * Attaches event listeners for chat input
   */
  function attachChatListeners() {
    const input = document.getElementById('cmChatInput');
    const sendBtn = document.getElementById('cmChatSend');
    const doneBtn = document.getElementById('cmChatDone');

    // Send on button click
    sendBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (text) {
        handleUserMessage(text, false);
        input.value = '';
      }
    });

    // Send on Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = input.value.trim();
        if (text) {
          handleUserMessage(text, false);
          input.value = '';
        }
      }
    });

    // Done button
    doneBtn.addEventListener('click', closeModal);
  }

  /**
   * Handles chip selection
   */
  function handleChipClick(chipText) {
    // Mark chip as selected briefly
    document.querySelectorAll('.cm-chat-chip').forEach((chip) => {
      chip.classList.remove('selected');
      if (chip.dataset.chip === chipText) {
        chip.classList.add('selected');
      }
    });

    handleUserMessage(chipText, true);
  }

  /**
   * Handles user message (from input or chip)
   */
  async function handleUserMessage(text, wasChip = false) {
    // Add user message to UI
    addMessageToUI('user', text);

    // Store in Supabase
    await saveChatMessage('user', text, wasChip ? text : null);

    // Increment message count
    chatMessageCount++;

    // Reddit Pixel: Track first chat message as custom event
    if (chatMessageCount === 1 && typeof rdt === 'function') {
      // eslint-disable-next-line no-undef
      rdt('track', 'Custom', { customEventName: 'FirstChatMessage' });
    }

    // Hide chips after first response
    document.getElementById('cmChatChips').style.display = 'none';

    // Show typing indicator
    showTypingIndicator();

    // Get LLM response
    const response = await generateChatResponse(text);

    // Remove typing indicator
    hideTypingIndicator();

    // Add assistant response
    await addAssistantMessage(response);

    // Show done button after 2+ exchanges
    if (chatMessageCount >= 2) {
      document.getElementById('cmChatDone').classList.remove('hidden');
    }

    // Update chips for next round (contextual)
    updateChipsForContext(text);
  }

  /**
   * Adds an assistant message to the chat
   */
  async function addAssistantMessage(text) {
    addMessageToUI('assistant', text);
    await saveChatMessage('assistant', text, null);
  }

  /**
   * Adds a message bubble to the UI
   */
  function addMessageToUI(role, text) {
    const container = document.getElementById('cmChatMessages');
    const bubble = document.createElement('div');
    bubble.className = `cm-chat-bubble ${role}`;
    bubble.textContent = text;
    container.appendChild(bubble);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Shows typing indicator
   */
  function showTypingIndicator() {
    const container = document.getElementById('cmChatMessages');
    const indicator = document.createElement('div');
    indicator.className = 'cm-chat-bubble assistant typing';
    indicator.id = 'cmTypingIndicator';
    indicator.innerHTML = `
      <span class="cm-typing-dot"></span>
      <span class="cm-typing-dot"></span>
      <span class="cm-typing-dot"></span>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Hides typing indicator
   */
  function hideTypingIndicator() {
    const indicator = document.getElementById('cmTypingIndicator');
    if (indicator) indicator.remove();
  }

  /**
   * Saves a chat message to Supabase
   */
  async function saveChatMessage(role, content, selectedChip) {
    if (!supabase || !chatConversationId) return;

    try {
      await supabase.from('chat_messages').insert({
        conversation_id: chatConversationId,
        role: role,
        content: content,
        selected_chip: selectedChip,
        was_chip_selection: !!selectedChip,
      });

      // Update conversation last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatConversationId);
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  }

  /**
   * Generates a chat response using OpenAI
   */
  async function generateChatResponse(userMessage) {
    if (!OPENAI_API_KEY) {
      return getFallbackResponse(userMessage);
    }

    try {
      // Build comprehensive context from Q1-Q4
      const context = buildChatContext();

      const systemPrompt = `You are a warm, empathetic health companion for Chronic Life, a symptom prediction app.

FULL USER CONTEXT (from their signup):
- Main health concern: ${context.condition}
- Biggest challenge: ${context.painPoint}
- Warning preference: ${context.warningPreference || 'not specified'}
- What they'd do with warning: ${context.actionPlan || 'not specified'}
- Product interest: ${context.product}
- Exchange # in this session: ${context.messageCount + 1}

CONVERSATION STRATEGY:
- Turn 1-2: Understand their current state (what's bothering them, severity, duration)
- Turn 3+: Offer to wrap up ("I've got what I need to start learning your patterns")

GUIDELINES:
- Be brief (1-2 sentences max)
- Be warm and human, not clinical
- Ask ONE follow-up question per turn
- Focus on how they're feeling RIGHT NOW
- Never give medical advice
- Use casual, supportive language
- Reference their specific condition/challenge when natural`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...chatMessages.slice(-6), // Last 6 messages for context
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 150,
          }),
        }
      );

      if (!response.ok) throw new Error('OpenAI API error');

      const data = await response.json();
      const assistantMessage =
        data.choices[0]?.message?.content || getFallbackResponse(userMessage);

      // Track in chat_messages with metadata
      chatMessages.push({ role: 'user', content: userMessage });
      chatMessages.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (err) {
      console.error('Chat generation error:', err);
      return getFallbackResponse(userMessage);
    }
  }

  /**
   * Fallback responses when LLM is unavailable
   */
  function getFallbackResponse(_userMessage) {
    const fallbacks = [
      'Thanks for sharing that. How long have you been feeling this way today?',
      'Got it. On a scale of 1-10, how much is this affecting your day?',
      'I hear you. Is this typical for you, or worse than usual?',
      "Thanks — that's helpful context. Anything else I should know?",
      "Perfect, I've captured that. You can close this whenever you're ready.",
    ];

    return fallbacks[Math.min(chatMessageCount, fallbacks.length - 1)];
  }

  /**
   * Updates chips based on conversation context
   */
  function updateChipsForContext(_lastMessage) {
    const container = document.getElementById('cmChatChips');

    // After first exchange, show severity/frequency chips
    if (chatMessageCount === 1) {
      const followUpChips = [
        'Just started',
        'Few hours',
        'All day',
        'Multiple days',
      ];
      container.innerHTML = followUpChips
        .map(
          (chip) =>
            `<button type="button" class="cm-chat-chip" data-chip="${chip}">${chip}</button>`
        )
        .join('');
      container.style.display = 'flex';

      container.querySelectorAll('.cm-chat-chip').forEach((btn) => {
        btn.addEventListener('click', () => handleChipClick(btn.dataset.chip));
      });
    } else if (chatMessageCount === 2) {
      // After second exchange, show severity chips
      const severityChips = ['Mild', 'Moderate', 'Severe'];
      container.innerHTML = severityChips
        .map(
          (chip) =>
            `<button type="button" class="cm-chat-chip" data-chip="${chip}">${chip}</button>`
        )
        .join('');
      container.style.display = 'flex';

      container.querySelectorAll('.cm-chat-chip').forEach((btn) => {
        btn.addEventListener('click', () => handleChipClick(btn.dataset.chip));
      });
    } else {
      // After 3+ exchanges, hide chips
      container.style.display = 'none';
    }
  }

  /**
   * Builds chat context from Q1-Q4 responses
   */
  /**
   * Builds comprehensive chat context from all Q1-Q4 responses
   * Used for LLM prompts and cross-session persistence
   */
  function buildChatContext() {
    return {
      // Q1: Main health concern
      condition: responses.q1?.label || 'chronic symptoms',
      conditionValue: responses.q1?.value || 'other',

      // Q2: Biggest challenge/pain point
      painPoint: responses.q2?.label || 'managing symptoms',
      painPointValue: responses.q2?.value || '',

      // Q3: Warning preference (how much advance notice they need)
      warningPreference: responses.q3?.label || '',
      warningPreferenceValue: responses.q3?.value || '',

      // Q4: Action plan (what they'd do with advance notice)
      actionPlan: responses.q4?.label || '',
      actionPlanValue: responses.q4?.value || '',

      // Product context
      product: currentProduct,

      // Session context
      conversationId: chatConversationId,
      messageCount: chatMessageCount,
      userEmail: chatUserEmail,
    };
  }

  // Legacy function name for backwards compatibility (exposed via window.CampaignModal)
  function _goToSuccess() {
    goToChat();
  }

  // ============================================
  // AI SUMMARY (LLM-Powered via Summary Agent)
  // ============================================

  // OpenAI API Key - Set via environment or config
  // For production: Use Supabase Edge Function to keep key server-side
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Must be set via environment variable or server-side

  /**
   * Generates personalized conversion summary using LLM
   * Falls back to template if LLM unavailable or fails
   */
  async function generateSummary() {
    const summaryContainer = document.getElementById('cmSummaryContent');
    let result;

    // Try LLM-powered summary if SummaryAgent is loaded and API key is set
    if (window.SummaryAgent && OPENAI_API_KEY && modalSessionId) {
      try {
        // Assemble complete user context
        const context = await window.SummaryAgent.assembleContext(
          supabase,
          modalSessionId
        );

        // Generate personalized summary via LLM
        result = await window.SummaryAgent.generateSummary(
          context,
          OPENAI_API_KEY
        );

        // Log AI generation with full context
        await logAIGeneration(result, context);
      } catch (err) {
        console.error('LLM summary failed, using fallback:', err);
        result = null;
      }
    }

    // Fallback to template-based summary
    if (!result) {
      const fallbackSummary = buildFallbackSummary();
      result = {
        summary: {
          title: fallbackSummary.headline,
          benefits: fallbackSummary.features,
          ctaText: 'Get started',
        },
        metadata: {
          modelUsed: 'template_v2',
          promptTemplateId: 'conversational_flow_v2',
          tokensUsed: 0,
          latencyMs: 0,
        },
      };
      await logAIGeneration(result, null);
    }

    // Render summary
    summaryContainer.innerHTML = `
      <div class="cm-summary-text">
        <p class="cm-summary-headline">${result.summary.title}</p>
        <ul class="cm-summary-features">
          ${result.summary.benefits
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
    // Auth options already shown by goToSummary()
  }

  /**
   * Fallback template-based summary when LLM is unavailable
   */
  function buildFallbackSummary() {
    const q1Label = responses.q1?.label || 'your condition';

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

  /**
   * Logs AI generation to Supabase with full context
   */
  async function logAIGeneration(result, context) {
    if (!supabase || !modalSessionId) return;

    try {
      await supabase.from('ai_generations').insert({
        modal_session_id: modalSessionId,
        session_id: sessionStorage.getItem('session_id'),
        context_json: context || {
          product: currentProduct,
          responses: responses,
          utm: Object.fromEntries(new URLSearchParams(window.location.search)),
        },
        generated_headline: result.summary.title,
        generated_features: result.summary.benefits,
        generated_cta: result.summary.ctaText || 'Get started',
        full_output_json: result,
        model_used: result.metadata.modelUsed,
        prompt_template_id: result.metadata.promptTemplateId,
        tokens_used: result.metadata.tokensUsed,
        latency_ms: result.metadata.latencyMs,
        was_shown: true,
        summary_variant:
          result.metadata.modelUsed === 'gpt-4o-mini'
            ? 'llm_v1'
            : 'template_v2',
      });
    } catch (err) {
      console.error('Error logging AI generation:', err);
    }
  }

  // ============================================
  // AUTH SUBMISSION (Email/Password)
  // ============================================
  // eslint-disable-next-line max-lines-per-function -- Complex form handling
  async function handleAuthSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('cmEmailInput');
    const passwordInput = document.getElementById('cmPasswordInput');
    const authError = document.getElementById('cmAuthError');
    const submitBtn = document.getElementById('cmSubmitBtn');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate email
    if (!isValidEmail(email)) {
      emailInput.classList.add('error');
      authError.textContent = 'Please enter a valid email address';
      authError.classList.remove('hidden');
      return;
    }

    // Validate password
    if (password.length < 6) {
      passwordInput.classList.add('error');
      authError.textContent = 'Password must be at least 6 characters';
      authError.classList.remove('hidden');
      return;
    }

    // Submit
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="material-symbols-outlined cm-spin">progress_activity</span> Creating account...';

    try {
      // Sign up with Supabase Auth
      const { data: _authData, error: signUpError } =
        await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              signup_source: 'campaign_modal',
              product_offering: currentProduct,
            },
          },
        });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          authError.textContent =
            'This email is already registered. Try signing in.';
        } else {
          authError.textContent =
            signUpError.message || 'Something went wrong. Please try again.';
        }
        authError.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          'Create account <span class="material-symbols-outlined">arrow_forward</span>';
        return;
      }

      // Also insert into beta_signups for marketing attribution
      const utm = new URLSearchParams(window.location.search);
      await supabase.from('beta_signups').insert({
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

      // Update AI generation as converted with CTA tracking
      if (modalSessionId) {
        await supabase
          .from('ai_generations')
          .update({
            converted: true,
            cta_clicked: 'email_create',
            cta_click_time: new Date().toISOString(),
          })
          .eq('modal_session_id', modalSessionId);
      }

      // Track event
      if (window.ChronicLifeTracking) {
        window.ChronicLifeTracking.trackEvent(
          'auth_signup_email',
          'campaign_modal_v2',
          email
        );
      }

      goToChat(email);
    } catch (err) {
      console.error('Auth error:', err);
      authError.textContent = 'Something went wrong. Please try again.';
      authError.classList.remove('hidden');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML =
      'Create account <span class="material-symbols-outlined">arrow_forward</span>';
  }

  // ============================================
  // GOOGLE SIGN IN
  // ============================================
  function storeUtmParamsForOAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      source:
        urlParams.get('utm_source') ||
        sessionStorage.getItem('utm_source') ||
        '',
      campaign:
        urlParams.get('utm_campaign') ||
        sessionStorage.getItem('utm_campaign') ||
        '',
      content:
        urlParams.get('utm_content') ||
        sessionStorage.getItem('utm_content') ||
        '',
    };
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) sessionStorage.setItem(`utm_${key}`, value);
    });
    if (modalSessionId)
      sessionStorage.setItem('modal_session_id', modalSessionId);
    sessionStorage.setItem('product_offering', currentProduct);

    // Store Q1-Q4 responses for chat personalization after OAuth redirect
    sessionStorage.setItem('pending_chat_responses', JSON.stringify(responses));

    // Store return URL (without existing query params)
    const returnUrl = window.location.origin + window.location.pathname;
    sessionStorage.setItem('pending_chat_return_url', returnUrl);

    // Flag to indicate we want to go to chat after OAuth
    sessionStorage.setItem('pending_chat_redirect', 'true');
  }

  async function handleGoogleSignIn() {
    const googleBtn = document.getElementById('cmGoogleBtn');
    googleBtn.disabled = true;
    googleBtn.innerHTML =
      '<span class="material-symbols-outlined cm-spin">progress_activity</span> Connecting...';

    // Reddit Pixel: Track SignUp tap immediately (before any async)
    if (typeof rdt === 'function') {
      // eslint-disable-next-line no-undef
      rdt('track', 'SignUp');
    }

    try {
      // Track CTA click on AI generation before redirect
      if (modalSessionId) {
        await supabase
          .from('ai_generations')
          .update({
            cta_clicked: 'google_signin',
            cta_click_time: new Date().toISOString(),
          })
          .eq('modal_session_id', modalSessionId);
      }

      if (window.ChronicLifeTracking) {
        window.ChronicLifeTracking.trackEvent(
          'auth_google_click',
          'campaign_modal_v2',
          'google_signin'
        );
      }

      storeUtmParamsForOAuth();

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth-callback.html',
        },
      });

      if (oauthError) {
        console.error('Google auth error:', oauthError);
        const authError = document.getElementById('cmAuthError');
        authError.textContent = 'Google sign in failed. Please try again.';
        authError.classList.remove('hidden');
      }
      // If successful, user will be redirected to Google
    } catch (err) {
      console.error('Google auth error:', err);
      const authError = document.getElementById('cmAuthError');
      authError.textContent = 'Something went wrong. Please try again.';
      authError.classList.remove('hidden');
    }

    googleBtn.disabled = false;
    googleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
      </svg>
      Continue with Google
    `;
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

        // Reddit Pixel: Track Lead event for CTA clicks
        if (typeof rdt === 'function') {
          // eslint-disable-next-line no-undef
          rdt('track', 'Lead');
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

    // Auth form (email/password)
    document
      .getElementById('cmAuthForm')
      ?.addEventListener('submit', handleAuthSubmit);

    // Google Sign In button
    document
      .getElementById('cmGoogleBtn')
      ?.addEventListener('click', handleGoogleSignIn);

    // Done button
    document.getElementById('cmDoneBtn')?.addEventListener('click', closeModal);

    // Email input reset
    document.getElementById('cmEmailInput')?.addEventListener('input', () => {
      document.getElementById('cmEmailInput').classList.remove('error');
      document.getElementById('cmAuthError').classList.add('hidden');
    });

    // Password input reset
    document
      .getElementById('cmPasswordInput')
      ?.addEventListener('input', () => {
        document.getElementById('cmPasswordInput').classList.remove('error');
        document.getElementById('cmAuthError').classList.add('hidden');
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

    // Reset auth form
    document.getElementById('cmAuthOptions').classList.add('hidden');
    document.getElementById('cmEmailInput').value = '';
    document.getElementById('cmPasswordInput').value = '';
    document.getElementById('cmEmailInput').classList.remove('error');
    document.getElementById('cmPasswordInput').classList.remove('error');
    document.getElementById('cmAuthError').classList.add('hidden');

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
