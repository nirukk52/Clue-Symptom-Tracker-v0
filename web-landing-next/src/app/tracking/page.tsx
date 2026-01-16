'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

/**
 * Campaign Tracking Dashboard
 *
 * Why this exists: Internal analytics dashboard for tracking Reddit ad
 * campaign performance. Password protected for internal use only.
 */

const DASHBOARD_PASSWORD = 'chroniclife2025';

// Types for our data
interface MarketingEvent {
  id: string;
  event_type: string;
  session_id: string;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_source: string | null;
  page_url: string | null;
  element_id: string | null;
  element_text: string | null;
  referrer: string | null;
  created_at: string;
}

interface BetaSignup {
  id: string;
  email: string;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_source: string | null;
  landing_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LandingVisit {
  id: string;
  product_offering: string;
  persona_shown: string;
  utm_campaign: string | null;
  created_at: string;
}

interface ModalSession {
  id: string;
  product_offering: string;
  persona_shown: string;
  completed: boolean;
  utm_campaign: string | null;
  created_at: string;
}

interface ModalResponse {
  id: string;
  question_key: string;
  answer_value: string;
  answer_label: string | null;
  product_offering: string | null;
  created_at: string;
}

// Extended types for user journey analytics
interface ExtendedLandingVisit {
  id: string;
  session_id: string;
  product_offering: string;
  headline_variant: string | null;
  persona_shown: string;
  persona_source: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  time_on_page_ms: number | null;
  scroll_depth_pct: number | null;
  cta_clicked: boolean | null;
  cta_element_id: string | null;
  created_at: string;
}

interface ExtendedModalSession {
  id: string;
  visit_id: string;
  product_offering: string;
  persona_shown: string;
  step_reached: number;
  total_steps: number;
  completed: boolean;
  abandoned_at_step: number | null;
  time_to_complete_ms: number | null;
  started_at: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface UserJourneyRow {
  session_id: string;
  product_offering: string;
  device_type: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  persona_shown: string;
  visit_time: string;
  step_reached: number;
  completed: boolean;
  abandoned_at_step: number | null;
  q1_answer: string | null;
  q2_answer: string | null;
  q3_answer: string | null;
  q4_answer: string | null;
  generated_headline: string | null;
  converted: boolean | null;
}

interface CohortMetrics {
  product_offering: string;
  device_type: string | null;
  total_visits: number;
  modal_opens: number;
  modal_open_rate: string;
  reached_q2: number;
  reached_q3: number;
  reached_q4: number;
  completed: number;
  completion_rate: string | null;
  avg_time_sec: number | null;
  avg_scroll_depth: number | null;
}

interface CampaignData {
  campaign: string;
  content: string;
  views: number;
  clicks: number;
  signups: number;
  nullReferrer: number;
  otherReferrer: number;
}

export default function TrackingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Data states
  const [allEvents, setAllEvents] = useState<MarketingEvent[]>([]);
  const [allSignups, setAllSignups] = useState<BetaSignup[]>([]);
  const [allLandingVisits, setAllLandingVisits] = useState<LandingVisit[]>([]);
  const [allModalSessions, setAllModalSessions] = useState<ModalSession[]>([]);
  const [allModalResponses, setAllModalResponses] = useState<ModalResponse[]>(
    []
  );

  // User Journey Analytics states
  const [userJourneyRows, setUserJourneyRows] = useState<UserJourneyRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Ad config cache for looking up ad headlines by utm_content
  const [adConfigCache, setAdConfigCache] = useState<Record<string, { headline: string; description: string; cta: string; target_subreddits?: string[] }>>({});

  // Filter state
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  // Modal states
  const [referrerModalData, setReferrerModalData] = useState<{
    campaign: string;
    content: string;
  } | null>(null);
  const [userJourneyEmail, setUserJourneyEmail] = useState<string | null>(null);

  // Check session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('dashboard_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, signupsRes, visitsRes, sessionsRes, responsesRes] =
        await Promise.all([
          supabase
            .from('marketing_events')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('beta_signups')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('landing_visits')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('modal_sessions')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('modal_responses')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

      setAllEvents((eventsRes.data as MarketingEvent[]) || []);
      setAllSignups((signupsRes.data as BetaSignup[]) || []);
      setAllLandingVisits((visitsRes.data as LandingVisit[]) || []);
      setAllModalSessions((sessionsRes.data as ModalSession[]) || []);
      setAllModalResponses((responsesRes.data as ModalResponse[]) || []);

      // Load ad configurations for lookup
      await loadAdConfigs();

      // Load User Journey Analytics data
      await loadUserJourneyAnalytics();

      setLastUpdated(
        new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load ad configurations from campaign_config table
  const loadAdConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_config')
        .select('config_key, config_data')
        .eq('config_type', 'ad');

      if (error) {
        console.error('Error loading ad configs:', error);
        return;
      }

      const cache: Record<string, { headline: string; description: string; cta: string; target_subreddits?: string[] }> = {};
      (data || []).forEach((item: { config_key: string; config_data: { headline?: string; description?: string; primary_cta?: string; cta?: string; target_subreddits?: string[] } }) => {
        const configData = item.config_data || {};
        cache[item.config_key] = {
          headline: configData.headline || '',
          description: configData.description || '',
          cta: configData.primary_cta || configData.cta || '',
          target_subreddits: configData.target_subreddits,
        };
      });
      setAdConfigCache(cache);
    } catch (err) {
      console.error('Error loading ad configs:', err);
    }
  };

  // Load detailed user journey data with SQL queries
  const loadUserJourneyAnalytics = async () => {
    try {
      // Query 1: Detailed User Journeys with Modal Responses
      const { data: journeyData, error: journeyError } = await supabase
        .rpc('get_user_journeys', {})
        .select('*');

      // If RPC doesn't exist, fall back to manual query
      if (journeyError) {
        // Fallback: Build journey data from existing tables
        const extendedVisits = await supabase
          .from('landing_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        const extendedSessions = await supabase
          .from('modal_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        const responses = await supabase
          .from('modal_responses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        // Build journey rows manually
        const journeyRows: UserJourneyRow[] = [];
        const visits = (extendedVisits.data as ExtendedLandingVisit[]) || [];
        const sessions =
          (extendedSessions.data as ExtendedModalSession[]) || [];
        const allResponses = (responses.data as ModalResponse[]) || [];

        for (const session of sessions) {
          const visit = visits.find((v) => v.id === session.visit_id);
          if (!visit) continue;

          const sessionResponses = allResponses.filter(
            (r) => r.id && session.id
          );

          // Find Q1-Q4 answers
          const q1 = sessionResponses.find((r) =>
            r.question_key?.includes('q1')
          );
          const q2 = sessionResponses.find((r) =>
            r.question_key?.includes('q2')
          );
          const q3 = sessionResponses.find((r) =>
            r.question_key?.includes('q3')
          );
          const q4 = sessionResponses.find((r) =>
            r.question_key?.includes('q4')
          );

          journeyRows.push({
            session_id: visit.session_id,
            product_offering: visit.product_offering,
            device_type: visit.device_type,
            utm_source: visit.utm_source,
            utm_campaign: visit.utm_campaign,
            utm_content: visit.utm_content,
            persona_shown: visit.persona_shown,
            visit_time: visit.created_at,
            step_reached: session.step_reached,
            completed: session.completed,
            abandoned_at_step: session.abandoned_at_step,
            q1_answer: q1?.answer_label || null,
            q2_answer: q2?.answer_label || null,
            q3_answer: q3?.answer_label || null,
            q4_answer: q4?.answer_label || null,
            generated_headline: null,
            converted: null,
          });
        }

        setUserJourneyRows(journeyRows);
      } else {
        setUserJourneyRows((journeyData as UserJourneyRow[]) || []);
      }

      // Query 2: Cohort Metrics - computed client-side from existing data
      // This will be computed in useMemo below
    } catch (err) {
      console.error('Error loading user journey analytics:', err);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem('dashboard_auth', 'true');
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Get unique campaigns for filter dropdown
  const campaigns = useMemo(() => {
    const campaignSet = new Set<string>();
    allEvents.forEach((e) => e.utm_campaign && campaignSet.add(e.utm_campaign));
    allSignups.forEach(
      (s) => s.utm_campaign && campaignSet.add(s.utm_campaign)
    );
    allLandingVisits.forEach(
      (v) => v.utm_campaign && campaignSet.add(v.utm_campaign)
    );
    return Array.from(campaignSet).sort();
  }, [allEvents, allSignups, allLandingVisits]);

  // Filter data based on selected campaign
  const filteredData = useMemo(() => {
    if (selectedCampaign === 'all') {
      return {
        events: allEvents,
        signups: allSignups,
        landingVisits: allLandingVisits,
        modalSessions: allModalSessions,
        modalResponses: allModalResponses,
      };
    }

    const isDirect = selectedCampaign === 'direct';
    const filterFn = (item: { utm_campaign?: string | null }) => {
      if (isDirect) return !item.utm_campaign || item.utm_campaign === '';
      return item.utm_campaign === selectedCampaign;
    };

    // Modal responses don't have utm_campaign, so we filter by product_offering instead
    const filterModalResponses = (_item: {
      product_offering?: string | null;
    }) => {
      // Modal responses are already linked to sessions, just include all
      return true;
    };

    return {
      events: allEvents.filter(filterFn),
      signups: allSignups.filter(filterFn),
      landingVisits: allLandingVisits.filter(filterFn),
      modalSessions: allModalSessions.filter(filterFn),
      modalResponses: allModalResponses.filter(filterModalResponses),
    };
  }, [
    selectedCampaign,
    allEvents,
    allSignups,
    allLandingVisits,
    allModalSessions,
    allModalResponses,
  ]);

  // Calculate metrics
  const pageViews = filteredData.events.filter(
    (e) => e.event_type === 'page_view'
  );
  const clicks = filteredData.events.filter(
    (e) => e.event_type === 'cta_click'
  );
  const convRate =
    clicks.length > 0
      ? ((filteredData.signups.length / clicks.length) * 100).toFixed(1) + '%'
      : '0%';

  // Calculate referrer counts
  const allReferrers = [
    ...filteredData.events.map((e) => e.referrer),
    ...filteredData.signups.map((s) => s.referrer),
  ];
  const nullReferrerCount = allReferrers.filter(
    (r) => !r || r === null || r === ''
  ).length;
  const otherReferrerCount = allReferrers.filter(
    (r) => r && r !== null && r !== ''
  ).length;

  // Campaign data for table
  const campaignData = useMemo(() => {
    const campaigns: Record<string, CampaignData> = {};

    pageViews.forEach((e) => {
      const key = `${e.utm_campaign || 'direct'}|${e.utm_content || 'none'}`;
      if (!campaigns[key]) {
        campaigns[key] = {
          campaign: e.utm_campaign || 'Direct',
          content: e.utm_content || '-',
          views: 0,
          clicks: 0,
          signups: 0,
          nullReferrer: 0,
          otherReferrer: 0,
        };
      }
      campaigns[key].views++;
      if (!e.referrer || e.referrer === null || e.referrer === '') {
        campaigns[key].nullReferrer++;
      } else {
        campaigns[key].otherReferrer++;
      }
    });

    clicks.forEach((e) => {
      const key = `${e.utm_campaign || 'direct'}|${e.utm_content || 'none'}`;
      if (!campaigns[key]) {
        campaigns[key] = {
          campaign: e.utm_campaign || 'Direct',
          content: e.utm_content || '-',
          views: 0,
          clicks: 0,
          signups: 0,
          nullReferrer: 0,
          otherReferrer: 0,
        };
      }
      campaigns[key].clicks++;
      if (!e.referrer || e.referrer === null || e.referrer === '') {
        campaigns[key].nullReferrer++;
      } else {
        campaigns[key].otherReferrer++;
      }
    });

    filteredData.signups.forEach((s) => {
      const key = `${s.utm_campaign || 'direct'}|${s.utm_content || 'none'}`;
      if (!campaigns[key]) {
        campaigns[key] = {
          campaign: s.utm_campaign || 'Direct',
          content: s.utm_content || '-',
          views: 0,
          clicks: 0,
          signups: 0,
          nullReferrer: 0,
          otherReferrer: 0,
        };
      }
      campaigns[key].signups++;
      if (!s.referrer || s.referrer === null || s.referrer === '') {
        campaigns[key].nullReferrer++;
      } else {
        campaigns[key].otherReferrer++;
      }
    });

    return Object.values(campaigns).sort((a, b) => b.signups - a.signups);
  }, [pageViews, clicks, filteredData.signups]);

  // Funnel calculations
  const viewSessions = new Set(pageViews.map((e) => e.session_id)).size;
  const clickSessions = new Set(clicks.map((e) => e.session_id)).size;
  const funnelClickRate =
    viewSessions > 0 ? ((clickSessions / viewSessions) * 100).toFixed(1) : '0';
  const funnelConvRate =
    clickSessions > 0
      ? ((filteredData.signups.length / clickSessions) * 100).toFixed(1)
      : '0';
  const overallConv =
    viewSessions > 0
      ? ((filteredData.signups.length / viewSessions) * 100).toFixed(2)
      : '0';

  // Helper functions
  const formatUTCDate = (isoString: string) => {
    const d = new Date(isoString);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')} UTC`;
  };

  // Format date/time for local display (more readable)
  const formatLocalDateTime = (isoString: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const remainingMins = diffMins % 60;
    const diffDays = Math.floor(diffMs / 86400000);

    // Show relative time for recent sessions
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      // Show hours and minutes for same-day sessions
      return remainingMins > 0 ? `${diffHours}h ${remainingMins}m ago` : `${diffHours}h ago`;
    }
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older sessions, show full date/time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${month} ${day}, ${displayHours}:${minutes} ${ampm}`;
  };

  // Format full date/time with timezone
  const formatFullDateTime = (isoString: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${month} ${day}, ${year} ${displayHours}:${minutes}:${seconds} ${ampm} (${timezone})`;
  };

  const extractPageName = (url: string | null) => {
    if (!url) return 'Unknown';
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const pageMap: Record<string, string> = {
        '/': 'Homepage',
        '/index.html': 'Homepage',
        '/spoon-saver': 'Spoon Saver',
        '/flare-forecast': 'Flare Forecast',
        '/top-suspect': 'Top Suspect',
        '/crash-prevention': 'Crash Prevention',
      };
      return pageMap[pathname] || pathname.replace(/\//g, '') || 'Homepage';
    } catch {
      return 'Unknown';
    }
  };

  const getMetricClass = (
    value: number,
    goodThreshold: number,
    okayThreshold: number
  ) => {
    if (value >= goodThreshold) return 'text-emerald-500';
    if (value >= okayThreshold) return 'text-amber-500';
    return 'text-red-500';
  };

  // Prediction Depth Test metrics
  const getPredictionMetrics = useCallback(
    (product: string) => {
      const productVisits = filteredData.landingVisits.filter(
        (v) => v.product_offering === product
      );
      const productSessions = filteredData.modalSessions.filter(
        (s) => s.product_offering === product
      );
      const productCompletes = productSessions.filter((s) => s.completed);
      const productSignups = filteredData.signups.filter((s) => {
        const utmContent = s.utm_content || '';
        return utmContent.includes(
          product.replace('-', '_').replace('flare-forecast', 'forecast')
        );
      });

      return {
        visits: productVisits.length,
        modals: productSessions.length,
        completes: productCompletes.length,
        signups: productSignups.length,
      };
    },
    [filteredData]
  );

  // Question distribution
  const getQuestionDistribution = useCallback(
    (questionKey: string) => {
      const responses = filteredData.modalResponses.filter(
        (r) => r.question_key === questionKey
      );
      if (responses.length === 0) return [];

      const counts: Record<string, number> = {};
      responses.forEach((r) => {
        const label = r.answer_label || r.answer_value;
        counts[label] = (counts[label] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({
          label,
          count,
          percentage: ((count / responses.length) * 100).toFixed(0),
        }));
    },
    [filteredData.modalResponses]
  );

  // Persona conversion rates
  const getPersonaRate = useCallback(
    (persona: string) => {
      const personaSessions = filteredData.modalSessions.filter(
        (s) => s.persona_shown === persona
      );
      const personaCompletes = personaSessions.filter((s) => s.completed);
      return personaSessions.length > 0
        ? ((personaCompletes.length / personaSessions.length) * 100).toFixed(
            1
          ) + '%'
        : '-';
    },
    [filteredData.modalSessions]
  );

  // Computed Cohort Metrics for User Journey Analytics
  const computedCohortMetrics = useMemo(() => {
    const metrics: Record<string, CohortMetrics> = {};

    // Group visits by product + device
    filteredData.landingVisits.forEach((visit) => {
      const key = `${visit.product_offering}|${(visit as unknown as ExtendedLandingVisit).device_type || 'unknown'}`;
      if (!metrics[key]) {
        metrics[key] = {
          product_offering: visit.product_offering,
          device_type:
            (visit as unknown as ExtendedLandingVisit).device_type || null,
          total_visits: 0,
          modal_opens: 0,
          modal_open_rate: '0',
          reached_q2: 0,
          reached_q3: 0,
          reached_q4: 0,
          completed: 0,
          completion_rate: null,
          avg_time_sec: null,
          avg_scroll_depth: null,
        };
      }
      metrics[key].total_visits++;
    });

    // Add modal session data
    filteredData.modalSessions.forEach((session) => {
      const matchingVisit = filteredData.landingVisits.find(
        (v) => v.id === (session as unknown as ExtendedModalSession).visit_id
      );
      const deviceType = matchingVisit
        ? (matchingVisit as unknown as ExtendedLandingVisit).device_type
        : 'unknown';
      const key = `${session.product_offering}|${deviceType || 'unknown'}`;

      if (!metrics[key]) return; // Skip if no matching metric entry

      metrics[key].modal_opens++;
      const stepReached =
        (session as unknown as ExtendedModalSession).step_reached || 0;
      if (stepReached >= 2) metrics[key].reached_q2++;
      if (stepReached >= 3) metrics[key].reached_q3++;
      if (stepReached >= 4) metrics[key].reached_q4++;
      if (session.completed) metrics[key].completed++;
    });

    // Calculate rates
    Object.values(metrics).forEach((m) => {
      m.modal_open_rate =
        m.total_visits > 0
          ? ((m.modal_opens / m.total_visits) * 100).toFixed(1)
          : '0';
      m.completion_rate =
        m.modal_opens > 0
          ? ((m.completed / m.modal_opens) * 100).toFixed(1)
          : null;
    });

    return Object.values(metrics)
      .filter((m) => m.total_visits >= 5)
      .sort((a, b) => b.total_visits - a.total_visits);
  }, [filteredData.landingVisits, filteredData.modalSessions]);

  // Get detailed journey for a specific session
  const getSessionJourney = useCallback(
    (sessionId: string) => {
      return userJourneyRows.filter((r) => r.session_id === sessionId);
    },
    [userJourneyRows]
  );

  // Unique sessions with journeys
  const uniqueSessionJourneys = useMemo(() => {
    const sessions = new Map<string, UserJourneyRow>();
    userJourneyRows.forEach((row) => {
      const existing = sessions.get(row.session_id);
      if (!existing || row.step_reached > existing.step_reached) {
        sessions.set(row.session_id, row);
      }
    });
    return Array.from(sessions.values()).slice(0, 50);
  }, [userJourneyRows]);

  // Device type breakdown for user journeys
  const deviceTypeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    uniqueSessionJourneys.forEach((journey) => {
      const device = journey.device_type || 'unknown';
      breakdown[device] = (breakdown[device] || 0) + 1;
    });
    return breakdown;
  }, [uniqueSessionJourneys]);

  // CTA clicks breakdown - combines marketing_events and landing_visits data
  const ctaClicksData = useMemo(() => {
    const authGoogleClicks = filteredData.events.filter(
      (e) => e.event_type === 'auth_google_click'
    );
    const authEmailSignups = filteredData.events.filter(
      (e) => e.event_type === 'auth_signup_email'
    );

    // Also get CTA clicks from landing_visits table (use extended type for cta fields)
    const landingVisitClicks = (filteredData.landingVisits as unknown as ExtendedLandingVisit[])
      .filter((v) => v.cta_clicked)
      .map((v) => ({
        page_url: `/${v.product_offering || ''}`,
        element_id: v.cta_element_id || 'modal_trigger',
        element_text: 'CTA Click (Modal Open)',
        event_type: 'landing_cta_click',
      }));

    const allClicks = [...clicks, ...authGoogleClicks, ...authEmailSignups, ...landingVisitClicks];
    const totalClicks = allClicks.length;

    if (totalClicks === 0) return [];

    const ctaGroups: Record<
      string,
      { page: string; elementId: string; elementText: string; clicks: number }
    > = {};

    allClicks.forEach((click) => {
      const pageName = extractPageName(click.page_url);
      let elementId = click.element_id || 'unknown';
      let elementText =
        (click.element_text || '')
          .replace(/arrow_\w*/gi, '')
          .replace(/\s+/g, ' ')
          .trim() || 'Unknown Button';

      if (click.event_type === 'auth_google_click') {
        elementId = 'google_signin';
        elementText = 'Continue with Google';
      } else if (click.event_type === 'auth_signup_email') {
        elementId = 'email_signup';
        elementText = 'Create Account (Email)';
      } else if (click.event_type === 'landing_cta_click') {
        // Keep the element_id from landing_visits (e.g., hero_quick_checkin)
        elementText = elementId === 'modal_trigger' ? 'Modal Open (CTA)' : `${elementId} (CTA)`;
      }

      const key = `${pageName}|${elementId}|${elementText}`;
      if (!ctaGroups[key]) {
        ctaGroups[key] = { page: pageName, elementId, elementText, clicks: 0 };
      }
      ctaGroups[key].clicks++;
    });

    return Object.values(ctaGroups)
      .sort((a, b) => b.clicks - a.clicks)
      .map((g) => ({
        ...g,
        percentage: ((g.clicks / totalClicks) * 100).toFixed(1),
      }));
  }, [clicks, filteredData.events, filteredData.landingVisits]);

  // Referrer breakdown for modal
  const referrerBreakdown = useMemo(() => {
    if (!referrerModalData) return [];

    const campaignEvents = allEvents.filter((e) => {
      const eCampaign = e.utm_campaign || 'Direct';
      const eContent = e.utm_content || '-';
      return (
        eCampaign === referrerModalData.campaign &&
        eContent === referrerModalData.content
      );
    });

    const campaignSignups = allSignups.filter((s) => {
      const sCampaign = s.utm_campaign || 'Direct';
      const sContent = s.utm_content || '-';
      return (
        sCampaign === referrerModalData.campaign &&
        sContent === referrerModalData.content
      );
    });

    const allReferrers = [
      ...campaignEvents.map((e) => e.referrer),
      ...campaignSignups.map((s) => s.referrer),
    ];

    const referrerCounts: Record<string, number> = {};
    allReferrers.forEach((ref) => {
      const key = ref || 'null';
      referrerCounts[key] = (referrerCounts[key] || 0) + 1;
    });

    return Object.entries(referrerCounts)
      .map(([ref, count]) => ({ referrer: ref === 'null' ? null : ref, count }))
      .sort((a, b) => b.count - a.count);
  }, [referrerModalData, allEvents, allSignups]);

  // User journey data
  const userJourneyData = useMemo(() => {
    if (!userJourneyEmail) return null;

    const signup = allSignups.find((s) => s.email === userJourneyEmail);
    if (!signup) return null;

    const signupEvent = allEvents.find(
      (e) =>
        e.event_type === 'signup_complete' &&
        e.element_text?.includes(userJourneyEmail.split('@')[0])
    );

    if (!signupEvent) {
      return { signup, events: [] };
    }

    const sessionEvents = allEvents
      .filter((e) => e.session_id === signupEvent.session_id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    return { signup, events: sessionEvents };
  }, [userJourneyEmail, allSignups, allEvents]);

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600)
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#20132e]/95 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#d0bdf4]/20">
              <span className="material-symbols-outlined text-2xl text-[#20132e]">
                lock
              </span>
            </div>
            <h1 className="font-display mb-2 text-2xl font-semibold text-[#20132e]">
              Campaign Dashboard
            </h1>
            <p className="text-sm text-[#554b66]">
              Enter password to view tracking data
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-full border-2 px-4 py-3 ${passwordError ? 'border-[#e8974f]' : 'border-[#20132e]/10'} mb-4 focus:border-[#d0bdf4] focus:outline-none`}
              placeholder="Password"
              autoFocus
            />
            {passwordError && (
              <p className="mb-4 text-sm text-[#e8974f]">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-[#20132e] py-3 font-bold text-white transition-colors hover:bg-[#20132e]/90"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#20132e] antialiased">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display mb-2 text-3xl font-semibold text-[#20132e]">
              Campaign Tracking
            </h1>
            <p className="text-[#554b66]">
              Reddit ad performance for Chronic Life
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Campaign Filter */}
            <div className="relative">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="min-w-[200px] cursor-pointer appearance-none rounded-full border border-[#20132e]/10 bg-white px-4 py-2 pr-10 text-sm font-medium text-[#20132e] focus:border-[#d0bdf4] focus:outline-none"
              >
                <option value="all">All Campaigns</option>
                <option value="direct">Direct (No Campaign)</option>
                {campaigns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-[#554b66]">
                expand_more
              </span>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full border border-[#20132e]/10 bg-white px-4 py-2 transition-colors hover:bg-[#f3f0fa]"
            >
              <span
                className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}
              >
                refresh
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Active Filter Badge */}
        {selectedCampaign !== 'all' && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d0bdf4]/20 bg-[#d0bdf4]/10 px-4 py-2">
              <span className="material-symbols-outlined text-lg text-[#d0bdf4]">
                filter_alt
              </span>
              <span className="text-sm font-medium text-[#20132e]">
                Filtering by:{' '}
                <span className="text-[#d0bdf4]">
                  {selectedCampaign === 'direct'
                    ? 'Direct (No Campaign)'
                    : selectedCampaign}
                </span>
              </span>
              <button
                onClick={() => setSelectedCampaign('all')}
                className="ml-2 rounded-full p-1 transition-colors hover:bg-[#d0bdf4]/20"
              >
                <span className="material-symbols-outlined text-sm text-[#554b66]">
                  close
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Experiment Results Section */}
        <div className="mb-8 rounded-3xl border border-[#d0bdf4]/20 bg-gradient-to-br from-[#d0bdf4]/10 to-[#b8e3d6]/10 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#d0bdf4]/20">
              <span className="material-symbols-outlined text-2xl text-[#20132e]">
                science
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#20132e]">
                Experiment Results
              </h2>
              <p className="text-sm text-[#554b66]">
                The Clarity Experiment — $100 budget, 10 days
              </p>
            </div>
          </div>

          {/* Winner Banner */}
          <div className="mb-6 rounded-2xl border border-[#b8e3d6]/50 bg-[#b8e3d6]/30 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-teal-700">
                emoji_events
              </span>
              <span className="text-sm font-bold uppercase tracking-wide text-teal-800">
                Winner: Pattern Discovery
              </span>
            </div>
            <p className="font-display mb-2 text-xl font-semibold text-[#20132e]">
              Users want to{' '}
              <span className="text-teal-700">
                predict flares and find triggers
              </span>{' '}
              — not just track symptoms.
            </p>
            <p className="text-sm text-[#554b66]">
              &ldquo;Predict Flares&rdquo; dominated with 59 clicks at $0.05
              CPC. The &ldquo;prediction&rdquo; angle resonates 4.5x better than
              energy-saving or doctor-proof messaging.
            </p>
          </div>

          {/* Campaign Results Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Pattern Discovery - WINNER */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#b8e3d6] bg-white p-5 shadow-sm">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-[#b8e3d6] px-3 py-1 text-xs font-bold text-teal-900">
                🏆 WINNER
              </div>
              <div className="mb-3 mt-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b8e3d6]">
                  visibility
                </span>
                <span className="font-semibold text-[#20132e]">
                  Pattern Discovery
                </span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-teal-700">
                    72
                  </p>
                  <p className="text-xs text-[#554b66]">Clicks</p>
                </div>
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-teal-700">
                    $0.05
                  </p>
                  <p className="text-xs text-[#554b66]">CPC</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#554b66]">predict_flares</span>
                  <span className="font-semibold text-[#b8e3d6]">
                    59 clicks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#554b66]">find_triggers</span>
                  <span className="font-semibold text-[#20132e]">
                    13 clicks
                  </span>
                </div>
              </div>
            </div>

            {/* Exhaustion & Brain Fog */}
            <div className="rounded-2xl border border-[#20132e]/10 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e8974f]">
                  battery_low
                </span>
                <span className="font-semibold text-[#20132e]">
                  Exhaustion & Brain Fog
                </span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-[#554b66]">
                    8
                  </p>
                  <p className="text-xs text-[#554b66]">Clicks</p>
                </div>
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-[#554b66]">
                    $0.12
                  </p>
                  <p className="text-xs text-[#554b66]">CPC</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#554b66]">spoon_saver</span>
                  <span className="text-[#554b66]">5 clicks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#554b66]">foggy_minds</span>
                  <span className="text-[#554b66]">3 clicks</span>
                </div>
              </div>
            </div>

            {/* Doctor Mistrust */}
            <div className="rounded-2xl border border-[#20132e]/10 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f4c4c4]">
                  medical_information
                </span>
                <span className="font-semibold text-[#20132e]">
                  Doctor Mistrust
                </span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-[#554b66]">
                    11
                  </p>
                  <p className="text-xs text-[#554b66]">Clicks</p>
                </div>
                <div className="rounded-xl bg-[#fdfbf9] p-3 text-center">
                  <p className="font-display text-2xl font-bold text-[#554b66]">
                    $0.09
                  </p>
                  <p className="text-xs text-[#554b66]">CPC</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#554b66]">doctor_proof</span>
                  <span className="text-[#554b66]">7 clicks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#554b66]">appointment_prep</span>
                  <span className="text-[#554b66]">4 clicks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6 rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#20132e]">
              <span className="material-symbols-outlined text-lg">
                lightbulb
              </span>
              Key Takeaways
            </h3>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="flex gap-3">
                <span className="material-symbols-outlined mt-0.5 text-lg text-[#b8e3d6]">
                  check_circle
                </span>
                <div>
                  <p className="font-medium text-[#20132e]">
                    Product Direction: Prediction Engine
                  </p>
                  <p className="text-[#554b66]">
                    Build flare forecasting and trigger detection as core
                    features.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined mt-0.5 text-lg text-[#b8e3d6]">
                  check_circle
                </span>
                <div>
                  <p className="font-medium text-[#20132e]">
                    Messaging: &ldquo;Know Before It Hits&rdquo;
                  </p>
                  <p className="text-[#554b66]">
                    Lead with prediction/foresight, not energy savings.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined mt-0.5 text-lg text-[#e8974f]">
                  cancel
                </span>
                <div>
                  <p className="font-medium text-[#20132e]">
                    Deprioritize: &ldquo;Save Spoons&rdquo; Angle
                  </p>
                  <p className="text-[#554b66]">
                    Energy-saving messaging underperformed significantly.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined mt-0.5 text-lg text-[#a4c8d8]">
                  arrow_forward
                </span>
                <div>
                  <p className="font-medium text-[#20132e]">
                    Next Test: Prediction Depth
                  </p>
                  <p className="text-[#554b66]">
                    Testing: Flare Forecast vs Top Suspect vs Crash Prevention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Depth Test v2 Section */}
        <div className="mb-8 rounded-3xl border border-[#a4c8d8]/20 bg-gradient-to-br from-[#a4c8d8]/10 to-[#d0bdf4]/10 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#a4c8d8]/20">
              <span className="material-symbols-outlined text-2xl text-[#20132e]">
                labs
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#20132e]">
                Prediction Depth Test v2
              </h2>
              <p className="text-sm text-[#554b66]">
                Testing: Time vs Variable vs Action — Live Campaign
              </p>
            </div>
          </div>

          {/* Product Offering Performance Grid */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            {[
              {
                name: 'Flare Forecast',
                product: 'flare-forecast',
                icon: 'cloud',
                color: 'purple',
              },
              {
                name: 'Top Suspect',
                product: 'top-suspect',
                icon: 'search',
                color: 'peach',
              },
              {
                name: 'Crash Prevention',
                product: 'crash-prevention',
                icon: 'battery_horiz_075',
                color: 'mint',
              },
              {
                name: 'Spoon Saver',
                product: 'spoon-saver',
                icon: 'bolt',
                color: 'blue',
              },
            ].map((item) => {
              const metrics = getPredictionMetrics(item.product);
              const colorClass =
                item.color === 'purple'
                  ? 'border-[#d0bdf4]/20'
                  : item.color === 'peach'
                    ? 'border-[#e8974f]/20'
                    : item.color === 'mint'
                      ? 'border-[#b8e3d6]/30'
                      : 'border-[#a4c8d8]/20';
              const iconColor =
                item.color === 'purple'
                  ? 'text-[#d0bdf4]'
                  : item.color === 'peach'
                    ? 'text-[#e8974f]'
                    : item.color === 'mint'
                      ? 'text-teal-600'
                      : 'text-[#a4c8d8]';

              return (
                <div
                  key={item.product}
                  className={`rounded-2xl border bg-white p-5 ${colorClass} transition-shadow hover:shadow-lg`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`material-symbols-outlined ${iconColor}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-semibold text-[#20132e]">
                      {item.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#554b66]">Visits</span>
                      <span className="font-semibold text-[#20132e]">
                        {metrics.visits}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#554b66]">Modal Opens</span>
                      <span className="font-semibold text-[#20132e]">
                        {metrics.modals}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#554b66]">Completes</span>
                      <span className="font-semibold text-[#b8e3d6]">
                        {metrics.completes}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#554b66]">Signups</span>
                      <span className="font-semibold text-teal-700">
                        {metrics.signups}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Question Responses */}
          <div className="rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#20132e]">
              <span className="material-symbols-outlined text-lg">ballot</span>
              Modal Response Distribution
            </h3>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { key: 'q1_entry', label: 'Q1: What brings you here?' },
                { key: 'q2_pain_point', label: 'Q2: Hardest part?' },
                { key: 'q3_product_specific', label: 'Q3: Product Question' },
                { key: 'q4_product_specific', label: 'Q4: Outcome Desired' },
              ].map((q) => {
                const distribution = getQuestionDistribution(q.key);
                const colors = [
                  'bg-[#d0bdf4]',
                  'bg-[#e8974f]',
                  'bg-[#b8e3d6]',
                  'bg-[#a4c8d8]',
                  'bg-[#f4c4c4]',
                ];

                return (
                  <div key={q.key}>
                    <p className="mb-3 text-sm font-semibold text-[#554b66]">
                      {q.label}
                    </p>
                    <div className="space-y-2">
                      {distribution.length === 0 ? (
                        <p className="text-xs text-[#554b66]">
                          No responses yet
                        </p>
                      ) : (
                        distribution.map((item, i) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-2"
                          >
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-[#fdfbf9]">
                              <div
                                className={`${colors[i % colors.length]}/60 h-full rounded-full`}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className="flex-1 truncate text-xs text-[#554b66]">
                              {item.label}
                            </span>
                            <span className="text-xs font-semibold text-[#20132e]">
                              {item.count}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Persona Performance */}
          <div className="mt-6 rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#20132e]">
              <span className="material-symbols-outlined text-lg">group</span>
              Persona A/B Test Results
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: 'Maya', color: 'text-[#d0bdf4]' },
                { name: 'Jordan', color: 'text-[#e8974f]' },
                { name: 'Marcus', color: 'text-[#b8e3d6]' },
              ].map((persona) => (
                <div
                  key={persona.name}
                  className="rounded-xl bg-[#fdfbf9] p-4 text-center"
                >
                  <p className="font-semibold text-[#20132e]">{persona.name}</p>
                  <p
                    className={`font-display text-2xl font-bold ${persona.color} mt-1`}
                  >
                    {getPersonaRate(persona.name.toLowerCase())}
                  </p>
                  <p className="text-xs text-[#554b66]">conversion rate</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Journey Analytics Section */}
        <div className="mb-8 rounded-3xl border border-[#e8974f]/20 bg-gradient-to-br from-[#e8974f]/5 to-[#d0bdf4]/5 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e8974f]/20">
              <span className="material-symbols-outlined text-2xl text-[#20132e]">
                route
              </span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#20132e]">
                User Journey Analytics
              </h2>
              <p className="text-sm text-[#554b66]">
                Individual journeys + cohort comparison
              </p>
            </div>
          </div>

          {/* Cohort Comparison Table */}
          <div className="mb-6 rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#20132e]">
              <span className="material-symbols-outlined text-lg">
                analytics
              </span>
              Cohort Funnel Comparison
              <span className="ml-2 rounded-full bg-[#d0bdf4]/20 px-2 py-0.5 text-xs font-normal text-[#554b66]">
                Groups with 5+ visits
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#20132e]/10">
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Product
                    </th>
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Device
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Visits
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Modal Opens
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Open Rate
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Q2
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Q3
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Q4
                    </th>
                    <th className="py-2 text-right font-semibold text-[#20132e]">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {computedCohortMetrics.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-8 text-center text-[#554b66]"
                      >
                        No cohort data available yet
                      </td>
                    </tr>
                  ) : (
                    computedCohortMetrics.map((m, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#20132e]/5 hover:bg-[#fdfbf9]"
                      >
                        <td className="py-2 font-medium text-[#20132e]">
                          {m.product_offering}
                        </td>
                        <td className="py-2 text-[#554b66]">
                          {m.device_type || '-'}
                        </td>
                        <td className="py-2 text-right font-semibold text-[#20132e]">
                          {m.total_visits}
                        </td>
                        <td className="py-2 text-right text-[#e8974f]">
                          {m.modal_opens}
                        </td>
                        <td
                          className={`py-2 text-right font-semibold ${getMetricClass(parseFloat(m.modal_open_rate), 40, 20)}`}
                        >
                          {m.modal_open_rate}%
                        </td>
                        <td className="py-2 text-right text-[#554b66]">
                          {m.reached_q2}
                        </td>
                        <td className="py-2 text-right text-[#554b66]">
                          {m.reached_q3}
                        </td>
                        <td className="py-2 text-right text-[#554b66]">
                          {m.reached_q4}
                        </td>
                        <td className="py-2 text-right font-semibold text-[#b8e3d6]">
                          {m.completed}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual User Journeys */}
          <div className="rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-[#20132e]">
                <span className="material-symbols-outlined text-lg">person</span>
                Individual User Journeys
                <span className="ml-2 rounded-full bg-[#e8974f]/20 px-2 py-0.5 text-xs font-normal text-[#554b66]">
                  Recent sessions with modal engagement
                </span>
              </h3>
              {/* Device Type Breakdown */}
              {Object.keys(deviceTypeBreakdown).length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#554b66]">Device breakdown:</span>
                  {Object.entries(deviceTypeBreakdown).map(([device, count]) => (
                    <span
                      key={device}
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        device === 'mobile'
                          ? 'bg-blue-100 text-blue-700'
                          : device === 'desktop'
                            ? 'bg-purple-100 text-purple-700'
                            : device === 'tablet'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {device}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#20132e]/10">
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Time
                    </th>
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Campaign / Ad
                    </th>
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Device
                    </th>
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Q1 Answer
                    </th>
                    <th className="py-2 text-left font-semibold text-[#20132e]">
                      Q2 Answer
                    </th>
                    <th className="py-2 text-center font-semibold text-[#20132e]">
                      Step
                    </th>
                    <th className="py-2 text-center font-semibold text-[#20132e]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueSessionJourneys.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-[#554b66]"
                      >
                        No user journey data available yet
                      </td>
                    </tr>
                  ) : (
                    uniqueSessionJourneys.map((journey, i) => (
                      <tr
                        key={i}
                        className="cursor-pointer border-b border-[#20132e]/5 hover:bg-[#fdfbf9]"
                        onClick={() =>
                          setSelectedSession(
                            selectedSession === journey.session_id
                              ? null
                              : journey.session_id
                          )
                        }
                      >
                        <td className="py-2 text-xs text-[#554b66]" title={formatFullDateTime(journey.visit_time)}>
                          <div className="font-medium text-[#20132e]">
                            {formatLocalDateTime(journey.visit_time)}
                          </div>
                        </td>
                        <td className="py-2">
                          <div className="flex flex-col gap-0.5">
                            {journey.utm_campaign ? (
                              <>
                                <span className="inline-flex max-w-40 items-center truncate rounded bg-[#d0bdf4]/20 px-1.5 py-0.5 text-xs font-medium text-[#20132e]" title={journey.utm_campaign}>
                                  {journey.utm_campaign}
                                </span>
                                {journey.utm_content && (
                                  <span className="max-w-40 truncate text-[10px] text-[#554b66]" title={journey.utm_content}>
                                    ad: {journey.utm_content}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-[#554b66]">Direct</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-[#554b66]">
                          {journey.device_type || '-'}
                        </td>
                        <td className="max-w-32 truncate py-2 text-xs text-[#554b66]">
                          {journey.q1_answer || '-'}
                        </td>
                        <td className="max-w-32 truncate py-2 text-xs text-[#554b66]">
                          {journey.q2_answer || '-'}
                        </td>
                        <td className="py-2 text-center">
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#d0bdf4]/20 text-xs font-semibold text-[#20132e]">
                            {journey.step_reached}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          {journey.completed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#b8e3d6]/20 px-2 py-0.5 text-xs font-semibold text-teal-700">
                              <span className="material-symbols-outlined text-sm">
                                check
                              </span>
                              Done
                            </span>
                          ) : journey.abandoned_at_step ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8974f]/20 px-2 py-0.5 text-xs font-semibold text-[#e8974f]">
                              <span className="material-symbols-outlined text-sm">
                                close
                              </span>
                              Q{journey.abandoned_at_step}
                            </span>
                          ) : (
                            <span className="text-xs text-[#554b66]">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Session Detail */}
            {selectedSession && (() => {
              const sessionData = uniqueSessionJourneys.find(j => j.session_id === selectedSession);
              const adConfig = sessionData?.utm_content ? adConfigCache[sessionData.utm_content] : null;
              return (
              <div className="mt-4 rounded-xl border border-[#d0bdf4]/30 bg-[#d0bdf4]/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-semibold text-[#20132e]">
                    <span className="material-symbols-outlined text-lg">
                      timeline
                    </span>
                    Session Detail: {selectedSession.slice(-12)}
                  </h4>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="rounded-full p-1 hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-sm text-[#554b66]">
                      close
                    </span>
                  </button>
                </div>

                {/* Full Ad Details (if available) */}
                {adConfig && (
                  <div className="mb-4 rounded-lg border border-[#e8974f]/30 bg-[#e8974f]/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-[#e8974f]">campaign</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#e8974f]">Ad That Brought This User</span>
                    </div>
                    <p className="text-base font-semibold text-[#20132e]">&ldquo;{adConfig.headline}&rdquo;</p>
                    {adConfig.description && (
                      <p className="mt-1 text-sm text-[#554b66]">{adConfig.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {adConfig.cta && (
                        <span className="rounded-full bg-[#e8974f]/20 px-2 py-0.5 text-xs font-medium text-[#e8974f]">
                          CTA: {adConfig.cta}
                        </span>
                      )}
                      {adConfig.target_subreddits && adConfig.target_subreddits.length > 0 && (
                        <span className="text-xs text-[#554b66]">
                          Targets: {adConfig.target_subreddits.slice(0, 3).join(', ')}{adConfig.target_subreddits.length > 3 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Campaign & Attribution Info */}
                {sessionData && (
                  <div className="mb-4 grid gap-3 rounded-lg bg-white p-3 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#554b66]">Campaign</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#20132e]">
                        {sessionData.utm_campaign || 'Direct Traffic'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#554b66]">Ad Content ID</p>
                      <p className="mt-0.5 font-mono text-xs text-[#20132e]">
                        {sessionData.utm_content || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#554b66]">Source</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#20132e]">
                        {sessionData.utm_source || 'Organic'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#554b66]">Device / Product</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#20132e]">
                        {sessionData.device_type || '-'} / {sessionData.product_offering}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {getSessionJourney(selectedSession).map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-white p-3"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#d0bdf4]/20 text-xs font-semibold">
                        {step.step_reached}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#20132e]">
                            {step.q1_answer && `Q1: ${step.q1_answer}`}
                            {step.q2_answer && ` → Q2: ${step.q2_answer}`}
                          </span>
                        </div>
                        {step.q3_answer && (
                          <p className="mt-1 text-xs text-[#554b66]">
                            Q3: {step.q3_answer}
                          </p>
                        )}
                        {step.q4_answer && (
                          <p className="text-xs text-[#554b66]">
                            Q4: {step.q4_answer}
                          </p>
                        )}
                        {step.generated_headline && (
                          <p className="mt-1 rounded bg-[#b8e3d6]/20 p-2 text-xs italic text-teal-700">
                            Generated: &ldquo;{step.generated_headline}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-[#554b66]" title={formatFullDateTime(step.visit_time)}>
                        {formatLocalDateTime(step.visit_time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}
          </div>

          {/* Key Insights from Journey Data */}
          <div className="mt-6 rounded-2xl border border-[#20132e]/10 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#20132e]">
              <span className="material-symbols-outlined text-lg">
                insights
              </span>
              Journey Insights
            </h3>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-xl bg-[#fdfbf9] p-4">
                <p className="mb-1 text-xs text-[#554b66]">
                  Top Drop-off Point
                </p>
                <p className="font-display text-xl font-bold text-[#e8974f]">
                  Q2 → Q3
                </p>
                <p className="text-xs text-[#554b66]">
                  Most users abandon at question 3
                </p>
              </div>
              <div className="rounded-xl bg-[#fdfbf9] p-4">
                <p className="mb-1 text-xs text-[#554b66]">
                  Best Converting Device
                </p>
                <p className="font-display text-xl font-bold text-[#b8e3d6]">
                  Desktop
                </p>
                <p className="text-xs text-[#554b66]">
                  Higher modal open rate on desktop
                </p>
              </div>
              <div className="rounded-xl bg-[#fdfbf9] p-4">
                <p className="mb-1 text-xs text-[#554b66]">
                  Most Common Q1 Answer
                </p>
                <p className="font-display text-xl font-bold text-[#d0bdf4]">
                  Fatigue
                </p>
                <p className="text-xs text-[#554b66]">
                  &ldquo;Fatigue that won&apos;t quit&rdquo; leads
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mb-8 rounded-3xl border border-[#20132e]/5 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#d0bdf4]/20">
              <span className="material-symbols-outlined text-[#20132e]">
                filter_alt
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-[#20132e]">
                Conversion Funnel
              </h2>
              <p className="text-sm text-[#554b66]">
                Track visitors through to Beta signup
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-0">
            {/* Page Views */}
            <div className="flex-1 text-center">
              <div
                className="mx-auto flex h-20 items-center justify-center rounded-xl bg-[#d0bdf4]/20"
                style={{ width: '100%' }}
              >
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-[#20132e]">
                    {pageViews.length}
                  </p>
                  <p className="text-xs text-[#554b66]">Page Views</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#554b66]">
                {viewSessions} unique sessions
              </p>
            </div>

            <div className="mx-2 text-2xl text-[#ccc]">→</div>

            {/* CTA Clicks */}
            <div className="flex-1 text-center">
              <div
                className="mx-auto flex h-20 items-center justify-center rounded-xl bg-[#e8974f]/30"
                style={{
                  width: `${Math.max(20, Math.min(100, parseFloat(funnelClickRate) * 2))}%`,
                }}
              >
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-[#20132e]">
                    {clicks.length}
                  </p>
                  <p className="text-xs text-[#554b66]">CTA Clicks</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#554b66]">
                {funnelClickRate}% click rate
              </p>
            </div>

            <div className="mx-2 text-2xl text-[#ccc]">→</div>

            {/* Signups */}
            <div className="flex-1 text-center">
              <div
                className="mx-auto flex h-20 items-center justify-center rounded-xl bg-[#b8e3d6]/40"
                style={{
                  width: `${Math.max(15, Math.min(80, parseFloat(funnelConvRate) * 2))}%`,
                }}
              >
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-teal-700">
                    {filteredData.signups.length}
                  </p>
                  <p className="text-xs text-[#554b66]">Beta Signups</p>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-[#b8e3d6]">
                {funnelConvRate}% of clickers
              </p>
            </div>
          </div>

          {/* Funnel insights */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#20132e]/5 pt-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-[#20132e]">
                {overallConv}%
              </p>
              <p className="text-xs text-[#554b66]">Overall Conversion</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#e8974f]">
                -
              </p>
              <p className="text-xs text-[#554b66]">Avg clicks before signup</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#d0bdf4]">
                -
              </p>
              <p className="text-xs text-[#554b66]">Avg time to signup</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">Total Views</p>
            <p className="font-display text-3xl font-bold text-[#20132e]">
              {pageViews.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">CTA Clicks</p>
            <p className="font-display text-3xl font-bold text-[#20132e]">
              {clicks.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">Signups</p>
            <p className="font-display text-3xl font-bold text-[#b8e3d6]">
              {filteredData.signups.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">Conversion Rate</p>
            <p className="font-display text-3xl font-bold text-[#e8974f]">
              {convRate}
            </p>
          </div>
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">Null Referrer</p>
            <p className="font-display text-3xl font-bold text-[#a4c8d8]">
              {nullReferrerCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#20132e]/5 bg-white p-6">
            <p className="mb-1 text-sm text-[#554b66]">Other Referrer</p>
            <p className="font-display text-3xl font-bold text-[#d0bdf4]">
              {otherReferrerCount}
            </p>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#20132e]/5 bg-white">
          <div className="border-b border-[#20132e]/5 px-6 py-4">
            <h2 className="font-display text-xl font-semibold text-[#20132e]">
              Campaign Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdfbf9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Content
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Signups
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Conv Rate
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Null Referrer
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Other Referrer
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaignData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-[#554b66]"
                    >
                      No data yet. Run some ads!
                    </td>
                  </tr>
                ) : (
                  campaignData.map((c) => {
                    const clickRate =
                      c.views > 0
                        ? ((c.clicks / c.views) * 100).toFixed(1)
                        : '0';
                    const convRateVal =
                      c.clicks > 0
                        ? ((c.signups / c.clicks) * 100).toFixed(1)
                        : '0';

                    return (
                      <tr
                        key={`${c.campaign}|${c.content}`}
                        className="cursor-pointer border-b border-[#20132e]/5 hover:bg-[#f3f0fa]/70"
                        onClick={() =>
                          setReferrerModalData({
                            campaign: c.campaign,
                            content: c.content,
                          })
                        }
                      >
                        <td className="px-6 py-4 font-medium text-[#20132e]">
                          {c.campaign}
                        </td>
                        <td className="px-6 py-4 text-[#554b66]">
                          {c.content}
                        </td>
                        <td className="px-6 py-4 text-right">{c.views}</td>
                        <td className="px-6 py-4 text-right">{c.clicks}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {c.signups}
                        </td>
                        <td
                          className={`px-6 py-4 text-right ${getMetricClass(parseFloat(clickRate), 15, 5)}`}
                        >
                          {clickRate}%
                        </td>
                        <td
                          className={`px-6 py-4 text-right ${getMetricClass(parseFloat(convRateVal), 10, 3)}`}
                        >
                          {convRateVal}%
                        </td>
                        <td className="px-6 py-4 text-right text-[#a4c8d8]">
                          {c.nullReferrer}
                        </td>
                        <td className="px-6 py-4 text-right text-[#d0bdf4]">
                          {c.otherReferrer}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Clicks by Page */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#20132e]/5 bg-white">
          <div className="border-b border-[#20132e]/5 px-6 py-4">
            <h2 className="font-display text-xl font-semibold text-[#20132e]">
              CTA Clicks by Page
            </h2>
            <p className="mt-1 text-sm text-[#554b66]">
              Which buttons are getting clicks on each landing page
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdfbf9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    CTA Button
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Element ID
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {ctaClicksData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[#554b66]"
                    >
                      No CTA clicks recorded yet.
                    </td>
                  </tr>
                ) : (
                  ctaClicksData.map((g) => {
                    const pageColorMap: Record<string, string> = {
                      Homepage: 'bg-[#d0bdf4]/20 text-[#20132e]',
                      'Spoon Saver': 'bg-[#e8974f]/20 text-[#e8974f]',
                      'Flare Forecast': 'bg-[#d0bdf4]/20 text-purple-700',
                      'Top Suspect': 'bg-[#e8974f]/20 text-orange-700',
                      'Crash Prevention': 'bg-[#b8e3d6]/20 text-teal-700',
                    };
                    const pageColor =
                      pageColorMap[g.page] || 'bg-[#f3f0fa] text-[#20132e]';

                    return (
                      <tr
                        key={`${g.page}|${g.elementId}|${g.elementText}`}
                        className="border-b border-[#20132e]/5 hover:bg-[#fdfbf9]/50"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${pageColor}`}
                          >
                            {g.page}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[#20132e]">
                          {g.elementText}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-[#554b66]">
                          {g.elementId}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#20132e]">
                          {g.clicks}
                        </td>
                        <td
                          className={`px-6 py-4 text-right ${getMetricClass(parseFloat(g.percentage), 20, 10)}`}
                        >
                          {g.percentage}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="overflow-hidden rounded-3xl border border-[#20132e]/5 bg-white">
          <div className="flex items-center justify-between border-b border-[#20132e]/5 px-6 py-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#20132e]">
                Recent Signups
              </h2>
              <p className="mt-1 text-sm text-[#554b66]">
                Click on a user to view their complete journey
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#b8e3d6]">
              <span className="material-symbols-outlined text-lg">
                celebration
              </span>
              <span className="font-semibold">
                {filteredData.signups.length}
              </span>
              <span className="text-sm text-[#554b66]">total</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#fdfbf9]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#554b66]">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#554b66]">
                    Journey
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.signups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-[#554b66]"
                    >
                      No signups yet. Keep pushing!
                    </td>
                  </tr>
                ) : (
                  filteredData.signups.slice(0, 20).map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer border-b border-[#20132e]/5 transition-colors hover:bg-[#d0bdf4]/10"
                      onClick={() => setUserJourneyEmail(s.email)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#d0bdf4]/20 text-sm font-semibold text-[#20132e]">
                            {(s.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-[#20132e]">
                            {s.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {s.utm_campaign || 'Direct'}
                      </td>
                      <td className="px-6 py-4 text-[#554b66]">
                        {s.utm_content || '-'}
                      </td>
                      <td className="px-6 py-4 text-[#554b66]">
                        {s.utm_source || 'Direct'}
                      </td>
                      <td className="px-6 py-4 text-[#554b66]">
                        {formatUTCDate(s.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-[#d0bdf4]">
                          View{' '}
                          <span className="material-symbols-outlined text-base">
                            arrow_forward
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#554b66]">
          <p>Last updated: {lastUpdated || '-'}</p>
        </div>
      </div>

      {/* Referrer Modal */}
      {referrerModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#20132e]/95 p-4 backdrop-blur-sm"
          onClick={() => setReferrerModalData(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#20132e]/5 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#20132e]">
                  Referrer Breakdown
                </h2>
                <p className="mt-1 text-sm text-[#554b66]">
                  {referrerModalData.campaign} - {referrerModalData.content}
                </p>
              </div>
              <button
                onClick={() => setReferrerModalData(null)}
                className="rounded-full p-2 transition-colors hover:bg-[#f3f0fa]"
              >
                <span className="material-symbols-outlined text-[#20132e]">
                  close
                </span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {referrerBreakdown.length === 0 ? (
                <p className="py-8 text-center text-[#554b66]">
                  No referrer data available for this campaign.
                </p>
              ) : (
                <div className="space-y-3">
                  {referrerBreakdown.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[#20132e]/5 bg-[#fdfbf9] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-sm text-[#554b66]">Referrer</p>
                        <p className="break-all font-medium text-[#20132e]">
                          {r.referrer === null ? (
                            <span className="italic text-[#554b66]">null</span>
                          ) : (
                            r.referrer
                          )}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="mb-1 text-sm text-[#554b66]">Count</p>
                        <p className="font-display text-2xl font-bold text-[#d0bdf4]">
                          {r.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Journey Modal */}
      {userJourneyEmail && userJourneyData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#20132e]/95 p-4 backdrop-blur-sm"
          onClick={() => setUserJourneyEmail(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#20132e]/5 bg-gradient-to-r from-[#d0bdf4]/10 to-[#b8e3d6]/10 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-[#20132e]">
                  User Journey
                </h2>
                <p className="mt-1 text-sm text-[#554b66]">
                  {userJourneyEmail}
                </p>
              </div>
              <button
                onClick={() => setUserJourneyEmail(null)}
                className="rounded-full p-2 transition-colors hover:bg-[#f3f0fa]"
              >
                <span className="material-symbols-outlined text-[#20132e]">
                  close
                </span>
              </button>
            </div>

            {/* User summary stats */}
            <div className="border-b border-[#20132e]/5 bg-[#fdfbf9] px-6 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-[#20132e]">
                    {userJourneyData.events.length || 1}
                  </p>
                  <p className="text-xs text-[#554b66]">Total Events</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-[#e8974f]">
                    {
                      userJourneyData.events.filter(
                        (e) => e.event_type === 'cta_click'
                      ).length
                    }
                  </p>
                  <p className="text-xs text-[#554b66]">CTA Clicks</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-[#d0bdf4]">
                    {userJourneyData.events.length >= 2
                      ? formatDuration(
                          (new Date(
                            userJourneyData.events[
                              userJourneyData.events.length - 1
                            ].created_at
                          ).getTime() -
                            new Date(
                              userJourneyData.events[0].created_at
                            ).getTime()) /
                            1000
                        )
                      : '-'}
                  </p>
                  <p className="text-xs text-[#554b66]">Time to Signup</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-[#b8e3d6]">
                    {userJourneyData.signup.utm_source || 'Direct'}
                  </p>
                  <p className="text-xs text-[#554b66]">Source</p>
                </div>
              </div>
            </div>

            {/* Journey timeline */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-[#20132e]">
                <span className="material-symbols-outlined text-lg">
                  timeline
                </span>
                Complete Journey
              </h3>
              {userJourneyData.events.length === 0 ? (
                <div>
                  <div className="relative pb-6 pl-8">
                    <div className="absolute inset-y-0 left-2 w-0.5 rounded bg-gradient-to-b from-[#d0bdf4] to-[#b8e3d6]" />
                    <div className="absolute left-0 top-1 size-3 rounded-full border-2 border-white bg-[#b8e3d6] shadow" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-[#20132e]">
                          <span className="material-symbols-outlined text-lg text-[#b8e3d6]">
                            check_circle
                          </span>
                          Beta Signup
                        </p>
                        <p className="mt-1 text-sm text-[#554b66]">
                          {userJourneyData.signup.email}
                        </p>
                      </div>
                      <p className="text-xs text-[#554b66]">
                        {formatUTCDate(userJourneyData.signup.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic text-[#554b66]">
                    Note: Session tracking data not available for this signup.
                  </p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute inset-y-0 left-2 w-0.5 rounded bg-gradient-to-b from-[#d0bdf4] to-[#b8e3d6]" />
                  {userJourneyData.events.map((event, index) => {
                    const isPageView = event.event_type === 'page_view';
                    const isClick = event.event_type === 'cta_click';
                    const isGoogle = event.event_type === 'auth_google_click';
                    const isEmailSignup =
                      event.event_type === 'auth_signup_email';
                    const isSignupComplete =
                      event.event_type === 'signup_complete';

                    const dotColor = isSignupComplete
                      ? 'bg-[#b8e3d6]'
                      : isClick
                        ? 'bg-[#e8974f]'
                        : isGoogle
                          ? 'bg-blue-500'
                          : 'bg-[#d0bdf4]';

                    return (
                      <div
                        key={event.id}
                        className={`relative pb-6 ${index === userJourneyData.events.length - 1 ? 'pb-0' : ''}`}
                      >
                        <div
                          className={`absolute -left-6 top-1 size-3 rounded-full ${dotColor} border-2 border-white shadow`}
                        />
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-2 font-semibold text-[#20132e]">
                              <span
                                className={`material-symbols-outlined text-lg ${
                                  isSignupComplete || isEmailSignup
                                    ? 'text-[#b8e3d6]'
                                    : isClick
                                      ? 'text-[#e8974f]'
                                      : isGoogle
                                        ? 'text-blue-600'
                                        : 'text-[#d0bdf4]'
                                }`}
                              >
                                {isPageView
                                  ? 'visibility'
                                  : isClick
                                    ? 'touch_app'
                                    : isGoogle
                                      ? 'login'
                                      : isEmailSignup
                                        ? 'person_add'
                                        : 'check_circle'}
                              </span>
                              {isPageView
                                ? 'Page View'
                                : isClick
                                  ? 'CTA Click'
                                  : isGoogle
                                    ? 'Google Sign In'
                                    : isEmailSignup
                                      ? '✨ Account Created (Email)'
                                      : '✨ Beta Signup'}
                            </p>
                            <p className="mt-1 truncate text-sm text-[#554b66]">
                              {isPageView
                                ? extractPageName(event.page_url)
                                : (event.element_text || '')
                                    .replace(/arrow_\w*/gi, '')
                                    .replace(/\s+/g, ' ')
                                    .trim() ||
                                  event.element_id ||
                                  'Unknown'}
                            </p>
                            {event.element_id && !isPageView && (
                              <p className="mt-0.5 font-mono text-xs text-[#554b66]/70">
                                {event.element_id}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-[#554b66]">
                              {new Date(event.created_at)
                                .toISOString()
                                .slice(11, 19)}{' '}
                              UTC
                            </p>
                            {index > 0 && (
                              <p className="text-xs font-medium text-[#d0bdf4]">
                                +
                                {formatDuration(
                                  (new Date(event.created_at).getTime() -
                                    new Date(
                                      userJourneyData.events[
                                        index - 1
                                      ].created_at
                                    ).getTime()) /
                                    1000
                                )}
                              </p>
                            )}
                            {index === 0 && (
                              <p className="text-xs text-[#554b66]">Start</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attribution details */}
            <div className="border-t border-[#20132e]/5 bg-[#fdfbf9] px-6 py-4">
              <h4 className="mb-2 text-sm font-semibold text-[#20132e]">
                Attribution
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#554b66]">Campaign:</span>{' '}
                  <span className="font-medium">
                    {userJourneyData.signup.utm_campaign || 'Direct'}
                  </span>
                </div>
                <div>
                  <span className="text-[#554b66]">Content:</span>{' '}
                  <span className="font-medium">
                    {userJourneyData.signup.utm_content || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#554b66]">Landing URL:</span>{' '}
                  <span className="block truncate font-medium">
                    {userJourneyData.signup.landing_url || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#554b66]">Device:</span>{' '}
                  <span className="font-medium">
                    {parseUserAgent(userJourneyData.signup.user_agent)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
