import type { PersonaKey, UTMParams } from '@/types';

/**
 * Tracking Utilities - UTM capture, session management, GTM/Reddit pixel helpers
 *
 * Why this exists: Consolidates ~200 lines of tracking code that was
 * duplicated in every HTML file. Now a single source of truth for all
 * tracking-related functions.
 */

const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

// ============================================
// UTM PARAMETER MANAGEMENT
// ============================================

/**
 * Captures UTM parameters from URL and stores in sessionStorage
 */
export function captureUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};

  UTM_PARAMS.forEach((param) => {
    const value = params.get(param);
    if (value) {
      utm[param] = value;
    }
  });

  // Store in sessionStorage (persists across navigation within same visit)
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('utm_data', JSON.stringify(utm));
  }

  return utm;
}

/**
 * Retrieves stored UTM parameters from sessionStorage
 */
export function getStoredUTM(): UTMParams {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem('utm_data');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Generates or retrieves session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('session_id');

  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('session_id', sessionId);
  }

  return sessionId;
}

/**
 * Gets stored visit ID (set after landing_visits insert)
 */
export function getVisitId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('visit_id');
}

/**
 * Stores visit ID after landing_visits insert
 */
export function setVisitId(id: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('visit_id', id);
}

// ============================================
// PERSONA MANAGEMENT
// ============================================

/**
 * Gets or assigns persona for A/B testing
 * - URL param override (?persona=maya)
 * - Stored session persona
 * - Default to 'maya'
 */
export function getPersona(): {
  persona: PersonaKey;
  source: 'url_param' | 'stored' | 'default';
} {
  if (typeof window === 'undefined') {
    return { persona: 'maya', source: 'default' };
  }

  const params = new URLSearchParams(window.location.search);
  const urlPersona = params.get('persona')?.toLowerCase();

  // URL override for testing
  if (urlPersona && ['maya', 'jordan', 'marcus'].includes(urlPersona)) {
    sessionStorage.setItem('assigned_persona', urlPersona);
    sessionStorage.setItem('persona_source', 'url_param');
    return { persona: urlPersona as PersonaKey, source: 'url_param' };
  }

  // Check stored persona
  const stored = sessionStorage.getItem(
    'assigned_persona'
  ) as PersonaKey | null;
  if (stored) {
    const source = sessionStorage.getItem('persona_source') as
      | 'url_param'
      | 'stored'
      | 'default';
    return { persona: stored, source: source || 'stored' };
  }

  // Default to maya (or enable random A/B by uncommenting below)
  // const personas: PersonaKey[] = ['maya', 'jordan', 'marcus'];
  // const assigned = personas[Math.floor(Math.random() * personas.length)];
  const assigned: PersonaKey = 'maya';
  sessionStorage.setItem('assigned_persona', assigned);
  sessionStorage.setItem('persona_source', 'default');
  return { persona: assigned, source: 'default' };
}

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Detects device type from user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent;

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Gets headline variant from URL param
 */
export function getHeadlineVariant(): string {
  if (typeof window === 'undefined') return 'default';

  const params = new URLSearchParams(window.location.search);
  return params.get('headline') || 'default';
}

// ============================================
// GTM DATA LAYER
// ============================================

/**
 * Pushes event to GTM dataLayer
 */
export function pushToDataLayer(
  event: string,
  data: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event,
    ...data,
    ...getStoredUTM(),
    landing_page: window.location.pathname,
  });
}

// ============================================
// REDDIT PIXEL
// ============================================

/**
 * Tracks Reddit conversion events
 * - 'PageView' - Auto-tracked on page load (in layout.tsx)
 * - 'Lead' - First meaningful engagement (e.g., chat start)
 * - 'SignUp' - Email signup completion
 */
export function trackRedditEvent(eventName: 'Lead' | 'SignUp' | 'ViewContent') {
  if (typeof window === 'undefined' || !window.rdt) return;

  try {
    window.rdt('track', eventName);
  } catch (error) {
    console.error('Reddit pixel error:', error);
  }
}

// Type augmentation for dataLayer and Reddit pixel
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    rdt?: (action: string, ...args: unknown[]) => void;
  }
}
