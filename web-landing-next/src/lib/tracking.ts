import type { UTMParams } from '@/types';

/**
 * Tracking Utilities - UTM capture, session management, GTM helpers
 *
 * Why this exists: Consolidates ~200 lines of tracking code that was
 * duplicated in every HTML file.
 */

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

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
 * Pushes event to GTM dataLayer
 */
export function pushToDataLayer(event: string, data: Record<string, unknown> = {}) {
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

// Type augmentation for dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    rdt?: (action: string, ...args: unknown[]) => void;
  }
}
