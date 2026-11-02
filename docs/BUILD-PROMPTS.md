# CheapFly.ca — Phase-Wise Build Prompts

A reusable, copy-paste prompt sequence for building (or rebuilding, extending or cloning) a modern, interactive, responsive, AdSense-ready cheap-flights website for **cheapfly.ca** on the free GitHub Pages plan. Each phase states its **goal**, the **prompt** to give an AI developer, and the **acceptance criteria** to check before moving on. Phases 0–10 produced the site in this repository; Phase 11 is the growth roadmap.

> **Global constraints — paste these at the top of every phase prompt**
> - Domain: `cheapfly.ca` (Canadian audience, en-CA spelling, CAD). Host: GitHub Pages, `main` branch, Jekyll (no server code, no paid services).
> - AdSense publisher ID `ca-pub-6620975821265271`. Put this in the `<head>` of every content page:
>   `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`
> - Top of **every** page: "Interested in this website, domain name, sponsorship, advertisement or partnership? Contact us" → `https://web.works/contact`.
> - All forms and contact links deliver to a single private owner inbox (`[OWNER_INBOX]`). It must **never** appear in HTML, visible text or plain-text source; decode it at runtime only (or use a FormSubmit alias).
> - Avoid trademark/copyright conflicts with "Cheapflights" and any airline/OTA: original brand, colours, logo, text and code; use third-party names only descriptively; include a full trademark/copyright disclosure.
> - Content must be original, accurate, non-thin, policy-safe (no fabricated stats, reviews, testimonials or subscriber counts).

---

## Phase 0 — Strategy & positioning

**Goal:** choose the most profitable model for the domain.

**Prompt:**
> Analyse the domain cheapfly.ca ("cheap fly", Canadian ccTLD). Compare at least five business models (OTA, metasearch, blog, flight-deal alert newsletter, points/credit-card affiliate) on revenue ceiling, time to revenue, defensibility, Google AdSense fit and suitability for a free static host. Recommend one, define the value proposition, target audience, the five revenue streams in priority order, and a 24-month revenue model with conservative/base/bold assumptions. Output `docs/BUSINESS-PLAN.md`.

**Accept when:** one model is chosen with numbers; AdSense is positioned as a floor, not the whole plan.

## Phase 1 — Competitor research (35+ sites)

**Goal:** extract the best features, forms, content, design and monetization patterns.

**Prompt:**
> Visit at least 35 world-class sites in this niche: flight-deal newsletters (Going, Jack's Flight Club, Thrifty Traveler, Secret Flying, The Flight Deal, Next Departure, Canadian deal sites), metasearch/OTAs (Google Flights, Skyscanner, KAYAK, Momondo, Kiwi, Hopper, Expedia, FlightHub), points blogs (Prince of Travel, Frugal Flyer, Milesopedia, The Points Guy, NerdWallet), and passenger-rights resources (CTA/rppa-appr.ca, AirHelp). For each: features, lead-gen mechanics, forms, content types, tools, trust signals, design patterns, monetization, one idea to adopt. Then synthesise a ranked must-have feature list, conversion patterns, UX patterns, Canadian content gaps and a monetization stack. Fact-check changeable data (APPR amounts, airline status, carry-on limits) and run a trademark scan for CHEAPFLY/CHEAP FLY/CHEAPFLIGHTS. Output `docs/COMPETITOR-RESEARCH.md` and `docs/FACT-CHECK.md`, plus `_data/appr.yml` and `_data/carryon.yml`.

**Accept when:** 35+ profiles, synthesis sections, sources noted, unverified items labelled.

## Phase 2 — Information architecture, brand & design system

**Prompt:**
> Design the IA: Home, Price Watch (/deals/), Deal Alerts lead-gen hub (/deal-alerts/), Guides (/guides/), Airports (/airports/ — 16 Canadian airports), Destinations (/destinations/), Tools (/tools/ — 9 tools), Videos, Contests, Support (donations), Careers, Advertise & Partner, About, Contact, FAQ, Privacy, Terms, Cookies, Disclaimer & Trademarks, Editorial Policy, Site Map, 404. Create an original brand: wordmark "CheapFly.ca", a paper-plane logo mark (SVG) on a blue-to-sunset gradient, and a CSS design system with light/dark tokens, Plus Jakarta Sans, boarding-pass-style deal cards, chips, cards, forms, wizard, tabs, modal, toast, FAQ accordion and responsive grid. Mobile-first; no horizontal scroll at 360px; WCAG AA contrast; reduced-motion support.

**Accept when:** tokens defined on `:root`, dark mode works via toggle and system preference, components documented in `assets/css/main.css`.

## Phase 3 — Core templates & global components

**Prompt:**
> Build Jekyll layouts (`default`, `page`, `guide`, `airport`, `destination`, `tool`) and includes: head (SEO title/description, canonical, Open Graph/Twitter, JSON-LD for Organization, WebSite, Article, FAQPage and BreadcrumbList, AdSense script, optional GA4), the business top bar, a sticky header with dropdowns and an accessible mobile drawer, a footer with newsletter capture, a legal/trademark notice, a cookie notice, an exit-intent modal (desktop only, rate-limited) and a toast. Use `relative_url` everywhere and leave `url`/`baseurl` unset so the site works on both `*.github.io/cheapfly-ca/` and `cheapfly.ca`.

**Accept when:** zero broken internal links on both base paths; top bar on every page; skip-link and keyboard navigation work.

## Phase 4 — Lead-generation engine

**Prompt:**
> Build a dedicated, high-converting `/deal-alerts/` page: a 4-step wizard (home airports multi-select up to 3 → dream regions → months, budget slider, travellers, cabin, alert frequency → name, email, province, optional phone, CASL express-consent checkbox, optional Pro waitlist), with a progress bar, validation and a success state. Add tabbed secondary funnels: Group & Event Travel Quote, Vacation Concierge, and Travel Business Partner application, each with explicit consent to share with one vetted partner. Add quick-capture forms in the hero, the footer band, inline in guides (mid-article and end), the sidebar and the exit-intent modal. Prefill from URL params (`?from=YYZ&to=CUN`). Deliver all forms through FormSubmit AJAX to the decoded private inbox, with honeypot spam protection, `_subject`/`_template`/`_replyto`, and a mailto fallback if the service is unreachable.

**Accept when:** every form posts the correct payload (test with a network mock), the success state shows, and the inbox never appears in page source.

## Phase 5 — Content engine

**Prompt:**
> Write original, accurate, Canadian-specific content as Markdown collections with YAML front matter: 18 long-form guides (1,200–1,700 words: booking windows, cheapest days/months, mistake fares, APPR passenger rights, Canadian budget airlines, US border airports, Aeroplan, travel credit cards, hidden-city and advanced hacks, last-minute, carry-on only, Google Flights tutorial, all-inclusive deals, student travel, travel insurance, flying with kids, stopovers), 16 airport pages (YYZ, YVR, YUL, YYC, YEG, YOW, YHZ, YWG, YQB, YYJ, YLW, YXE, YQR, YYT, YTZ, YHM) and 16 destination pages. Each page gets a quick-answer section, tables and callouts where useful, 3–6 internal links, one /deal-alerts/ CTA, and 4–6 FAQs (rendered with FAQPage schema). Build `_data/routes.yml` (80+ routes with deal threshold, typical range, best months, flight time, nonstop flag, optional warning) to drive the price watch, airport and destination pages. Verify changeable facts; hedge prices; never fabricate statistics or reviews.

**Accept when:** word counts met, YAML valid, every destination appears in routes at least twice, outdated facts flagged.

## Phase 6 — Interactive tools

**Prompt:**
> Build nine client-side tools, each on its own page with 300+ words of explanatory content and FAQs: (1) multi-engine flight search deep-linking to Google Flights, Skyscanner, KAYAK, Expedia and Momondo, with "compare on" links; (2) APPR delay/cancellation/denied-boarding compensation calculator driven by `_data/appr.yml`, with claim deadline; (3) best-time-to-book advisor with timeline and peak-season detection; (4) trip budget planner with a donut chart and monthly savings target; (5) flight distance, time and CO2 calculator using a 200-airport dataset; (6) points value calculator with verdicts; (7) carry-on size checker against `_data/carryon.yml`; (8) currency converter with live rates and offline fallback; (9) searchable airport code finder.

**Accept when:** every tool renders a result on load and on input, with no console errors.

## Phase 7 — Monetization surfaces

**Prompt:**
> Add: `ads.txt` (`google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`); config-driven manual ad slots (top, in-content after the 2nd section, sidebar, bottom) that render only when slot IDs exist; a Support page (allocation bars for operations, talent, promotion, contests and prizes, plus features; four tiers; a pledge form; optional PayPal/Stripe/Ko-fi/BMC buttons from config; a not-a-charity disclosure); a Contests page (three skill-based contests, a Canadian-compliant rules summary with a skill-testing question, no purchase necessary, an entry/notify form, a sponsor CTA); a Careers page (six remote roles and an application form); an Advertise & Partner page (placements, indicative packages, standards, a media-kit form, a domain-acquisition callout); and a Video hub (data-driven privacy-enhanced lite embeds, topic launchers and a creator submission form).

**Accept when:** all forms deliver; ads never render empty boxes; no ads on 404/noindex pages.

## Phase 8 — Trust, legal & AdSense compliance

**Prompt:**
> Write a PIPEDA/CASL-aware Privacy Policy (with the required Google AdSense third-party cookie disclosures and opt-out links), Terms of Use, Cookie Policy (table), Disclaimer & Trademark Notice (independence, descriptive use of "cheap fly", explicit non-affiliation, third-party marks, copyright), Editorial Policy (sources, AI-assisted drafting disclosure, labelling, corrections), About, Contact (form plus runtime-decoded mailto) and FAQ. Ensure AdSense policy fit: original content, clear navigation, no click encouragement, labelled ads, no ads on thin pages, and recommend Google's certified CMP for EEA/UK visitors.

**Accept when:** legal pages are linked in the footer of every page and dated.

## Phase 9 — QA, performance, SEO & accessibility

**Prompt:**
> Generate `sitemap.xml`, `robots.txt` (with sitemap), an RSS feed, a web manifest, favicons and a 1200×630 OG image. Run automated checks: Jekyll build with no warnings; internal-link checker; a scan for Liquid leftovers and inbox exposure; a Playwright run across every page for console errors, top-bar presence, tool outputs, search deep links, form payloads (mocked network) and wizard validation; mobile overflow at 390px; visual review of desktop and mobile screenshots. Fix everything found.

**Accept when:** 0 broken links, 0 JS errors, no horizontal scroll, all forms pass.

## Phase 10 — Deploy & apply

**Prompt:**
> Push to `github.com/webworksa1/cheapfly-ca` on `main`. Enable GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root). Add the custom domain `cheapfly.ca` with DNS A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (plus AAAA 2606:50c0:8000::153 to 2606:50c0:8003::153) and a `www` CNAME to `webworksa1.github.io`; tick "Enforce HTTPS". Activate FormSubmit with a test submission, then paste its alias into `_config.yml`. Verify the domain in Google Search Console, submit the sitemap, then apply to AdSense on the custom domain and enable its Privacy & messaging (CMP) for EEA/UK.

**Accept when:** https://cheapfly.ca serves the site, forms arrive in the inbox, and AdSense shows "Getting ready" / "Ready".

## Phase 11 — Growth & expansion roadmap

**Prompt:**
> Expand the site without breaking the architecture: (a) connect an email service provider (MailerLite/Beehiiv/Brevo) and automate the weekly digest; (b) generate programmatic airport×destination pages from `_data/routes.yml`; (c) launch a French (fr-CA) edition for Québec; (d) add affiliate links (hotels, travel insurance, eSIM, cards) with disclosure; (e) open the first sponsor-funded contest; (f) launch CheapFly Pro (CA$49/yr) for business-class and points deals; (g) publish two guides a week and refresh deal thresholds monthly; (h) post the week's best deal as a YouTube Short linking to /deal-alerts/.

**Accept when:** each addition ships with content, internal links, sitemap coverage and tests.
