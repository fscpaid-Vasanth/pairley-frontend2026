/**
 * SEO.jsx — Reusable Per-Page SEO Component (Step 10)
 * Uses react-helmet-async for dynamic head management in React 19 + Vite 8.
 *
 * Usage:
 *   import SEO from '../components/SEO';
 *   <SEO title="Page Title" description="..." />
 */

import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.pairley.com';
const SITE_NAME = 'Pairley';
const DEFAULT_TITLE = 'Pairley | Buy Together. Save Together.';
const DEFAULT_DESCRIPTION =
  "Pairley is India's smart local group-buying marketplace where customers discover exclusive offers from restaurants, gyms, salons, retail stores and local businesses. Join deals together and save more.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const DEFAULT_KEYWORDS =
  'Pairley, group buying India, buy together save together, group deals, restaurant offers, gym memberships, salon deals, retail discounts, local business deals';

/**
 * @param {object} props
 * @param {string} [props.title]           — Page <title>. Appended with " | Pairley" unless standalone=true
 * @param {string} [props.description]     — Meta description (max 160 chars recommended)
 * @param {string} [props.keywords]        — Additional keywords merged with defaults
 * @param {string} [props.canonical]       — Canonical URL (defaults to current path)
 * @param {string} [props.ogImage]         — OG image URL (defaults to /og-image.png)
 * @param {string} [props.ogType]          — OG type (default: 'website')
 * @param {boolean} [props.noIndex]        — true = noindex, nofollow (for private pages)
 * @param {boolean} [props.standalone]     — true = use title as-is without suffix
 * @param {string} [props.structuredData]  — JSON-LD string for page-specific schema
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = '',
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  standalone = false,
  structuredData,
}) {
  const pageTitle = title
    ? standalone
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const robotsContent = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  const mergedKeywords = keywords
    ? `${DEFAULT_KEYWORDS}, ${keywords}`
    : DEFAULT_KEYWORDS;

  return (
    <Helmet>
      {/* Title */}
      <title>{pageTitle}</title>

      {/* Core Meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content={mergedKeywords} />
      <meta name="robots" content={robotsContent} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pairley" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {/* JSON-LD Page-Specific Structured Data */}
      {structuredData && (
        <script type="application/ld+json">{structuredData}</script>
      )}
    </Helmet>
  );
}
