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
  created_at: string;
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

      setLastUpdated(
        new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
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

    return {
      events: allEvents.filter(filterFn),
      signups: allSignups.filter(filterFn),
      landingVisits: allLandingVisits.filter(filterFn),
      modalSessions: allModalSessions.filter(filterFn),
      modalResponses: allModalResponses.filter(filterFn),
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

  // CTA clicks breakdown
  const ctaClicksData = useMemo(() => {
    const authGoogleClicks = filteredData.events.filter(
      (e) => e.event_type === 'auth_google_click'
    );
    const authEmailSignups = filteredData.events.filter(
      (e) => e.event_type === 'auth_signup_email'
    );
    const allClicks = [...clicks, ...authGoogleClicks, ...authEmailSignups];
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
  }, [clicks, filteredData.events]);

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
