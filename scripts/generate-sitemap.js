#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml with one <url> entry per live ACTIVE
 * offer, appended after the hand-authored static pages.
 *
 * Launch-audit finding: the sitemap only ever listed static marketing
 * pages — zero /deals/:id URLs — so Google had no direct, high-confidence
 * way to discover individual deal pages, only whatever it happened to
 * crawl via links from /deals.
 *
 * Runs as `prebuild` (see package.json), so every production build picks
 * up whatever is ACTIVE at build time. Deliberately fault-tolerant: if the
 * API is unreachable or returns something unexpected, this leaves the
 * existing sitemap.xml untouched and exits 0 rather than failing the
 * build — a stale sitemap is a minor SEO issue; a build that can't deploy
 * because an SEO script's HTTP call flaked is a much worse one.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = 'https://pairley-backend2026.onrender.com/api/offers/list';
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');
const STATIC_MARKER = '</urlset>';
export const GENERATED_START = '  <!-- BEGIN generated deal URLs (scripts/generate-sitemap.js) -->';
export const GENERATED_END = '  <!-- END generated deal URLs -->';

// Exported for generate-sitemap.test.js — this is the exact logic that
// silently broke idempotency (see the comment in main() below), so it's
// tested as a pure function rather than only re-verified by hand.
export function stripGeneratedBlock(xml) {
  const startIdx = xml.indexOf(GENERATED_START);
  const endIdx = xml.indexOf(GENERATED_END);
  if (startIdx === -1 || endIdx === -1) return xml.trim();
  return (
    xml.slice(0, startIdx) + xml.slice(endIdx + GENERATED_END.length)
  ).trim();
}

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function dealEntry(offer) {
  const image = offer.cover_image || offer.offer_image;
  const lastmod = new Date(offer.updated_at || offer.created_at)
    .toISOString()
    .slice(0, 10);
  return [
    '  <url>',
    `    <loc>https://www.pairley.com/deals/${offer.id}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>daily</changefreq>',
    '    <priority>0.8</priority>',
    ...(image
      ? [
          '    <image:image>',
          `      <image:loc>${escapeXml(image)}</image:loc>`,
          `      <image:title>${escapeXml(offer.title)}</image:title>`,
          '    </image:image>',
        ]
      : []),
    '  </url>',
  ].join('\n');
}

async function main() {
  const existing = fs.readFileSync(SITEMAP_PATH, 'utf-8');

  // Idempotent — strip any previously-generated block before regenerating,
  // so re-running this script (or a re-run build) never duplicates entries.
  const withoutGenerated = stripGeneratedBlock(existing);

  let offers;
  try {
    const res = await fetch(API_URL, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    offers = await res.json();
    if (!Array.isArray(offers)) throw new Error('Unexpected response shape');
  } catch (err) {
    console.warn(
      `[sitemap] Could not fetch live offers (${err.message}) — leaving sitemap.xml as-is.`,
    );
    return;
  }

  if (offers.length === 0) {
    console.warn('[sitemap] No ACTIVE offers returned — leaving sitemap.xml as-is.');
    return;
  }

  const generatedBlock = [
    GENERATED_START,
    ...offers.map(dealEntry),
    GENERATED_END,
  ].join('\n');

  const output = withoutGenerated.replace(
    STATIC_MARKER,
    `\n${generatedBlock}\n\n${STATIC_MARKER}`,
  );

  fs.writeFileSync(SITEMAP_PATH, output);
  console.log(`[sitemap] Added ${offers.length} deal URL(s) to sitemap.xml.`);
}

// Only auto-run when executed directly (`node scripts/generate-sitemap.js`
// or the `prebuild` hook) — not when imported for testing.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    // Same fault-tolerance as the fetch failure above — never fail the
    // build over the sitemap.
    console.warn(`[sitemap] Skipped: ${err.message}`);
  });
}
