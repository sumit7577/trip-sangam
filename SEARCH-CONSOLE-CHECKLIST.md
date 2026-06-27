# Google Search Console — Setup & Monitoring Checklist

For **tripsangam.com** / TripSangam Travels. Do these in order after the SEO changes are deployed.

## 1. Verify the domain property
1. Go to <https://search.google.com/search-console> → **Add property** → choose **Domain** (not URL-prefix) → enter `tripsangam.com`.
2. Google gives a **TXT record**. Add it to the domain's DNS (at your domain registrar) → **Verify**.
   - Domain property covers http/https + www/non-www automatically.

## 2. Submit the sitemap
- Search Console → **Sitemaps** → enter `sitemap.xml` → **Submit**.
- Full URL: <https://tripsangam.com/sitemap.xml>. Confirm status becomes **Success** and pages are discovered.

## 3. Inspect important URLs (URL Inspection tool)
For each URL: paste it → **Test live URL** → confirm “URL is on Google” or “available to Google” → **Request indexing**.
Priority order:
1. `https://tripsangam.com/`
2. `https://tripsangam.com/nepal-tour-packages/`
3. `https://tripsangam.com/nepal-tour-package-from-raxaul/`
4. `https://tripsangam.com/raxaul-to-kathmandu-travel/`
5. `https://tripsangam.com/contact/`
6. `https://tripsangam.com/packages/`
7. Each individual `/packages/<slug>/`

## 4. Request indexing after meaningful updates
After publishing new content or major edits, use **URL Inspection → Request indexing**. Don't spam it for tiny changes.

## 5. Page Indexing report
- **Indexing → Pages**: watch “Not indexed” reasons. Expected excluded: `/account/`, `/trips/`, `/preview/` (intentional `noindex`), `/api/`.
- Investigate anything important marked “Crawled – currently not indexed” or “Discovered – not indexed”.

## 6. Core Web Vitals
- **Experience → Core Web Vitals**: check Mobile & Desktop. Aim: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Cross-check with [PageSpeed Insights](https://pagespeed.web.dev/) on the homepage and a package page.

## 7. HTTPS report
- **Experience → HTTPS**: confirm pages are served over HTTPS with no issues.

## 8. Manual actions & security
- **Security & Manual actions → Manual actions**: should say “No issues detected”.

## 9. Monitor queries & clicks
- **Performance → Search results**: track impressions, clicks, average position for the target keywords (Raxaul to Kathmandu, Nepal tour package from Raxaul, etc.). Review weekly at first.

## 10. Find pages with impressions but low CTR
- Performance → add **Query** + **Page**, sort by Impressions, look for high-impression / low-CTR rows → improve those titles & meta descriptions.

## Also recommended
- **Google Business Profile** (separate from Search Console): create/claim a free profile for “TripSangam Travels, Raxaul” — the single biggest lever for local searches like “Nepal travel agency in Raxaul”. Keep the name, area and phone identical to the website.
- **Bing Webmaster Tools**: you can import the property from Search Console in a few clicks.
