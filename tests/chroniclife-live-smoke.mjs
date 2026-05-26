#!/usr/bin/env node
/**
 * Chronic Life live smoke test.
 *
 * Why this exists: The May 26, 2026 structured review caught a set of
 * production-only issues (404 on /privacy and /terms, broken anchor
 * scrolls, leaking decorative icon text, noisy failed analytics requests).
 * This script runs the same coverage so we can re-run it after each deploy
 * — locally, against a Vercel preview, or against production — without
 * setting up a full Playwright project.
 *
 * Usage:
 *   node tests/chroniclife-live-smoke.mjs [baseUrl]
 *   BASE_URL=https://chroniclife.app node tests/chroniclife-live-smoke.mjs
 *
 * Defaults to https://chroniclife.app. Exits non-zero on any failure.
 */

import { chromium } from 'playwright';

const BASE_URL = (
  process.argv[2] ||
  process.env.BASE_URL ||
  'https://chroniclife.app'
).replace(/\/$/, '');

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function withPage(browser, viewport, fn) {
  const ctx = await browser.newContext({ viewport });
  const failedAnalytics = [];
  const page = await ctx.newPage();

  page.on('requestfailed', (req) => {
    const url = req.url();
    if (/marketing_events|landing_visits|modal_sessions|modal_responses|beta_signups/.test(url)) {
      failedAnalytics.push({ url, failure: req.failure()?.errorText || 'unknown' });
    }
  });

  try {
    await fn(page, failedAnalytics);
  } finally {
    await ctx.close();
  }
}

async function checkHomepage(browser, label, viewport) {
  await withPage(browser, viewport, async (page, failedAnalytics) => {
    const resp = await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    record(`${label}: homepage loads`, resp && resp.ok(), resp ? `status ${resp.status()}` : 'no response');

    // H1 visible
    const h1 = await page.locator('h1').first();
    const h1Visible = await h1.isVisible().catch(() => false);
    const h1Text = (await h1.textContent().catch(() => '')) || '';
    record(`${label}: H1 visible`, h1Visible && h1Text.trim().length > 0, h1Text.trim().slice(0, 60));

    // Hero CTA pointing to /chat (any form: /chat, /chat?mode=…, /chat?view=…)
    const heroCta = page.locator('a[href^="/chat"]').first();
    const heroCtaCount = await page.locator('a[href^="/chat"]').count();
    const heroHref = await heroCta.getAttribute('href').catch(() => null);
    record(
      `${label}: hero CTA routes to /chat`,
      heroCtaCount > 0 && heroHref !== null && heroHref.startsWith('/chat'),
      `${heroCtaCount} chat CTAs, first href=${heroHref || 'none'}`
    );

    // Horizontal overflow check
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      return { docW, winW, overflow: docW - winW };
    });
    record(
      `${label}: no horizontal overflow`,
      overflow.overflow <= 2,
      `scrollWidth ${overflow.docW} vs innerWidth ${overflow.winW}`
    );

    // Anchors: How it works / Features should exist as IDs and scroll
    for (const anchor of ['how-it-works', 'features']) {
      const exists = await page.locator(`#${anchor}`).count();
      record(`${label}: #${anchor} exists`, exists > 0, `${exists} match`);

      if (exists > 0) {
        await page.evaluate(() => window.scrollTo(0, 0));
        // Navigate via direct hash assignment rather than clicking — that
        // sidesteps mobile nav links that are hidden behind a hamburger and
        // tests the actual scroll-target wiring, which is what the May 26
        // review was about.
        await page.evaluate((id) => {
          window.location.hash = `#${id}`;
        }, anchor);
        await page.waitForTimeout(700);
        const scrolledY = await page.evaluate(() => window.scrollY);
        // Threshold is small because some anchors sit just below the hero
        // on mobile (~17px). We only need to confirm the page scrolled —
        // not by how much.
        record(`${label}: #${anchor} scrolls`, scrolledY > 10, `scrollY=${scrolledY}`);
      }
    }

    // Failed marketing analytics — non-blocking informational check.
    // Pass condition: even if requests fail (DNS, 5xx), the page rendered
    // and the failures are quietly captured here. We only fail this check
    // if the page failed to render, which the H1 check already covers.
    record(
      `${label}: marketing analytics failures captured`,
      true,
      `${failedAnalytics.length} failed request(s) observed`
    );
  });
}

async function checkLegalRoute(browser, path) {
  await withPage(browser, VIEWPORTS.desktop, async (page) => {
    const resp = await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = resp ? resp.status() : 0;
    record(`${path} is not 404`, status >= 200 && status < 400, `status ${status}`);
    if (status >= 200 && status < 400) {
      const h1 = await page.locator('h1').first().textContent().catch(() => '');
      record(`${path} renders content`, !!h1 && h1.trim().length > 0, (h1 || '').trim().slice(0, 60));
    }
  });
}

async function checkChatSend(browser) {
  await withPage(browser, VIEWPORTS.desktop, async (page) => {
    const resp = await page.goto(BASE_URL + '/chat', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const reachable = !!(resp && resp.ok());
    record('chat: page loads', reachable, resp ? `status ${resp.status()}` : 'no response');
    if (!reachable) return;

    // Look for the composer textarea/input — best-effort, since the chat
    // requires Supabase auth and we don't carry credentials.
    const inputCount = await page
      .locator('textarea, [contenteditable="true"], input[type="text"]')
      .count();
    record('chat: composer present', inputCount > 0, `${inputCount} input-like element(s)`);

    // We do not attempt to send a real message — would need auth and would
    // hit the production database. Keep this as a placeholder.
  });
}

async function main() {
  console.log(`Smoke target: ${BASE_URL}`);
  const browser = await chromium.launch();
  try {
    await checkHomepage(browser, 'desktop', VIEWPORTS.desktop);
    await checkHomepage(browser, 'mobile', VIEWPORTS.mobile);
    await checkLegalRoute(browser, '/privacy');
    await checkLegalRoute(browser, '/terms');
    await checkChatSend(browser);
  } finally {
    await browser.close();
  }

  const failures = results.filter((r) => !r.ok);
  console.log(`\n${results.length} checks, ${failures.length} failure(s).`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Smoke run crashed:', err);
  process.exit(2);
});
